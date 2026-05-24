import type { DatabaseSync } from "node:sqlite";
import { PayerController } from "../../domains/payers/controller/payer-controller.ts";
import { PayerService } from "../../domains/payers/application/payer-service.ts";
import { ReceiptController } from "../../domains/receipts/controller/receipt-controller.ts";
import { ReceiptService } from "../../domains/receipts/application/receipt-service.ts";
import { ServiceController } from "../../domains/services/controller/service-controller.ts";
import { ServiceService } from "../../domains/services/application/service-service.ts";
import { runMigrations } from "../../infrastructure/database/migrations/runner.ts";
import { openDatabase } from "../../infrastructure/database/sqlite-client.ts";
import { SqlitePayerRepository } from "../../infrastructure/repositories/sqlite/sqlite-payer-repository.ts";
import { SqliteReceiptRepository } from "../../infrastructure/repositories/sqlite/sqlite-receipt-repository.ts";
import { SqliteServiceRepository } from "../../infrastructure/repositories/sqlite/sqlite-service-repository.ts";

export interface AppContext {
  database: DatabaseSync;
  serviceController: ServiceController;
  payerController: PayerController;
  receiptController: ReceiptController;
}

export const createAppContext = (): AppContext => {
  const database = openDatabase();
  runMigrations(database);

  const serviceRepository = new SqliteServiceRepository(database);
  const payerRepository = new SqlitePayerRepository(database);
  const receiptRepository = new SqliteReceiptRepository(database);

  const serviceService = new ServiceService(serviceRepository);
  const payerService = new PayerService(payerRepository);
  const receiptService = new ReceiptService(receiptRepository, serviceRepository, payerRepository);

  return {
    database,
    serviceController: new ServiceController(serviceService),
    payerController: new PayerController(payerService),
    receiptController: new ReceiptController(receiptService),
  };
};
