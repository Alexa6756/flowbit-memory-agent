import { AgentConfig } from "../config/agentConfig";
    
export class SkuMapper {
  static map(description?: string): string | null {
    if (!description) return null;

    for (const pattern of AgentConfig.patterns.FREIGHT_KEYWORDS) {
      if (pattern.test(description)) {
        return "FREIGHT";
      }
    }
    return null;
  }
}
   
