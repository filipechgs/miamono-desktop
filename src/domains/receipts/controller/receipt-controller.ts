import type { ReceiptService } from "../application/receipt-service.ts";
import type { CreateReceiptInput, ReceiptFilter } from "../repository/receipt-repository.ts";

export class ReceiptController {
  private readonly receiptService: ReceiptService;

  constructor(receiptService: ReceiptService) {
    this.receiptService = receiptService;
  }

  create(input: CreateReceiptInput) {
    return this.receiptService.create(input);
  }

  update(id: number, input: CreateReceiptInput) {
    return this.receiptService.update(id, input);
  }

  remove(id: number) {
    this.receiptService.remove(id);
  }

  findById(id: number) {
    return this.receiptService.findById(id);
  }

  getAvailableYears() {
    return this.receiptService.listAvailableYears();
  }

  getFiltered(filter: ReceiptFilter) {
    return this.receiptService.listFiltered(filter);
  }
}
