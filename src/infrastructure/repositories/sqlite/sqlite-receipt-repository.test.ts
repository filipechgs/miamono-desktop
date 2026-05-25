import { test, before } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { runMigrations } from "../../database/migrations/runner.ts";
import { SqliteReceiptRepository } from "./sqlite-receipt-repository.ts";

// ── Helpers ───────────────────────────────────────────────────────────────────

const setupDatabase = (): DatabaseSync => {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  runMigrations(db);
  return db;
};

const seedData = (db: DatabaseSync) => {
  const now = new Date().toISOString();

  db.prepare(
    "INSERT INTO services (service_name, is_active, created_at, updated_at) VALUES (?, 1, ?, ?)",
  ).run("Consultoria", now, now);

  db.prepare(
    "INSERT INTO services (service_name, is_active, created_at, updated_at) VALUES (?, 1, ?, ?)",
  ).run("Treinamento", now, now);

  db.prepare(
    "INSERT INTO payers (payer_full_name, is_active, created_at, updated_at) VALUES (?, 1, ?, ?)",
  ).run("Filipe dos Santos", now, now);

  db.prepare(
    "INSERT INTO payers (payer_full_name, is_active, created_at, updated_at) VALUES (?, 1, ?, ?)",
  ).run("Ana Silva", now, now);

  const serviceRow = db
    .prepare("SELECT id FROM services WHERE service_name = 'Consultoria'")
    .get() as { id: number };

  const serviceRow2 = db
    .prepare("SELECT id FROM services WHERE service_name = 'Treinamento'")
    .get() as { id: number };

  const payerRow = db
    .prepare("SELECT id FROM payers WHERE payer_full_name = 'Filipe dos Santos'")
    .get() as { id: number };

  const payerRow2 = db
    .prepare("SELECT id FROM payers WHERE payer_full_name = 'Ana Silva'")
    .get() as { id: number };

  return {
    serviceId: serviceRow.id,
    serviceId2: serviceRow2.id,
    payerId: payerRow.id,
    payerId2: payerRow2.id,
  };
};

// ── Fixtures ──────────────────────────────────────────────────────────────────

let db: DatabaseSync;
let repo: SqliteReceiptRepository;
let serviceId: number;
let serviceId2: number;
let payerId: number;
let payerId2: number;

before(() => {
  db = setupDatabase();
  repo = new SqliteReceiptRepository(db);
  const ids = seedData(db);
  serviceId = ids.serviceId;
  serviceId2 = ids.serviceId2;
  payerId = ids.payerId;
  payerId2 = ids.payerId2;
});

// ── create ────────────────────────────────────────────────────────────────────

test("cria um recebimento e retorna com id atribuído", () => {
  const receipt = repo.create({
    receiptDate: "2026-05-10",
    serviceId,
    payerId,
    amountCents: 15000,
    hasInvoice: false,
    notes: null,
  });

  assert.ok(receipt.id > 0);
  assert.equal(receipt.receiptDate, "2026-05-10");
  assert.equal(receipt.serviceId, serviceId);
  assert.equal(receipt.payerId, payerId);
  assert.equal(receipt.amountCents, 15000);
  assert.equal(receipt.hasInvoice, false);
  assert.equal(receipt.notes, null);
});

test("cria recebimento com nota fiscal e observações", () => {
  const receipt = repo.create({
    receiptDate: "2026-05-15",
    serviceId,
    payerId,
    amountCents: 30000,
    hasInvoice: true,
    notes: "Pagamento parcelado",
  });

  assert.equal(receipt.hasInvoice, true);
  assert.equal(receipt.notes, "Pagamento parcelado");
});

// ── findById ──────────────────────────────────────────────────────────────────

test("findById retorna o recebimento criado", () => {
  const created = repo.create({
    receiptDate: "2026-05-20",
    serviceId,
    payerId,
    amountCents: 5000,
    hasInvoice: false,
    notes: null,
  });

  const found = repo.findById(created.id);
  assert.ok(found !== null);
  assert.equal(found.id, created.id);
  assert.equal(found.amountCents, 5000);
});

test("findById retorna null para id inexistente", () => {
  const found = repo.findById(999999);
  assert.equal(found, null);
});

// ── update ────────────────────────────────────────────────────────────────────

