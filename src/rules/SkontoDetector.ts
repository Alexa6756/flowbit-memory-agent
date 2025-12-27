export class SkontoDetector {
  static detect(rawText?: string): string | null {
    if (!rawText) return null;

    const match = rawText.match(
      /(\d+)%\s*Skonto.*?(\d+)\s*days/i
    );

    if (!match) return null;

    return `${match[1]}% Skonto within ${match[2]} days`;
  }
}
