import type { ServiceRepository } from "../repository/service-repository.ts";
import { DomainError } from "../../../shared/errors/domain-error.ts";
import { ErrorCodes } from "../../../shared/errors/error-codes.ts";
import { normalizeDisplayName } from "../../../shared/utils/name-normalizer.ts";

export class ServiceService {
  private readonly serviceRepository: ServiceRepository;

  constructor(serviceRepository: ServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  create(rawServiceName: string) {
    const serviceName = normalizeDisplayName(rawServiceName);

    if (!serviceName) {
      throw new DomainError("Nome do serviço é obrigatório.", ErrorCodes.domain.validation);
    }

    const existingService = this.serviceRepository.findByName(serviceName);

    if (existingService) {
      throw new DomainError(
        "Já existe um serviço com esse nome.",
        ErrorCodes.domain.businessRule,
        { serviceName },
      );
    }

    return this.serviceRepository.create(serviceName);
  }

  update(id: number, rawServiceName: string) {
    const serviceName = normalizeDisplayName(rawServiceName);

    if (!serviceName) {
      throw new DomainError("Nome do serviço é obrigatório.", ErrorCodes.domain.validation);
    }

    const existingById = this.serviceRepository.findById(id);

    if (!existingById) {
      throw new DomainError("Serviço não encontrado.", ErrorCodes.domain.notFound, { id });
    }

    const existingByName = this.serviceRepository.findByName(serviceName);

    if (existingByName && existingByName.id !== id) {
      throw new DomainError(
        "Já existe um serviço com esse nome.",
        ErrorCodes.domain.businessRule,
        { serviceName },
      );
    }

    return this.serviceRepository.update(id, serviceName);
  }

  deactivate(id: number) {
    const existingById = this.serviceRepository.findById(id);

    if (!existingById) {
      throw new DomainError("Serviço não encontrado.", ErrorCodes.domain.notFound, { id });
    }

    this.serviceRepository.deactivate(id);
  }

  listAll() {
    return this.serviceRepository.listAll();
  }
}
