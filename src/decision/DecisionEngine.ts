import { AgentConfig } from "../config/agentConfig";
export interface DecisionResult {
  requiresHumanReview: boolean;
  decision: "auto-accept" | "escalate";
}

export class DecisionEngine {
  decide(confidence: number): DecisionResult {
  if (confidence >= AgentConfig.confidence.AUTO_ACCEPT_THRESHOLD) {
    return { requiresHumanReview: false, decision: "auto-accept" };
  }
  return { requiresHumanReview: true, decision: "escalate" };
}
   
}
