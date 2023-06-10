import { BrowserExecutorSchema } from './schema';

export default async function runExecutor(options: BrowserExecutorSchema) {
  console.log('Executor ran for Browser', options);
  return {
    success: true,
  };
}
