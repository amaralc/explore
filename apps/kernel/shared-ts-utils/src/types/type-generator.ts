import * as fs from 'fs';
import * as glob from 'glob';
import { compile, JSONSchema } from 'json-schema-to-typescript';
import * as path from 'path';
import * as tsConfigPaths from 'tsconfig-paths';

// Extract types from a schema
async function generateTypeForSchema(schemaPath: string) {
  // Load the TypeScript configuration file dynamically from root
  const tsConfigPath = path.resolve(__dirname, '..', '..', '..', '..', '..', 'tsconfig.base.json');
  const { compilerOptions } = await import(tsConfigPath);

  // Setup TypeScript path mappings dynamically
  tsConfigPaths.register({
    baseUrl: path.resolve(compilerOptions.baseUrl || './'),
    paths: compilerOptions.paths || {},
  });

  const schemaModule = await import(schemaPath);
  const schema = schemaModule.default; // Your schema file should export a default schema

  if (!schema.title) {
    throw new Error('Schema must have a title that will be use to name the generated type');
  }

  const typeName = schema.title.replace(/\s+/g, '');
  const ts = await compile(schema as JSONSchema, typeName);

  const schemaDir = path.dirname(schemaPath);

  // Generate the output file name
  const originalFileName = path.basename(schemaPath, '.ts'); // Remove .ts extension
  const outputFileName = `${originalFileName}.types.d.ts`; // Append .schema.types.d.ts
  const outputFilePath = path.join(schemaDir, outputFileName);

  fs.writeFileSync(outputFilePath, ts);

  fs.writeFileSync(outputFilePath, ts);
}

// Find all schemas and generate types
async function generateTypesForAllSchemas() {
  // Find files that end with .schema.ts
  const schemaFiles = glob.sync('**/**.schema.ts');

  for (const schemaFile of schemaFiles) {
    console.log(`Generating types for: ${schemaFile}`);
    await generateTypeForSchema(path.resolve(schemaFile));
  }
}

generateTypesForAllSchemas().catch(console.error);
