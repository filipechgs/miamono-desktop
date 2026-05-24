import type { PayerService } from "../application/payer-service.ts";

export class PayerController {
  private readonly payerService: PayerService;

  constructor(payerService: PayerService) {
    this.payerService = payerService;
  }

  create(payerFullName: string) {
    return this.payerService.create(payerFullName);
  }

  update(id: number, payerFullName: string) {
    return this.payerService.update(id, payerFullName);
  }

  deactivate(id: number) {
    this.payerService.deactivate(id);
  }

  getList() {
    return this.payerService.listAll();
  }
}
