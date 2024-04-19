type ILogStep = {
  message: string;
  metadata?: Record<string, unknown>;
};

type ILogScope = {
  moduleName: string;
  className?: string;
  methodName?: string;
  functionName?: string;
};

export type ILogMetadata = {
  steps: Array<ILogStep>;
  scope: ILogScope;
};

export abstract class ApplicationLogger {
  abstract setLogScope(scope: ILogScope): void;
  abstract setLogStep(step: ILogStep): void;
  abstract log(message: string, metadata?: Record<string, unknown>): void;
  abstract info?(message: string, metadata?: Record<string, unknown>): void;
  abstract error(message: string, metadata?: Record<string, unknown>): void;
  abstract warn(message: string, metadata?: Record<string, unknown>): void;
  abstract debug?(message: string, metadata?: Record<string, unknown>): void;
  abstract emergency?(message: string, metadata?: Record<string, unknown>): void;
  abstract alert?(message: string, metadata?: Record<string, unknown>): void;
  abstract critical?(message: string, metadata?: Record<string, unknown>): void;
  abstract notice?(message: string, metadata?: Record<string, unknown>): void;
}
