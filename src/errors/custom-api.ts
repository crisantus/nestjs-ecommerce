export class CustomAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
