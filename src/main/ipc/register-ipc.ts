import { ipcMain } from "electron";
import { DomainError } from "../../shared/errors/domain-error.ts";
import { TechnicalError } from "../../shared/errors/technical-error.ts";
import type { AppContext } from "../bootstrap/app-context.ts";
import type { CreateReceiptInput, ReceiptFilter } from "../../domains/receipts/repository/receipt-repository.ts";

interface IpcResult<T> {
  ok: boolean;
  data?: T;
  errorMessage?: string;
}

const success = <T>(data: T): IpcResult<T> => ({ ok: true, data });

const failure = (errorMessage: string): IpcResult<never> => ({ ok: false, errorMessage });

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof DomainError || error instanceof TechnicalError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
};

export const registerIpcHandlers = (context: AppContext): void => {
  ipcMain.handle("services:list", () => success(context.serviceController.getList()));

  ipcMain.handle("services:create", (_event, serviceName: string) => {
    try {
      return success(context.serviceController.create(serviceName));
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });

  ipcMain.handle("services:update", (_event, id: number, serviceName: string) => {
    try {
      return success(context.serviceController.update(id, serviceName));
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });

  ipcMain.handle("services:deactivate", (_event, id: number) => {
    try {
      context.serviceController.deactivate(id);
      return success(true);
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });

  ipcMain.handle("payers:list", () => success(context.payerController.getList()));

  ipcMain.handle("payers:create", (_event, payerFullName: string) => {
    try {
      return success(context.payerController.create(payerFullName));
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });

  ipcMain.handle("payers:update", (_event, id: number, payerFullName: string) => {
    try {
      return success(context.payerController.update(id, payerFullName));
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });

  ipcMain.handle("payers:deactivate", (_event, id: number) => {
    try {
      context.payerController.deactivate(id);
      return success(true);
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });

  ipcMain.handle("receipts:list-filtered", (_event, filter: ReceiptFilter) => {
    try {
      return success(context.receiptController.getFiltered(filter));
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });

  ipcMain.handle("receipts:create", (_event, input: CreateReceiptInput) => {
    try {
      return success(context.receiptController.create(input));
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });

  ipcMain.handle("receipts:update", (_event, id: number, input: CreateReceiptInput) => {
    try {
      return success(context.receiptController.update(id, input));
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });

  ipcMain.handle("receipts:remove", (_event, id: number) => {
    try {
      context.receiptController.remove(id);
      return success(true);
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });
};
