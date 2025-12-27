import { VendorMemory } from "../memory/VendorMemory";
import { ResolutionMemory } from "../memory/ResolutionMemory";
import { CorrectionMemory } from "../memory/CorrectionMemory";
import { DecisionEngine } from "../decision/DecisionEngine";
import { DuplicateDetector } from "../rules/DuplicateDetector";
import { ServiceDateMapper } from "../rules/ServiceDateMapper";
import { VatRecalculator } from "../rules/VatRecalculator";
import { CurrencyExtractor } from "../rules/CurrencyExtractor";
import { SkontoDetector } from "../rules/SkontoDetector";
import { SkuMapper } from "../rules/SkuMapper";
import { PoMatcher } from "../rules/PoMatcher";
import { Database } from "../persistence/Database";
import { ReferenceData, ExtractedInvoice } from "./types";
import { AgentConfig } from "../config/agentConfig";

export class MemoryLayer {
  private duplicateDetector: DuplicateDetector;

  constructor(
    public readonly vendorMem: VendorMemory,
    public readonly resolutionMem: ResolutionMemory,
    public readonly correctionMem: CorrectionMemory,
    private decisionEngine: DecisionEngine,
    db: Database,
    private referenceData: ReferenceData
  ) {
    this.duplicateDetector = new DuplicateDetector(db);
  }

  async process(invoice: any): Promise<any> {
    const auditTrail: any[] = [];
    const proposedCorrections: string[] = [];
    const memoryUpdates: string[] = [];
    let confidenceScore = 0;

    
    const vendorPatterns = await this.vendorMem.recall(invoice.vendor);
    const correctionRules = await this.correctionMem.recall(invoice.vendor);

    auditTrail.push({
      step: "recall",
      timestamp: new Date().toISOString(),
      details: `Recalled ${vendorPatterns.length} vendor patterns and ${correctionRules.length} correction rules`
    });

    
    const duplicate = await this.duplicateDetector.check(invoice);
    if (duplicate.isDuplicate) {
      return {
        normalizedInvoice: invoice.fields,
        proposedCorrections: ["Duplicate invoice detected"],
        requiresHumanReview: true,
        reasoning: "Duplicate detected using vendor + invoice number + amount",
        confidenceScore: duplicate.confidence ?? 0,
        memoryUpdates: ["Duplicate detected — learning skipped"],
        auditTrail
      };
    }

    
    if (!invoice.fields.serviceDate) {
      const sd = ServiceDateMapper.extract(invoice.rawText);
      if (sd) {
        invoice.fields.serviceDate = sd;
        proposedCorrections.push("Filled serviceDate from Leistungsdatum");
        confidenceScore = Math.max(
          confidenceScore,
          AgentConfig.confidence.SERVICE_DATE_FILL
        );
      }
    }

    
    if (VatRecalculator.recompute(invoice.rawText, invoice.fields)) {
      proposedCorrections.push("Recomputed VAT (VAT included in total)");
      confidenceScore = Math.max(
        confidenceScore,
        AgentConfig.confidence.VAT_RECOMPUTE
      );
    }

    
    if (!invoice.fields.currency) {
      const currency = CurrencyExtractor.extract(invoice.rawText);
      if (currency) {
        invoice.fields.currency = currency;
        proposedCorrections.push(`Recovered currency from text: ${currency}`);
        confidenceScore = Math.max(
          confidenceScore,
          AgentConfig.confidence.CURRENCY_RECOVERY
        );
      }
    }

    
    const skonto = SkontoDetector.detect(invoice.rawText);
    if (skonto) {
      proposedCorrections.push(`Detected skonto terms: ${skonto}`);
      confidenceScore = Math.max(
        confidenceScore,
        AgentConfig.confidence.SKU_MAPPING
      );
    }

    
    for (const item of invoice.fields.lineItems ?? []) {
      if (!item.sku && item.description) {
        const sku = SkuMapper.map(item.description);
        if (sku) {
          item.sku = sku;
          proposedCorrections.push(`Mapped description to SKU: ${sku}`);
          confidenceScore = Math.max(
            confidenceScore,
            AgentConfig.confidence.SKU_MAPPING
          );
        }
      }
    }

    
    const po = PoMatcher.match(
      invoice.vendor,
      invoice.fields.lineItems,
      this.referenceData.purchaseOrders
    );

    if (po) {
      proposedCorrections.push(`Matched PO: ${po}`);
      confidenceScore = Math.max(
        confidenceScore,
        AgentConfig.confidence.PO_MATCH
      );
    }

    
    const resolutions = await this.resolutionMem.recall(invoice.vendor);
    if (resolutions.length > 0) {
      const approvalRate =
        resolutions.filter(r => r.outcome === "approved").length /
        resolutions.length;

      confidenceScore += approvalRate >= 0.7
        ? AgentConfig.reinforcement.POSITIVE
        : -AgentConfig.reinforcement.NEGATIVE;

      auditTrail.push({
        step: "apply",
        timestamp: new Date().toISOString(),
        details: `Resolution memory applied (approval rate ${approvalRate.toFixed(2)})`
      });
    }

    
    confidenceScore = Math.max(
      AgentConfig.confidence.MIN,
      Math.min(AgentConfig.confidence.MAX, confidenceScore)
    );

    const decision = this.decisionEngine.decide(confidenceScore);

    auditTrail.push({
      step: "decide",
      timestamp: new Date().toISOString(),
      details: decision.decision
    });

    await this.duplicateDetector.record(invoice);

    auditTrail.push({
      step: "learn",
      timestamp: new Date().toISOString(),
      details: "Rules applied; confidence adjusted"
    });

    memoryUpdates.push(`Final confidence score: ${confidenceScore.toFixed(2)}`);

    return {
      normalizedInvoice: invoice.fields,
      proposedCorrections,
      requiresHumanReview: decision.requiresHumanReview,
      reasoning: decision.requiresHumanReview
        ? "Confidence below auto-accept threshold"
        : "High confidence based on learned patterns and reference data",
      confidenceScore: Number(confidenceScore.toFixed(2)),
      memoryUpdates,
      auditTrail
    };
  }

  
  async learnFromDecision(
    invoice: ExtractedInvoice,
    corrections: string[],
    humanDecision: "approved" | "rejected"
  ) {
    if (humanDecision === "approved") {
      for (const c of corrections) {
        await this.correctionMem.learn(
          invoice.vendor,
          c,
          0.8
        );
      }
    }

    await this.resolutionMem.learn(
      invoice.vendor,
      humanDecision
    );
  }
}
