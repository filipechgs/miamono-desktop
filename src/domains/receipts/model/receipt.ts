export interface Receipt {
  id: number;
  receiptDate: string;
  serviceId: number;
  payerId: number;
  amountCents: number;
  hasInvoice: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
