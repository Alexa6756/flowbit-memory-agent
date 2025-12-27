import { Database } from "../persistence/Database";
import { AgentConfig } from "../config/agentConfig";

export interface CorrectionRule {
  id: number;
  rule: string;
  confidence: number;
}

export class CorrectionMemory {
  private readonly decayRate =
    AgentConfig.decay.CORRECTION_MEMORY;

  constructor(private db: Database) {}

  async recall(vendor: string): Promise<CorrectionRule[]> {
    const rows = await this.db.fetch("correction", vendor);

    return rows.map(row => ({
      id: row.id,
      rule: row.value,
      confidence: Number(
        (row.confidence * this.decayRate).toFixed(2)
      )
    }));
  }

  async learn(
    vendor: string,
    rule: string,
    confidence: number
  ): Promise<void> {
    await this.db.insert(
      "correction",
      vendor,
      rule,
      confidence
    );
  }

  async reinforce(
    recordId: number,
    currentConfidence: number,
    success: boolean
  ): Promise<void> {
    const updatedConfidence = success
      ? Math.min(
          1,
          currentConfidence +
            AgentConfig.reinforcement.POSITIVE
        )
      : Math.max(
          AgentConfig.confidence.MIN,
          currentConfidence -
            AgentConfig.reinforcement.NEGATIVE
        );

    await this.db.updateStats(
      recordId,
      updatedConfidence,
      success
    );
  }
}
