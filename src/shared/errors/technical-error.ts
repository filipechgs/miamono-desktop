import { AppError } from "./app-error.ts";
import type { TechnicalErrorCode } from "./error-codes.ts";

export class TechnicalError extends AppError {
  public readonly causeError?: unknown;

  constructor(
    message: string,
    code: TechnicalErrorCode,
    metadata?: Record<string, unknown>,
    causeError?: unknown,
  ) {
    super(message, code, metadata);
    this.causeError = causeError;
  }
}
