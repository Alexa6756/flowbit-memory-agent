export class ConfidenceManager {
  static reinforce(conf: number) {
    return Math.min(1, conf + 0.1);
  }

  static decay(conf: number) {
    return Math.max(0.1, conf - 0.05);
  }

  static safe(conf: number) {
    return conf >= 0.75;
  }
}
