export interface Invoice {
  invoiceId: string;
  vendor: string;
  rawText: string;
  extractedFields: Record<string, any>;
}

export interface AuditStep {
  step: "recall" | "apply" | "decide" | "learn";
  timestamp: string;
  details: string;
}

export interface AgentOutput {
  normalizedInvoice: Record<string, any>;
  proposedCorrections: string[];
  requiresHumanReview: boolean;
  reasoning: string;
  confidenceScore: number;
  memoryUpdates: string[];
  auditTrail: AuditStep[];
}
