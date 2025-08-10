import { ApplicationLogger, ILogMetadata } from './application-logger';

export class NativeLogger implements ApplicationLogger {
  info(message: string, metadata?: ILogMetadata): void {
    console.info(JSON.stringify({ message, ...(metadata ?? {}), memoryUsage: process.memoryUsage() }));
  }

  error(message: string, metadata?: ILogMetadata): void {
    console.log(JSON.stringify({ message, ...(metadata ?? {}), memoryUsage: process.memoryUsage() }));
  }

  warn(message: string, metadata?: ILogMetadata): void {
    console.log(JSON.stringify({ message, ...(metadata ?? {}), memoryUsage: process.memoryUsage() }));
  }
}

export const nativeLogger = new NativeLogger();
