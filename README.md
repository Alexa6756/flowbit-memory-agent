# Flowbit Memory Agent — Learned Memory for Invoice Processing

## Overview

This project implements a **memory-driven AI agent layer** for invoice processing.  
The system focuses on **learning from past human decisions and recurring vendor patterns**, instead of treating every invoice as a new, isolated case.

The solution is intentionally **heuristic-based and explainable**, as required by the assignment.  
No machine learning models are trained — learning is achieved through **persistent memory, confidence evolution, and human feedback**.

---

## Problem Statement

A company processes hundreds of invoices daily.  
Many issues repeat across invoices:

- Vendor-specific labels (e.g. *Leistungsdatum*)
- VAT inclusion behavior
- Missing currencies
- Repeated SKU mappings
- Duplicate invoices

In traditional systems, these corrections are **lost after manual review**.  
This project solves that by introducing a **Memory Layer** that:

- Remembers past corrections
- Applies them to future invoices
- Adjusts confidence over time
- Remains fully auditable and explainable

---

## Key Design Principles

- Learning over time through persistent memory
- Human-in-the-loop (no blind auto-learning)
- Explainability first (every decision has a reason)
- No vendor hardcoding
- No ML training (heuristics explicitly allowed)

---

## Architecture Overview

```

Invoice (extracted data)
↓
Memory Layer
├── Vendor Memory
├── Correction Memory
├── Resolution Memory
├── Rule Engine
├── Confidence Manager
└── Duplicate Detector
↓
Decision Engine
↓
Structured JSON Output

````

All memory is **persisted in SQLite** and reused across runs.

---

## Memory Types Implemented

### 1. Vendor Memory
Stores recurring vendor-specific patterns and behaviors.

**Examples**
- “Leistungsdatum” → serviceDate
- Vendor-specific VAT behavior

**Purpose**
- Faster normalization for recurring vendors
- Reduced manual intervention

---

### 2. Correction Memory
Learns from **repeated human-approved corrections**.

**Examples**
- Service date extraction corrections
- SKU mappings (e.g. FREIGHT)
- VAT recomputation logic
- Skonto detection

**Behavior**
- Corrections are stored only after human approval
- Recalled before future decisions
- Confidence evolves via reinforcement and decay

---

### 3. Resolution Memory
Tracks how discrepancies were resolved.

**Tracks**
- Approved vs rejected outcomes
- Approval rate per vendor

**Effect**
- Boosts confidence for reliable vendors
- Reduces confidence after repeated rejections
- Prevents bad learnings from dominating

---

## Decision Logic

For each invoice, the system performs:

1. **Recall Memory**
   - Vendor memory
   - Correction memory
   - Resolution history

2. **Apply Memory & Rules**
   - Normalize fields
   - Suggest corrections
   - Adjust confidence score

3. **Decide**
   - Auto-accept
   - Escalate for human review

4. **Learn**
   - Store corrections on approval
   - Reinforce or weaken memory
   - Maintain full audit trail

Low-confidence memory is **never auto-applied**.

---

## Confidence Handling

- Confidence is accumulated from:
  - Rule confidence
  - Vendor behavior
  - Resolution history
- Reinforcement and decay are applied over time
- Confidence is bounded and explainable

This ensures the system becomes **more confident only when justified**.

---

## Duplicate Protection

Duplicate invoices are detected using:
- Vendor
- Invoice number
- Date
- Total amount

**Important behavior**
- Duplicate invoices are escalated
- Learning is skipped
- Prevents contradictory or corrupt memory

---

## Output Contract

Each invoice produces the following structured JSON:

```json
{
  "normalizedInvoice": { "...": "..." },
  "proposedCorrections": [ "..." ],
  "requiresHumanReview": true,
  "reasoning": "Explain why memory was applied and why actions were taken",
  "confidenceScore": 0.0,
  "memoryUpdates": [ "..." ],
  "auditTrail": [
    {
      "step": "recall|apply|decide|learn",
      "timestamp": "...",
      "details": "..."
    }
  ]
}
````

All decisions are fully auditable.

---

## Demo: Learning Over Time

The demo script demonstrates real learning across runs.

### Demo Flow

1. Run Invoice #1

   * Issues detected
   * Human approves corrections
   * Memory stored

2. Run Invoice #2 (same vendor)

   * Fewer corrections
   * Higher confidence
   * Auto-accept

3. Rejection scenario

   * Confidence decays appropriately

4. Duplicate invoice

   * Detected and escalated
   * Learning skipped

---

## Technology Stack

* Language: TypeScript (strict mode)
* Runtime: Node.js
* Persistence: SQLite
* Architecture: Modular, rule-driven, memory-based

---

## How to Run

```bash
npm install
rm demo.db
npm run demo
```

---

## Design Notes & Limitations

* Learning is human-driven, not autonomous
* Heuristics are used intentionally for clarity
* Confidence decay is applied via resolution memory
* No ML models are trained (per assignment guidance)

---

