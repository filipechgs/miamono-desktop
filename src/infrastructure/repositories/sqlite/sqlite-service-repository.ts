import type { DatabaseSync } from "node:sqlite";
import type { Service } from "../../../domains/services/model/service.ts";
import type { ServiceRepository } from "../../../domains/services/repository/service-repository.ts";

interface ServiceRow {
  id: number;
  service_name: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const mapRowToService = (row: ServiceRow): Service => ({
  id: row.id,
  serviceName: row.service_name,
  isActive: row.is_active === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const nowIso = (): string => new Date().toISOString();

export class SqliteServiceRepository implements ServiceRepository {
  private readonly database: DatabaseSync;

  constructor(database: DatabaseSync) {
    this.database = database;
  }

  create(serviceName: string): Service {
    const timestamp = nowIso();

    this.database
      .prepare(
        `INSERT INTO services (service_name, is_active, created_at, updated_at)
         VALUES (?, 1, ?, ?)`,
      )
      .run(serviceName, timestamp, timestamp);

    const service = this.findByName(serviceName);

    if (!service) {
      throw new Error("Falha ao criar serviço.");
    }

    return service;
  }

  update(id: number, serviceName: string): Service {
    const timestamp = nowIso();

    this.database
      .prepare(
        `UPDATE services
         SET service_name = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(serviceName, timestamp, id);

    const service = this.findById(id);

    if (!service) {
      throw new Error("Falha ao atualizar serviço.");
    }

    return service;
  }

  deactivate(id: number): void {
    const timestamp = nowIso();

    this.database
      .prepare(
        `UPDATE services
         SET is_active = 0, updated_at = ?
         WHERE id = ?`,
      )
      .run(timestamp, id);
  }

  findById(id: number): Service | null {
    const row = this.database
      .prepare(
        `SELECT id, service_name, is_active, created_at, updated_at
         FROM services
         WHERE id = ?`,
      )
      .get(id) as ServiceRow | undefined;

    return row ? mapRowToService(row) : null;
  }

  findByName(serviceName: string): Service | null {
    const row = this.database
      .prepare(
        `SELECT id, service_name, is_active, created_at, updated_at
         FROM services
         WHERE service_name = ?`,
      )
      .get(serviceName) as ServiceRow | undefined;

    return row ? mapRowToService(row) : null;
  }

  listAll(): Service[] {
    const rows = this.database
      .prepare(
        `SELECT id, service_name, is_active, created_at, updated_at
         FROM services
         ORDER BY service_name COLLATE NOCASE`,
      )
      .all() as ServiceRow[];

    return rows.map(mapRowToService);
  }
}
