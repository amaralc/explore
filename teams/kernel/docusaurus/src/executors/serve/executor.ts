// Reference: https://github.com/ZachJW34/nx-plus/blob/master/libs/docusaurus/src/executors/dev-server/executor.ts

import { serve } from '@docusaurus/core/lib';
import { ExecutorContext } from '@nx/devkit';
import * as path from 'path';
import { join } from 'path';
import { ServeExecutorSchema } from './schema';

export default async function* runExecutor(options: ServeExecutorSchema, context: ExecutorContext) {
  const projectRoot = path.join(context.root, context.workspace.projects[context.projectName ?? ''].root);
  const port = options.port.toString();

  await serve(projectRoot, {
    port,
    host: options.host,
    open: options.open,
    dir: join(context.root, options.outputPath),
  });

  yield {
    baseUrl: `http://localhost:${port}`,
    success: true,
  };

  // This Promise intentionally never resolves, leaving the process running
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await new Promise<{ success: boolean }>(() => {});
}
