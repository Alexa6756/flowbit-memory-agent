import { Database } from "../persistence/Database";
import { AgentConfig } from "../config/agentConfig";

export interface ResolutionRecord {
  id: number;
  outcome: "approved" | "rejected";
  confidence: number;
}

export class ResolutionMemory {
  constructor(private db: Database) {}

  async recall(key: string): Promise<ResolutionRecord[]> {
    const rows = await this.db.fetch("resolution", key);

    return rows.map(row => ({
      id: row.id,
      outcome: row.value as "approved" | "rejected",
      confidence: Number(
        (row.confidence * AgentConfig.decay.RESOLUTION_MEMORY).toFixed(2)
      )
    }));
  }

  
  async learn(
    key: string,
    outcome: "approved" | "rejected"
  ): Promise<void> {
    const baseConfidence =
      outcome === "approved"
        ? AgentConfig.reinforcement.BASE_APPROVAL
        : AgentConfig.reinforcement.BASE_REJECTION;

    await this.db.insert(
      "resolution",
      key,
      outcome,
      baseConfidence
    );
  }

  async reinforce(
    recordId: number,
    currentConfidence: number,
    outcome: "approved" | "rejected"
  ): Promise<void> {
    const updatedConfidence =
      outcome === "approved"
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
      outcome === "approved"
    );
  }
}
