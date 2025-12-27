export interface ExtractedInvoice {
  invoiceId: string;
  vendor: string;
  fields: InvoiceFields;
  confidence: number;
  rawText: string;
}

export interface InvoiceFields {
  invoiceNumber: string;
  invoiceDate: string;
  serviceDate?: string | null;
  currency?: string | null;
  netTotal: number;
  taxRate: number;
  taxTotal: number;
  grossTotal: number;
  lineItems: LineItem[];
  [key: string]: any;
}

export interface LineItem {
  sku?: string;
  description?: string;
  qty: number;
  unitPrice: number;
}

export interface ReferenceData {
  purchaseOrders: PurchaseOrder[];
  deliveryNotes: DeliveryNote[];
}

export interface PurchaseOrder {
  poNumber: string;
  vendor: string;
  date: string;
  lineItems: LineItem[];
}

export interface DeliveryNote {
  dnNumber: string;
  vendor: string;
  poNumber: string;
  lineItems: LineItem[];
}


export interface VendorPattern {
  vendor: string;
  sourcePattern: string;
  targetField: string;
  normalizedValue?: string;
  confidence: number;
  occurrences: number;
  lastUsed: Date;
}

export interface CorrectionRule {
  vendor?: string;
  triggerField: string;
  triggerValue?: string;
  correctionType: string;
  correctionAction: string;
  confidence: number;
  successCount: number;
  totalApplied: number;
}

export interface ResolutionRecord {
  invoiceId: string;
  vendor: string;
  issueType: string;
  humanDecision: 'approved' | 'rejected';
  correctionApplied?: string;
}


export interface CorrectionSuggestion {
  field: string;
  originalValue: any;
  suggestedValue: any;
  confidence: number;
  reason: string;
  sourceMemory?: string;
}

export interface MemoryResponse {
  normalizedInvoice: ExtractedInvoice;
  proposedCorrections: CorrectionSuggestion[];
  requiresHumanReview: boolean;
  reasoning: string;
  confidenceScore: number;
  memoryUpdates: string[];
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  step: 'recall' | 'apply' | 'decide' | 'learn';
  timestamp: string;
  details: string;
}

export interface HumanCorrection {
  field: string;
  value: any;
  source?: string;
}


export interface DecisionResult {
  requiresHumanReview: boolean;
  reasoning: string;
  confidenceScore: number;
  action: 'auto-accept' | 'auto-correct' | 'escalate';
}