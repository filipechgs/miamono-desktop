import type { DatabaseSync } from "node:sqlite";
import type { Receipt } from "../../../domains/receipts/model/receipt.ts";
import type {
  CreateReceiptInput,
  ReceiptFilter,
  ReceiptListResult,
  ReceiptRepository,
  ReceiptView,
} from "../../../domains/receipts/repository/receipt-repository.ts";

interface ReceiptRow {
  id: number;
  receipt_date: string;
  service_id: number;
  payer_id: number;
  amount_cents: number;
  has_invoice: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ReceiptViewRow extends ReceiptRow {
  service_name: string;
  payer_full_name: string;
}

interface ReceiptYearRow {
  year: string;
}

const mapRowToReceipt = (row: ReceiptRow): Receipt => ({
  id: row.id,
  receiptDate: row.receipt_date,
  serviceId: row.service_id,
  payerId: row.payer_id,
  amountCents: row.amount_cents,
  hasInvoice: row.has_invoice === 1,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapRowToReceiptView = (row: ReceiptViewRow): ReceiptView => ({
  ...mapRowToReceipt(row),
  serviceName: row.service_name,
  payerFullName: row.payer_full_name,
});

const nowIso = (): string => new Date().toISOString();

export class SqliteReceiptRepository implements ReceiptRepository {
  private readonly database: DatabaseSync;

  constructor(database: DatabaseSync) {
    this.database = database;
  }

  create(input: CreateReceiptInput): Receipt {
    const timestamp = nowIso();

    this.database
      .prepare(
        `INSERT INTO receipts
           (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.receiptDate,
        input.serviceId,
        input.payerId,
        input.amountCents,
        input.hasInvoice ? 1 : 0,
        input.notes ?? null,
        timestamp,
        timestamp,
      );

    const row = this.database
      .prepare(
        `SELECT id, receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at
         FROM receipts
         WHERE rowid = last_insert_rowid()`,
      )
      .get() as ReceiptRow | undefined;

    if (!row) {
      throw new Error("Falha ao criar recebimento.");
    }

    return mapRowToReceipt(row);
  }

  update(id: number, input: CreateReceiptInput): Receipt {
    const timestamp = nowIso();

    this.database
      .prepare(
        `UPDATE receipts
         SET receipt_date = ?, service_id = ?, payer_id = ?,
             amount_cents = ?, has_invoice = ?, notes = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(
        input.receiptDate,
        input.serviceId,
        input.payerId,
        input.amountCents,
        input.hasInvoice ? 1 : 0,
        input.notes ?? null,
        timestamp,
        id,
      );

    const receipt = this.findById(id);

    if (!receipt) {
      throw new Error("Falha ao atualizar recebimento.");
    }

    return receipt;
  }

  remove(id: number): void {
    this.database.prepare(`DELETE FROM receipts WHERE id = ?`).run(id);
  }

  findById(id: number): Receipt | null {
    const row = this.database
      .prepare(
        `SELECT id, receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at
         FROM receipts
         WHERE id = ?`,
      )
      .get(id) as ReceiptRow | undefined;

    return row ? mapRowToReceipt(row) : null;
  }

  listAvailableYears(): number[] {
    const rows = this.database
      .prepare(
        `SELECT DISTINCT substr(receipt_date, 1, 4) AS year
         FROM receipts
         ORDER BY year DESC`,
      )
      .all() as ReceiptYearRow[];

    return rows
      .map((row) => Number(row.year))
      .filter((year) => Number.isInteger(year));
  }

  listFiltered(filter: ReceiptFilter): ReceiptListResult {
    const year = String(filter.year).padStart(4, "0");
    const startDate = filter.month
      ? `${year}-${String(filter.month).padStart(2, "0")}-01`
      : `${year}-01-01`;
    const endDate = filter.month
      ? (() => {
          const nextMonth = filter.month === 12 ? 1 : filter.month + 1;
          const nextYear = filter.month === 12 ? filter.year + 1 : filter.year;
          return `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-01`;
        })()
      : `${String(filter.year + 1).padStart(4, "0")}-01-01`;

    const conditions: string[] = [
      `r.receipt_date >= ?`,
      `r.receipt_date < ?`,
    ];
    const params: (string | number)[] = [startDate, endDate];

    if (filter.date) {
      conditions.push(`r.receipt_date = ?`);
      params.push(filter.date);
    }

    if (filter.serviceId !== undefined) {
      conditions.push(`r.service_id = ?`);
      params.push(filter.serviceId);
    }

    if (filter.payerId !== undefined) {
      conditions.push(`r.payer_id = ?`);
      params.push(filter.payerId);
    }

    if (filter.hasInvoice !== undefined) {
      conditions.push(`r.has_invoice = ?`);
      params.push(filter.hasInvoice ? 1 : 0);
    }

    const whereClause = conditions.join(" AND ");

    const rows = this.database
      .prepare(
        `SELECT r.id, r.receipt_date, r.service_id, r.payer_id,
                r.amount_cents, r.has_invoice, r.notes, r.created_at, r.updated_at,
                s.service_name, p.payer_full_name
         FROM receipts r
         JOIN services s ON r.service_id = s.id
         JOIN payers p ON r.payer_id = p.id
         WHERE ${whereClause}
         ORDER BY r.receipt_date DESC, r.id DESC`,
      )
      .all(...params) as ReceiptViewRow[];

    const items = rows.map(mapRowToReceiptView);
    const totalCount = items.length;
    const totalAmountCents = items.reduce((sum, item) => sum + item.amountCents, 0);

    return { items, totalCount, totalAmountCents };
  }
}
