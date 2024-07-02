import { OpenAPI } from '@objectified/openapi-parser/dist/schema';
import {generateDtoFiles} from './generator';

export const GENERATED_FILE_HEADER = `/**
 * DO NOT MAKE ANY CHANGES TO THIS FILE, IT IS AUTOMATICALLY GENERATED.
 */`;

function showHelp() {
  console.log('Usage: typescript-generator [OpenAPI YAML File] [output-directory] (--dry-run)');
  console.log('Where <options> are:');
  console.log('  --dry-run   Will show what the code will do, but will not write it.');
  console.log('  --help/-h   Will show this help and exit.');
  process.exit(0);
}

(async () => {
  const args = process.argv.splice(2);
  const openApiFile = args[0];
  let outputDirectory = args[1] ?? 'src';
  let dryRun = false;
  const yaml = require('yaml');
  const fs = require('fs');

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
  }

  if (args.includes('--dry-run')) {
    dryRun = true;
    console.log('Dry-run');
  }

  if (!fs.existsSync(openApiFile)) {
    console.log(`OpenAPI file ${openApiFile} does not exist.`);
    showHelp();
  }

  console.log(`Using OpenAPI File ${openApiFile} ...`);
  const specFile = yaml.parse(fs.readFileSync(openApiFile, 'utf8'));

  if (!specFile) {
    console.log(`OpenAPI YAML file ${openApiFile} cannot be parsed.`);
    process.exit(0);
  }

  console.log(`Building OpenAPI Spec tree ...`);
  const tree = OpenAPI.parse(specFile);
  const components = tree.getComponents();
  const componentSchemas = components.getSchemas();
  const outputDtoDirectory = `${outputDirectory}/generated/dto`;

  if (!dryRun) {
    if (!fs.existsSync(outputDtoDirectory)) {
      fs.mkdirSync(outputDtoDirectory, { recursive: true });
    }
  }

  // Step 1: Create DTO schemas for all objects in #/components/schemas
  console.log(`Generating Data Type Objects in ${outputDtoDirectory} ...`);
  generateDtoFiles(componentSchemas, outputDtoDirectory, dryRun);
})();
