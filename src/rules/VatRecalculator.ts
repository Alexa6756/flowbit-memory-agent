export class VatRecalculator {
  static recompute(
    rawText: string | undefined,
    invoice: {
      netTotal?: number;
      taxTotal?: number;
      grossTotal?: number;
      taxRate?: number;
    }
  ): boolean {
    if (!rawText) return false;

    if (!/VAT already included|MwSt\. inkl/i.test(rawText)) {
      return false;
    }

    if (
      invoice.grossTotal == null ||
      invoice.taxRate == null
    ) {
      return false;
    }

    const net = Number(
      (invoice.grossTotal / (1 + invoice.taxRate)).toFixed(2)
    );
    const tax = Number(
      (invoice.grossTotal - net).toFixed(2)
    );

    invoice.netTotal = net;
    invoice.taxTotal = tax;

    return true;
  }
}
