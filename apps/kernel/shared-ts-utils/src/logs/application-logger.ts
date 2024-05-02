export type ILogStep = {
  message: string;
  metadata?: Record<string, unknown>;
};

export type ILogScope = {
  moduleName: string;
  className?: string;
  methodName?: string;
  functionName?: string;
};

export type ILogMetadata = {
  scope: ILogScope;
  steps: Array<ILogStep>;
};

export abstract class ApplicationLogger {
  abstract info(message: string, metadata?: Record<string, unknown>): void;
  abstract error(message: string, metadata?: Record<string, unknown>): void;
  abstract warn(message: string, metadata?: Record<string, unknown>): void;
  abstract debug?(message: string, metadata?: Record<string, unknown>): void;
  abstract emergency?(message: string, metadata?: Record<string, unknown>): void;
  abstract alert?(message: string, metadata?: Record<string, unknown>): void;
  abstract critical?(message: string, metadata?: Record<string, unknown>): void;
  abstract notice?(message: string, metadata?: Record<string, unknown>): void;
}
