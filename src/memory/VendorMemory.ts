import { AgentConfig } from "../config/agentConfig";
import { Database } from "../persistence/Database";

export interface VendorBehavior {
  id: number;
  behavior: string;
  confidence: number;
}

const DECAY_RATE = AgentConfig.decay.VENDOR_MEMORY;

export class VendorMemory {
  constructor(private db: Database) {}

  async recall(vendor: string): Promise<VendorBehavior[]> {
    const rows = await this.db.fetch("vendor", vendor);

    return rows.map(row => ({
      id: row.id,
      behavior: row.value,
      confidence: Number((row.confidence * DECAY_RATE).toFixed(2))
    }));
  }

  async learn(
    vendor: string,
    behavior: string,
    confidence: number
  ): Promise<void> {
    await this.db.insert(
      "vendor",
      vendor,
      behavior,
      confidence
    );
  }

  
  async reinforce(
    recordId: number,
    confidence: number,
    success: boolean
  ): Promise<void> {
    await this.db.updateStats(
      recordId,
      confidence,
      success
    );
  }
}
