import { ApplicationLogger } from './application-logger';

export class NativeLogger implements ApplicationLogger {
  log(message: string, metadata: Record<string, unknown>): void {
    console.log(JSON.stringify({ message, metadata }));
  }
  info(message: string, metadata: Record<string, unknown>): void {
    console.info(JSON.stringify({ message, metadata }));
  }
  warn(message: string, metadata: Record<string, unknown>): void {
    console.warn(JSON.stringify({ message, metadata }));
  }
  error(message: string, metadata: Record<string, unknown>): void {
    console.error(JSON.stringify({ message, metadata }));
  }
  debug(message: string, metadata: Record<string, unknown>): void {
    console.debug(JSON.stringify({ message, metadata }));
  }
}
