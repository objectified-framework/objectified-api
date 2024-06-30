import {OpenAPI} from '@objectified/openapi-parser/dist/schema';

(async () => {
  const args = process.argv.splice(2);
  const openApiFile = args[0];
  const yaml = require('yaml');
  const fs = require('fs');

  function showHelp() {
    console.log('Usage: typescript-generator [OpenAPI YAML File] <options>');
    console.log('Where <options> are:');
    console.log('...');
    process.exit(0);
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

  for(const key of Object.keys(componentSchemas)) {
    console.log(`${key}: ${componentSchemas[key].getSchema()['description'] ?? 'Missing description'}`);
  }
})();