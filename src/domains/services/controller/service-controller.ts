import type { ServiceService } from "../application/service-service.ts";

export class ServiceController {
  private readonly serviceService: ServiceService;

  constructor(serviceService: ServiceService) {
    this.serviceService = serviceService;
  }

  create(serviceName: string) {
    return this.serviceService.create(serviceName);
  }

  update(id: number, serviceName: string) {
    return this.serviceService.update(id, serviceName);
  }

  deactivate(id: number) {
    this.serviceService.deactivate(id);
  }

  getList() {
    return this.serviceService.listAll();
  }
}
