export class CurrencyExtractor {
  static extract(rawText?: string): string | null {
    if (!rawText) return null;

    if (/EUR|€/.test(rawText)) return "EUR";
    if (/USD|\$/.test(rawText)) return "USD";

    return null;
  }
}
