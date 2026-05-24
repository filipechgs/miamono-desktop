export abstract class AppError extends Error {
  public readonly code: string;
  public readonly metadata?: Record<string, unknown>;

  protected constructor(message: string, code: string, metadata?: Record<string, unknown>) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.metadata = metadata;
  }
}
