import { Database } from "../src/persistence/Database";
import { VendorMemory } from "../src/memory/VendorMemory";
import { ResolutionMemory } from "../src/memory/ResolutionMemory";
import { CorrectionMemory } from "../src/memory/CorrectionMemory";
import { DecisionEngine } from "../src/decision/DecisionEngine";
import { MemoryLayer } from "../src/core/MemoryLayer";

import invoices from "../data/invoices_extracted.json";
import referenceData from "../data/reference_data.json";

(async () => {
  console.log("\n=== Flowbit Learning Demo ===\n");

  const db = new Database();

  const memoryLayer = new MemoryLayer(
    new VendorMemory(db),
    new ResolutionMemory(db),
    new CorrectionMemory(db), 
    new DecisionEngine(),
    db,
    referenceData
  );

  console.log("\n--- RUN 1: Supplier GmbH (Initial) ---");
  let result = await memoryLayer.process(invoices[0]);
  console.log(JSON.stringify(result, null, 2));

  console.log("\nHuman approved invoice → learning stored\n");

  await memoryLayer.learnFromDecision(
    invoices[0],
    result.proposedCorrections,
    "approved"
  );

  console.log("\n--- RUN 2: Supplier GmbH (Memory Applied) ---");
  result = await memoryLayer.process(invoices[1]);
  console.log(JSON.stringify(result, null, 2));

  console.log("\nHuman rejected incorrect auto-accept → confidence decay\n");

  await memoryLayer.learnFromDecision(
    invoices[1],
    result.proposedCorrections,
    "rejected"
  );

  console.log("\n--- RUN 3: Supplier GmbH (PO-A-051 Match) ---");
  result = await memoryLayer.process(invoices[2]);
  console.log(JSON.stringify(result, null, 2));

  console.log("\n--- RUN 4: Parts AG (VAT + Currency Recovery) ---");
  result = await memoryLayer.process(invoices[3]);
  console.log(JSON.stringify(result, null, 2));

  console.log("\n--- RUN 5: Freight & Co (Skonto + FREIGHT SKU) ---");
  result = await memoryLayer.process(invoices[4]);
  console.log(JSON.stringify(result, null, 2));

  console.log("\n--- RUN 6: Duplicate Detection ---");
  result = await memoryLayer.process(invoices[5]);
  console.log(JSON.stringify(result, null, 2));

  console.log("\n=== Demo Complete ===\n");
})();
