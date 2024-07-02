import { OpenAPI } from '@objectified/openapi-parser/dist/schema';
import {generateDtoFiles} from './generator';

function showHelp() {
  console.log('Usage: openapi-generator [OpenAPI YAML File] [output-directory] (--dry-run)');
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

  console.log(`Using OpenAPI File '${openApiFile}'`);
  const specFile = yaml.parse(fs.readFileSync(openApiFile, 'utf8'));

  if (!specFile) {
    console.log(`OpenAPI YAML file '${openApiFile}' cannot be parsed.`);
    process.exit(0);
  }

  // If parsing of the OpenAPI 3.1 Specification fails for any reason, this application will terminate, as
  // this next line will fail parsing.  (It will, of course, output why the failure occurred.)
  const tree = OpenAPI.parse(specFile);

  // After building the tree, walk the tree and start building the required files for auto-generation.
  // We start with components, then build paths, then the controllers and services templates after that,
  // depending on the language being used.
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
