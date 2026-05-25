import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DomainError } from "../../shared/errors/domain-error.ts";
import { TechnicalError } from "../../shared/errors/technical-error.ts";
import { ExportService, type ExportDocument } from "../../domains/exports/application/export-service.ts";
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
  const exportService = new ExportService();

  const buildDefaultFileName = (document: ExportDocument, extension: "csv" | "pdf"): string => {
    return `${document.fileNameBase}.${extension}`;
  };

  const resolveExportDir = (): string => app.getPath("documents");

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

  ipcMain.handle("receipts:list-years", () => {
    try {
      return success(context.receiptController.getAvailableYears());
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

  ipcMain.handle("exports:csv", async (_event, document: ExportDocument) => {
    try {
      if (document.summary.totalCount === 0) {
        return failure("Não há recebimentos para exportar com os filtros aplicados.");
      }

      const saveResult = await dialog.showSaveDialog({
        title: "Exportar CSV",
        defaultPath: join(resolveExportDir(), buildDefaultFileName(document, "csv")),
        filters: [{ name: "CSV", extensions: ["csv"] }],
      });

      if (saveResult.canceled || !saveResult.filePath) {
        return success({ saved: false });
      }

      const csv = exportService.toCsv(document);
      await writeFile(saveResult.filePath, csv, "utf-8");

      return success({ saved: true, filePath: saveResult.filePath });
    } catch (error) {
      return failure(resolveErrorMessage(error));
    }
  });

  ipcMain.handle("exports:pdf", async (_event, document: ExportDocument) => {
    let pdfWindow: BrowserWindow | null = null;

    try {
      if (document.summary.totalCount === 0) {
        return failure("Não há recebimentos para exportar com os filtros aplicados.");
      }

      const saveResult = await dialog.showSaveDialog({
        title: "Exportar PDF",
        defaultPath: join(resolveExportDir(), buildDefaultFileName(document, "pdf")),
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });

      if (saveResult.canceled || !saveResult.filePath) {
        return success({ saved: false });
      }

      pdfWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          sandbox: true,
          contextIsolation: true,
        },
      });

      const html = exportService.toPdfHtml(document);
      const encodedHtml = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
      await pdfWindow.loadURL(encodedHtml);

      const pdfBuffer = await pdfWindow.webContents.printToPDF({
        printBackground: true,
        landscape: false,
        margins: { top: 0.5, bottom: 0.5, left: 0.4, right: 0.4 },
      });

      await writeFile(saveResult.filePath, pdfBuffer);

      return success({ saved: true, filePath: saveResult.filePath });
    } catch (error) {
      return failure(resolveErrorMessage(error));
    } finally {
      if (pdfWindow && !pdfWindow.isDestroyed()) {
        pdfWindow.close();
      }
    }
  });
};
