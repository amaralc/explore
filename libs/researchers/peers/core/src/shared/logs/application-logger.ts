export abstract class ApplicationLogger {
  abstract info(message: string, metadata: Record<string, unknown>): void;
  abstract error(message: string, metadata: Record<string, unknown>): void;
  abstract warn(message: string, metadata: Record<string, unknown>): void;
  abstract debug(message: string, metadata: Record<string, unknown>): void;
  abstract emergency?(message: string, metadata: Record<string, unknown>): void;
  abstract alert?(message: string, metadata: Record<string, unknown>): void;
  abstract critical?(message: string, metadata: Record<string, unknown>): void;
  abstract notice?(message: string, metadata: Record<string, unknown>): void;
}
