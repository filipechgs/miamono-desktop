import type { Receipt } from "../model/receipt.ts";

export interface ReceiptFilter {
  year: number;
  month?: number;
  date?: string;
  serviceId?: number;
  payerId?: number;
  hasInvoice?: boolean;
}

export interface ReceiptView {
  id: number;
  receiptDate: string;
  serviceId: number;
  serviceName: string;
  payerId: number;
  payerFullName: string;
  amountCents: number;
  hasInvoice: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptListResult {
  items: ReceiptView[];
  totalCount: number;
  totalAmountCents: number;
}

export interface CreateReceiptInput {
  receiptDate: string;
  serviceId: number;
  payerId: number;
  amountCents: number;
  hasInvoice: boolean;
  notes: string | null;
}

export interface ReceiptRepository {
  create(input: CreateReceiptInput): Receipt;
  update(id: number, input: CreateReceiptInput): Receipt;
  remove(id: number): void;
  findById(id: number): Receipt | null;
  listAvailableYears(): number[];
  listFiltered(filter: ReceiptFilter): ReceiptListResult;
}
