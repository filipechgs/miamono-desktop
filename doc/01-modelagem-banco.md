# Database Modeling

This document defines the initial SQLite database model for the Miamono Desktop project.

## Overview

The central entity is `receipts`, linked to the reference entities `services` and `payers`.

Modeling goals:

- Keep a reliable receipts history.
- Avoid redundant service and payer names.
- Support filtering by period, service, payer, and invoice presence.
- Enable safe future evolution without breaking existing data.

## Naming Convention Rules

- All database modeling must be written in English.
- All table names must use snake_case.
- All column names must use snake_case.
- Prefer clear, semantic names and avoid ambiguous abbreviations.

## Entities

### Table `services`

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `service_name` TEXT NOT NULL UNIQUE
- `is_active` INTEGER NOT NULL DEFAULT 1
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

Notes:

- `is_active` uses SQLite boolean style (`0`/`1`).
- `service_name` is unique to avoid duplicate service registration.

### Table `payers`

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `payer_full_name` TEXT NOT NULL UNIQUE
- `is_active` INTEGER NOT NULL DEFAULT 1
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

Notes:

- The table mirrors `services` for consistency.

### Table `receipts`

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `receipt_date` TEXT NOT NULL
- `service_id` INTEGER NOT NULL
- `payer_id` INTEGER NOT NULL
- `amount_cents` INTEGER NOT NULL
- `has_invoice` INTEGER NOT NULL DEFAULT 0
- `notes` TEXT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

Foreign keys:

- `service_id` REFERENCES `services(id)`
- `payer_id` REFERENCES `payers(id)`

Notes:

- `receipt_date` uses ISO format (`YYYY-MM-DD`) to simplify filtering.
- `amount_cents` avoids floating-point issues for monetary values.
- `has_invoice` is stored as boolean (`0`/`1`).

## Input Normalization Rules (Applied Before Persisting)

The following rules must be applied to person names and service names before insert and update operations:

- Each word must be stored with first letter uppercase and remaining letters lowercase.
- For full person names, articles and prepositions must remain lowercase.
- The same article/preposition rule also applies to service names when those words appear.

Expected example:

- Input: `fILIPE DOS sANTOS`
- Stored value: `Filipe dos Santos`

Articles/prepositions that must remain lowercase (initial list):

- `de`
- `da`
- `do`
- `das`
- `dos`
- `e`

Implementation note:

- SQLite does not enforce this capitalization pattern natively in a robust way for all cases.
- Normalization is mandatory in the application/domain layer before writing to the database.

## Recommended Indexes

To improve filtering performance:

- `idx_receipts_receipt_date` on (`receipt_date`)
- `idx_receipts_service_id` on (`service_id`)
- `idx_receipts_payer_id` on (`payer_id`)
- `idx_receipts_has_invoice` on (`has_invoice`)
- `idx_receipts_date_service_payer` on (`receipt_date`, `service_id`, `payer_id`)

## Integrity Rules

- Do not allow receipts without valid service and payer references.
- Do not allow `amount_cents <= 0`.
- Keep `created_at` and `updated_at` timestamps.
- Prefer logical deactivation (`is_active = 0`) for services and payers that already have historical usage.

## DDL Example (Reference)

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payer_full_name TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_date TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  payer_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  has_invoice INTEGER NOT NULL DEFAULT 0 CHECK (has_invoice IN (0, 1)),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (payer_id) REFERENCES payers(id)
);

CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date
  ON receipts (receipt_date);

CREATE INDEX IF NOT EXISTS idx_receipts_service_id
  ON receipts (service_id);

CREATE INDEX IF NOT EXISTS idx_receipts_payer_id
  ON receipts (payer_id);

CREATE INDEX IF NOT EXISTS idx_receipts_has_invoice
  ON receipts (has_invoice);

CREATE INDEX IF NOT EXISTS idx_receipts_date_service_payer
  ON receipts (receipt_date, service_id, payer_id);
```

## Suggested Future Evolutions

- Add a `service_categories` table.
- Add support for invoice identifiers/attachments.
- Add audit trail for critical changes (amount, date, payer).
- Consider optional local multi-user support in later versions.
