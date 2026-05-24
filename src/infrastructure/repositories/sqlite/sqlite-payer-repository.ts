import type { DatabaseSync } from "node:sqlite";
import type { Payer } from "../../../domains/payers/model/payer.ts";
import type { PayerRepository } from "../../../domains/payers/repository/payer-repository.ts";

interface PayerRow {
  id: number;
  payer_full_name: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const mapRowToPayer = (row: PayerRow): Payer => ({
  id: row.id,
  payerFullName: row.payer_full_name,
  isActive: row.is_active === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const nowIso = (): string => new Date().toISOString();

export class SqlitePayerRepository implements PayerRepository {
  private readonly database: DatabaseSync;

  constructor(database: DatabaseSync) {
    this.database = database;
  }

  create(payerFullName: string): Payer {
    const timestamp = nowIso();

    this.database
      .prepare(
        `INSERT INTO payers (payer_full_name, is_active, created_at, updated_at)
         VALUES (?, 1, ?, ?)`,
      )
      .run(payerFullName, timestamp, timestamp);

    const payer = this.findByName(payerFullName);

    if (!payer) {
      throw new Error("Falha ao criar pagador.");
    }

    return payer;
  }

  update(id: number, payerFullName: string): Payer {
    const timestamp = nowIso();

    this.database
      .prepare(
        `UPDATE payers
         SET payer_full_name = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(payerFullName, timestamp, id);

    const payer = this.findById(id);

    if (!payer) {
      throw new Error("Falha ao atualizar pagador.");
    }

    return payer;
  }

  deactivate(id: number): void {
    const timestamp = nowIso();

    this.database
      .prepare(
        `UPDATE payers
         SET is_active = 0, updated_at = ?
         WHERE id = ?`,
      )
      .run(timestamp, id);
  }

  findById(id: number): Payer | null {
    const row = this.database
      .prepare(
        `SELECT id, payer_full_name, is_active, created_at, updated_at
         FROM payers
         WHERE id = ?`,
      )
      .get(id) as PayerRow | undefined;

    return row ? mapRowToPayer(row) : null;
  }

  findByName(payerFullName: string): Payer | null {
    const row = this.database
      .prepare(
        `SELECT id, payer_full_name, is_active, created_at, updated_at
         FROM payers
         WHERE payer_full_name = ?`,
      )
      .get(payerFullName) as PayerRow | undefined;

    return row ? mapRowToPayer(row) : null;
  }

  listAll(): Payer[] {
    const rows = this.database
      .prepare(
        `SELECT id, payer_full_name, is_active, created_at, updated_at
         FROM payers
         ORDER BY payer_full_name COLLATE NOCASE`,
      )
      .all() as PayerRow[];

    return rows.map(mapRowToPayer);
  }
}
