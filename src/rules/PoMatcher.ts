import { PurchaseOrder } from "../core/types";

export class PoMatcher {
  static match(
    vendor: string,
    invoiceItems: { sku?: string; qty: number; unitPrice: number }[],
    purchaseOrders: PurchaseOrder[]
  ): string | null {
    const vendorPOs = purchaseOrders.filter(
      po => po.vendor === vendor
    );

    for (const po of vendorPOs) {
      const matched = po.lineItems.every(poItem =>
        invoiceItems.some(invItem =>
          invItem.sku === poItem.sku &&
          invItem.qty === poItem.qty &&
          invItem.unitPrice === poItem.unitPrice
        )
      );

      if (matched) {
        return po.poNumber;
      }
    }

    return null;
  }
}
