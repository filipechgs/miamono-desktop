import type { PayerRepository } from "../repository/payer-repository.ts";
import { DomainError } from "../../../shared/errors/domain-error.ts";
import { ErrorCodes } from "../../../shared/errors/error-codes.ts";
import { normalizeDisplayName } from "../../../shared/utils/name-normalizer.ts";

export class PayerService {
  private readonly payerRepository: PayerRepository;

  constructor(payerRepository: PayerRepository) {
    this.payerRepository = payerRepository;
  }

  create(rawPayerFullName: string) {
    const payerFullName = normalizeDisplayName(rawPayerFullName);

    if (!payerFullName) {
      throw new DomainError("Nome do pagador é obrigatório.", ErrorCodes.domain.validation);
    }

    const existingPayer = this.payerRepository.findByName(payerFullName);

    if (existingPayer) {
      throw new DomainError(
        "Já existe um pagador com esse nome.",
        ErrorCodes.domain.businessRule,
        { payerFullName },
      );
    }

    return this.payerRepository.create(payerFullName);
  }

  update(id: number, rawPayerFullName: string) {
    const payerFullName = normalizeDisplayName(rawPayerFullName);

    if (!payerFullName) {
      throw new DomainError("Nome do pagador é obrigatório.", ErrorCodes.domain.validation);
    }

    const existingById = this.payerRepository.findById(id);

    if (!existingById) {
      throw new DomainError("Pagador não encontrado.", ErrorCodes.domain.notFound, { id });
    }

    const existingByName = this.payerRepository.findByName(payerFullName);

    if (existingByName && existingByName.id !== id) {
      throw new DomainError(
        "Já existe um pagador com esse nome.",
        ErrorCodes.domain.businessRule,
        { payerFullName },
      );
    }

    return this.payerRepository.update(id, payerFullName);
  }

  deactivate(id: number) {
    const existingById = this.payerRepository.findById(id);

    if (!existingById) {
      throw new DomainError("Pagador não encontrado.", ErrorCodes.domain.notFound, { id });
    }

    this.payerRepository.deactivate(id);
  }

  listAll() {
    return this.payerRepository.listAll();
  }
}
