export interface ExportFilters {
  month?: number;
  year?: number;
  serviceId?: number;
  payerId?: number;
  hasInvoice?: boolean;
}

export class ExportService {
  toCsv(_filters: ExportFilters) {
    throw new Error("Exportação CSV será implementada na Sprint 4.");
  }

  toPdf(_filters: ExportFilters) {
    throw new Error("Exportação PDF será implementada na Sprint 4.");
  }
}
