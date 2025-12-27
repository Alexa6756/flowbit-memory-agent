export class ServiceDateMapper {
  static extract(rawText?: string): string | null {
    if (!rawText) return null;

    const match = rawText.match(/Leistungsdatum[:\s]+([\d.]+)/i);
    return match ? match[1] : null;
  }
}
