import { Database } from "../persistence/Database";
import { ExtractedInvoice } from "../core/types";

export class DuplicateDetector {
  constructor(private db: Database) {}

  async check(invoice: ExtractedInvoice) {
    const rows = await this.db.query(
      `
      SELECT * FROM invoice_fingerprints
      WHERE vendor=? AND invoice_number=?
      `,
      [invoice.vendor, invoice.fields.invoiceNumber]
    );

    if (rows.length === 0) {
      return { isDuplicate: false };
    }

    const prev = rows[0];
    let confidence = 0.6;

    if (prev.invoice_date === invoice.fields.invoiceDate) {
      confidence += 0.2;
    }

    if (
      Math.abs(
        prev.total_amount - invoice.fields.grossTotal
      ) < 1
    ) {
      confidence += 0.2;
    }

    return {
      isDuplicate: confidence >= 0.8,
      confidence
    };
  }

  async record(invoice: ExtractedInvoice) {
    await this.db.run(
      `
      INSERT OR IGNORE INTO invoice_fingerprints
      (vendor, invoice_number, invoice_date, total_amount)
      VALUES (?, ?, ?, ?)
      `,
      [
        invoice.vendor,
        invoice.fields.invoiceNumber,
        invoice.fields.invoiceDate,
        invoice.fields.grossTotal
      ]
    );
  }
}
