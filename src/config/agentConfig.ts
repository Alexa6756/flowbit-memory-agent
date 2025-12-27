export const AgentConfig = {
  
  confidence: {
    AUTO_ACCEPT_THRESHOLD: 0.75,

    SERVICE_DATE_FILL: 0.8,
    VAT_RECOMPUTE: 0.85,
    SKU_MAPPING: 0.8,
    CURRENCY_RECOVERY: 0.75,
    PO_MATCH: 0.9,

    MIN: 0.2,
    MAX: 1.0
  },

  decay: {
    VENDOR_MEMORY: 0.97,
    CORRECTION_MEMORY: 0.96,
    RESOLUTION_MEMORY: 0.95
  },

  reinforcement: {
    POSITIVE: 0.1,
    NEGATIVE: 0.1,

    BASE_APPROVAL: 0.6,
    BASE_REJECTION: 0.4
  },
  DUPLICATE: {
  BASE: 0.6,
  DATE_MATCH_BONUS: 0.2,
  AMOUNT_MATCH_BONUS: 0.2,
  THRESHOLD: 0.8
}
,


  patterns: {
    SERVICE_DATE_LABELS: [
      /Leistungsdatum[:\s]+([\d.]+)/i
    ],

    VAT_INCLUDED: [
      /VAT already included/i,
      /MwSt\. inkl/i
    ],

    FREIGHT_KEYWORDS: [
      /transport/i,
      /shipping/i,
      /freight/i
    ]
  }
  
};
