import type { ReceiptService } from "../application/receipt-service.ts";
import type { CreateReceiptInput, ReceiptFilter } from "../repository/receipt-repository.ts";

export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

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

  getFiltered(filter: ReceiptFilter) {
    return this.receiptService.listFiltered(filter);
  }
}
