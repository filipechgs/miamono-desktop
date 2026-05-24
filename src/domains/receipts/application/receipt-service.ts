import type {
  CreateReceiptInput,
  ReceiptFilter,
  ReceiptRepository,
} from "../repository/receipt-repository.ts";
import type { ServiceRepository } from "../../services/repository/service-repository.ts";
import type { PayerRepository } from "../../payers/repository/payer-repository.ts";
import { DomainError } from "../../../shared/errors/domain-error.ts";
import { ErrorCodes } from "../../../shared/errors/error-codes.ts";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidIsoDate = (value: string): boolean => {
  if (!ISO_DATE_REGEX.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
};

export class ReceiptService {
  private readonly receiptRepository: ReceiptRepository;
  private readonly serviceRepository: ServiceRepository;
  private readonly payerRepository: PayerRepository;

  constructor(
    receiptRepository: ReceiptRepository,
    serviceRepository: ServiceRepository,
    payerRepository: PayerRepository,
  ) {
    this.receiptRepository = receiptRepository;
    this.serviceRepository = serviceRepository;
    this.payerRepository = payerRepository;
  }

  private validateInput(input: CreateReceiptInput): void {
    if (!input.receiptDate || !isValidIsoDate(input.receiptDate)) {
      throw new DomainError(
        "Data do recebimento inválida. Use o formato AAAA-MM-DD.",
        ErrorCodes.domain.validation,
      );
    }

    if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
      throw new DomainError(
        "Valor deve ser maior que zero.",
        ErrorCodes.domain.validation,
      );
    }

    const service = this.serviceRepository.findById(input.serviceId);

    if (!service) {
      throw new DomainError(
        "Serviço não encontrado.",
        ErrorCodes.domain.notFound,
        { serviceId: input.serviceId },
      );
    }

    if (!service.isActive) {
      throw new DomainError(
        "O serviço selecionado está inativo.",
        ErrorCodes.domain.businessRule,
        { serviceId: input.serviceId },
      );
    }

    const payer = this.payerRepository.findById(input.payerId);

    if (!payer) {
      throw new DomainError(
        "Pagador não encontrado.",
        ErrorCodes.domain.notFound,
        { payerId: input.payerId },
      );
    }

    if (!payer.isActive) {
      throw new DomainError(
        "O pagador selecionado está inativo.",
        ErrorCodes.domain.businessRule,
        { payerId: input.payerId },
      );
    }
  }

  create(input: CreateReceiptInput) {
    this.validateInput(input);
    return this.receiptRepository.create(input);
  }

  update(id: number, input: CreateReceiptInput) {
    const existing = this.receiptRepository.findById(id);

    if (!existing) {
      throw new DomainError(
        "Recebimento não encontrado.",
        ErrorCodes.domain.notFound,
        { id },
      );
    }

    this.validateInput(input);
    return this.receiptRepository.update(id, input);
  }

  remove(id: number) {
    const existing = this.receiptRepository.findById(id);

    if (!existing) {
      throw new DomainError(
        "Recebimento não encontrado.",
        ErrorCodes.domain.notFound,
        { id },
      );
    }

    this.receiptRepository.remove(id);
  }

  findById(id: number) {
    return this.receiptRepository.findById(id);
  }

  listFiltered(filter: ReceiptFilter) {
    return this.receiptRepository.listFiltered(filter);
  }
}
