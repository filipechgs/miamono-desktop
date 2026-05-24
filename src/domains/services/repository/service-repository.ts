import type { Service } from "../model/service.ts";

export interface ServiceRepository {
  create(serviceName: string): Service;
  update(id: number, serviceName: string): Service;
  deactivate(id: number): void;
  findById(id: number): Service | null;
  findByName(serviceName: string): Service | null;
  listAll(): Service[];
}
