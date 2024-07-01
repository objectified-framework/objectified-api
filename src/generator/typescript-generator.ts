import { OpenAPI } from '@objectified/openapi-parser/dist/schema';

const GENERATED_FILE_HEADER = `/**
 * DO NOT MAKE ANY CHANGES TO THIS FILE, IT IS AUTOMATICALLY GENERATED.
 */`;

(async () => {
  const args = process.argv.splice(2);
  const openApiFile = args[0];
  let outputDirectory = args[1] ?? 'src';
  let dryRun = false;
  const yaml = require('yaml');
  const fs = require('fs');

  function showHelp() {
    console.log('Usage: typescript-generator [OpenAPI YAML File] [output-directory] (--dry-run)');
    console.log('Where <options> are:');
    console.log('  --dry-run   Will show what the code will do, but will not write it.');
    console.log('  --help/-h   Will show this help and exit.');
    process.exit(0);
  }

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

  for (const key of Object.keys(componentSchemas)) {
    const schemaProperties = componentSchemas[key].getSchema()['properties'];
    const outputDtoFilename = `${outputDtoDirectory}/${key}.dto.ts`;
    let dtoData = `${GENERATED_FILE_HEADER}\n`;
    const classDescription = (
      componentSchemas[key].getSchema()['description'] ?? `Auto-generated DTO class for '${key}' in /components/schemas`
    )
      .trim()
      .replaceAll('\n', '\n * ');
    const required = componentSchemas[key].getSchema()['required'];

    dtoData += `
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ${classDescription}
 */
export class ${key}Dto {
`;

    for (const property of Object.keys(schemaProperties)) {
      const requiredProperty = required.includes(property);
      const stringifiedProperty = JSON.stringify(schemaProperties[property], null, 2).replaceAll('\n', '\n   * ');

      dtoData += `  /**\n   * Original definition:\n   *\n   * ${stringifiedProperty}\n   */\n`;

      if (requiredProperty) {
        dtoData += '  @ApiProperty({\n';
      } else {
        dtoData += '  @ApiPropertyOptional({\n';
      }

      if (schemaProperties[property]['description']) {
        dtoData += `    description: '${schemaProperties[property]['description']}',\n`;
      }

      if (!schemaProperties[property]['type']) {
        console.log(`  - ${key}: Skipping property '${property}': No 'type' specified.`);
        continue;
      }

      const propertyType = schemaProperties[property]['type'].toLowerCase();
      let tsType = '';

      // TODO:
      // Support for '$ref'
      // Support for 'array' types
      // Support for 'date-time' format
      // Research 'pattern'
      // Support for enum

      switch (propertyType) {
        case 'integer':
        case 'number':
        case 'float':
        case 'double':
          dtoData += '    type: Number,\n';
          tsType = 'number';
          break;

        case 'boolean':
          dtoData += '    type: Boolean,\n';
          tsType = 'boolean';
          break;

        case 'string':
          dtoData += '    type: String,\n';
          tsType = 'string';
          break;

        case 'object':
          dtoData += '    type: Object,\n';
          tsType = 'any';
          break;

        case 'array':
          dtoData += '    type: [Array],\n';
          tsType = 'any[]';
          break;

        default:
          dtoData += `    type: Unknown(${schemaProperties[property]['type']}),\n`;
          tsType = 'any';
          break;
      }

      dtoData += '  })\n';

      if (requiredProperty) {
        dtoData += `  ${property}: ${tsType};\n\n`;
      } else {
        dtoData += `  ${property}?: ${tsType};\n\n`;
      }
    }

    dtoData += '}\n';

    if (!dryRun) {
      console.log(`  - ${key} -> ${outputDtoFilename}`);
      fs.writeFileSync(`${outputDtoFilename}`, dtoData);
    } else {
      console.log(`... would write ${outputDtoFilename} DTO file`);
    }
  }
})();
