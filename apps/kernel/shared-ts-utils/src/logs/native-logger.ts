import { ApplicationLogger, ILogMetadata } from './application-logger';

export class NativeLogger implements ApplicationLogger {
  private metadata: ILogMetadata = {
    scope: {
      moduleName: 'shared-ts-utils',
      className: NativeLogger.name,
    },
    steps: [],
  };

  constructor(scope?: ILogMetadata['scope']) {
    this.setLogScope(scope);
  }

  setLogScope(scope: ILogMetadata['scope']): void {
    this.metadata.scope = scope;
  }

  setLogStep(step: ILogMetadata['steps'][0]): void {
    this.metadata.steps.push(step);
  }

  log(message: string, metadata?: Record<string, unknown>): void {
    console.log(message, JSON.stringify({ ...this.metadata, ...metadata }));
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    console.error(message, JSON.stringify({ ...this.metadata, ...metadata }));
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(message, JSON.stringify({ ...this.metadata, ...metadata }));
  }
}
