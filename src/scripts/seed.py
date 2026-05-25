from __future__ import annotations

import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATABASE_FILE = ROOT / "data" / "miamono.sqlite"
MIGRATIONS_DIR = ROOT / "src" / "infrastructure" / "database" / "migrations"
TIMESTAMP = "2026-05-24T12:00:00.000Z"

SERVICES = [
    "Consultoria",
    "Mentoria",
    "Sessao Avulsa",
    "Plano Mensal",
    "Projeto Especial",
    "Suporte Tecnico",
]

PAYERS = [
    "Ana Beatriz Souza",
    "Bruno Henrique Lima",
    "Carla Monteiro",
    "Daniel Araujo",
    "Fernanda Prado",
    "Gustavo Nunes",
    "Helena Costa",
    "Igor Almeida",
]

MONTH_DAYS = [4, 9, 14, 19, 24]
AMOUNT_OFFSETS = [0, 1750, 3250, 5100, 6800]
NOTE_TEMPLATES = [
    "Recebimento mensal padrao",
    "Acompanhamento recorrente",
    "Parcela complementar",
    "Sessao de suporte",
    None,
]


def run_migrations(conn: sqlite3.Connection) -> None:
    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))

    for migration_file in migration_files:
        conn.executescript(migration_file.read_text(encoding="utf-8"))


def clear_database(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM receipts;")
    conn.execute("DELETE FROM payers;")
    conn.execute("DELETE FROM services;")
    conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('receipts', 'payers', 'services');")


def seed_master_data(conn: sqlite3.Connection) -> None:
    service_rows = [(service_name, TIMESTAMP, TIMESTAMP) for service_name in SERVICES]
    payer_rows = [(payer_name, TIMESTAMP, TIMESTAMP) for payer_name in PAYERS]

    conn.executemany(
        """
        INSERT INTO services (service_name, is_active, created_at, updated_at)
        VALUES (?, 1, ?, ?)
        """,
        service_rows,
    )
    conn.executemany(
        """
        INSERT INTO payers (payer_full_name, is_active, created_at, updated_at)
        VALUES (?, 1, ?, ?)
        """,
        payer_rows,
    )


def build_receipt_rows() -> list[tuple[str, int, int, int, int, str | None, str, str]]:
    rows: list[tuple[str, int, int, int, int, str | None, str, str]] = []

    for year in (2024, 2025):
        year_offset = year - 2024

        for month in range(1, 13):
            for slot, day in enumerate(MONTH_DAYS):
                receipt_date = f"{year}-{month:02d}-{day:02d}"
                service_id = ((month + slot + year_offset) % len(SERVICES)) + 1
                payer_id = ((month * 2 + slot + year_offset) % len(PAYERS)) + 1
                amount_cents = 82000 + (year_offset * 12000) + (month * 1850) + AMOUNT_OFFSETS[slot]
                has_invoice = 1 if (month + slot + year_offset) % 2 == 0 else 0
                note_template = NOTE_TEMPLATES[slot]
                notes = f"{note_template} de {month}/{year}" if note_template else None

                rows.append(
                    (
                        receipt_date,
                        service_id,
                        payer_id,
                        amount_cents,
                        has_invoice,
                        notes,
                        f"{receipt_date}T12:00:00.000Z",
                        f"{receipt_date}T12:00:00.000Z",
                    )
                )

    return rows


def seed_receipts(conn: sqlite3.Connection) -> None:
    rows = build_receipt_rows()
    conn.executemany(
        """
        INSERT INTO receipts (
          receipt_date,
          service_id,
          payer_id,
          amount_cents,
          has_invoice,
          notes,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        rows,
    )


def main() -> None:
    DATABASE_FILE.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_FILE)
    conn.execute("PRAGMA foreign_keys = ON;")

    try:
        run_migrations(conn)
        conn.execute("BEGIN;")
        try:
            clear_database(conn)
            seed_master_data(conn)
            seed_receipts(conn)
            conn.execute("COMMIT;")
        except Exception:
            conn.execute("ROLLBACK;")
            raise
        print("Banco populado com dados simulados de 2024 e 2025.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
