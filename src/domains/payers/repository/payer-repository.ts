import type { Payer } from "../model/payer.ts";

export interface PayerRepository {
  create(payerFullName: string): Payer;
  update(id: number, payerFullName: string): Payer;
  deactivate(id: number): void;
  findById(id: number): Payer | null;
  findByName(payerFullName: string): Payer | null;
  listAll(): Payer[];
}
