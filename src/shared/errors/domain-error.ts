import { AppError } from "./app-error.ts";
import type { DomainErrorCode } from "./error-codes.ts";

export class DomainError extends AppError {
  constructor(message: string, code: DomainErrorCode, metadata?: Record<string, unknown>) {
    super(message, code, metadata);
  }
}