test("update altera os campos do recebimento", () => {
  const created = repo.create({
    receiptDate: "2026-05-01",
    serviceId,
    payerId,
    amountCents: 10000,
    hasInvoice: false,
    notes: null,
  });

  const updated = repo.update(created.id, {
    receiptDate: "2026-05-02",
    serviceId: serviceId2,
    payerId: payerId2,
    amountCents: 20000,
    hasInvoice: true,
    notes: "Atualizado",
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.receiptDate, "2026-05-02");
  assert.equal(updated.serviceId, serviceId2);
  assert.equal(updated.payerId, payerId2);
  assert.equal(updated.amountCents, 20000);
  assert.equal(updated.hasInvoice, true);
  assert.equal(updated.notes, "Atualizado");
});

// ── remove ────────────────────────────────────────────────────────────────────

test("remove exclui o recebimento e findById retorna null", () => {
  const created = repo.create({
    receiptDate: "2026-05-05",
    serviceId,
    payerId,
    amountCents: 7500,
    hasInvoice: false,
    notes: null,
  });

  repo.remove(created.id);
  const found = repo.findById(created.id);
  assert.equal(found, null);
});

// ── listFiltered ──────────────────────────────────────────────────────────────

test("listFiltered por mês e ano retorna somente recebimentos do período", () => {
  // Seed: 2 recebimentos em mai/2026, 1 em abr/2026
  repo.create({ receiptDate: "2026-04-10", serviceId, payerId, amountCents: 1000, hasInvoice: false, notes: null });

  const may = repo.listFiltered({ year: 2026, month: 5 });
  const april = repo.listFiltered({ year: 2026, month: 4 });

  assert.ok(may.totalCount >= 2, "deve ter pelo menos 2 em maio");
  assert.equal(april.totalCount, 1, "deve ter exatamente 1 em abril");
});

test("listFiltered com filtro de serviço retorna apenas do serviço selecionado", () => {
  const db2 = setupDatabase();
  const r2 = new SqliteReceiptRepository(db2);
  const ids = seedData(db2);
  const now = new Date().toISOString();

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-05-10", ids.serviceId, ids.payerId, 1000, now, now);

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-05-11", ids.serviceId2, ids.payerId, 2000, now, now);

  const result = r2.listFiltered({ year: 2026, month: 5, serviceId: ids.serviceId });
  assert.equal(result.totalCount, 1);
  assert.equal(result.items[0].serviceId, ids.serviceId);
});

test("listFiltered com filtro de pagador retorna apenas do pagador selecionado", () => {
  const db2 = setupDatabase();
  const r2 = new SqliteReceiptRepository(db2);
  const ids = seedData(db2);
  const now = new Date().toISOString();

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-05-10", ids.serviceId, ids.payerId, 1000, now, now);

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-05-11", ids.serviceId, ids.payerId2, 2000, now, now);

  const result = r2.listFiltered({ year: 2026, month: 5, payerId: ids.payerId2 });
  assert.equal(result.totalCount, 1);
  assert.equal(result.items[0].payerId, ids.payerId2);
});

test("listFiltered com filtro de data específica retorna apenas da data", () => {
  const db2 = setupDatabase();
  const r2 = new SqliteReceiptRepository(db2);
  const ids = seedData(db2);
  const now = new Date().toISOString();

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-05-10", ids.serviceId, ids.payerId, 1000, now, now);

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-05-20", ids.serviceId, ids.payerId, 2000, now, now);

  const result = r2.listFiltered({ year: 2026, month: 5, date: "2026-05-10" });
  assert.equal(result.totalCount, 1);
  assert.equal(result.items[0].receiptDate, "2026-05-10");
});

test("listFiltered com filtro hasInvoice=true retorna apenas com nota fiscal", () => {
  const db2 = setupDatabase();
  const r2 = new SqliteReceiptRepository(db2);
  const ids = seedData(db2);
  const now = new Date().toISOString();

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-05-10", ids.serviceId, ids.payerId, 1000, now, now);

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 1, null, ?, ?)",
  ).run("2026-05-11", ids.serviceId, ids.payerId, 2000, now, now);

  const result = r2.listFiltered({ year: 2026, month: 5, hasInvoice: true });
  assert.equal(result.totalCount, 1);
  assert.equal(result.items[0].hasInvoice, true);
});

test("listFiltered retorna totais corretos", () => {
  const db2 = setupDatabase();
  const r2 = new SqliteReceiptRepository(db2);
  const ids = seedData(db2);
  const now = new Date().toISOString();

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-05-01", ids.serviceId, ids.payerId, 10000, now, now);

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-05-02", ids.serviceId, ids.payerId, 25000, now, now);

  const result = r2.listFiltered({ year: 2026, month: 5 });
  assert.equal(result.totalCount, 2);
  assert.equal(result.totalAmountCents, 35000);
});

test("listFiltered por ano retorna todos os recebimentos do ano sem exigir mês", () => {
  const db2 = setupDatabase();
  const r2 = new SqliteReceiptRepository(db2);
  const ids = seedData(db2);
  const now = new Date().toISOString();

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-01-10", ids.serviceId, ids.payerId, 1100, now, now);

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-12-20", ids.serviceId2, ids.payerId2, 2200, now, now);

  const result = r2.listFiltered({ year: 2026 });
  assert.equal(result.totalCount, 2);
  assert.equal(result.totalAmountCents, 3300);
  assert.equal(result.items[0].receiptDate, "2026-12-20");
});

test("listFiltered inclui serviceName e payerFullName nos itens", () => {
  const db2 = setupDatabase();
  const r2 = new SqliteReceiptRepository(db2);
  const ids = seedData(db2);
  const now = new Date().toISOString();

  db2.prepare(
    "INSERT INTO receipts (receipt_date, service_id, payer_id, amount_cents, has_invoice, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, null, ?, ?)",
  ).run("2026-05-01", ids.serviceId, ids.payerId, 5000, now, now);

  const result = r2.listFiltered({ year: 2026, month: 5 });
  const item = result.items[0];

  assert.equal(item.serviceName, "Consultoria");
  assert.equal(item.payerFullName, "Filipe dos Santos");
});

test("listFiltered retorna lista vazia quando não há registros no período", () => {
  const db2 = setupDatabase();
  const r2 = new SqliteReceiptRepository(db2);
  seedData(db2);

  const result = r2.listFiltered({ year: 2099, month: 12 });
  assert.equal(result.totalCount, 0);
  assert.equal(result.items.length, 0);
  assert.equal(result.totalAmountCents, 0);
});
