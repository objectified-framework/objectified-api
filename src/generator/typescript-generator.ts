import { OpenAPI } from '@objectified/openapi-parser/dist/schema';
import {appendRawApiPropertyValue, generatePropertyTypeDefinition, generateTypeScriptTypeDefinition} from './util';

const GENERATED_FILE_HEADER = `/**
 * DO NOT MAKE ANY CHANGES TO THIS FILE, IT IS AUTOMATICALLY GENERATED.
 */`;

const STATIC_OPENAPI_FIELDS = [
  'default', 'minimum', 'maximum', 'minLength', 'maxLength',
];

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

  let index = `${GENERATED_FILE_HEADER}\n\n`;

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

    // Write export from DTO file generation into the index.
    index += `export * from './${key}.dto';\n`;

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
        dtoData += `    description: '${schemaProperties[property]['description'].replaceAll('\n', ' ')}',\n`;
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

      if (propertyType === 'array') {
        // Handle Array here
        dtoData += generatePropertyTypeDefinition(schemaProperties[property]['items']['type'], true);
        tsType = generateTypeScriptTypeDefinition(schemaProperties[property]['items']['type']) + '[]';
      } else {
        dtoData += generatePropertyTypeDefinition(schemaProperties[property]['type']);
        tsType = generateTypeScriptTypeDefinition(schemaProperties[property]['type']);
      }

      // Handle extra OpenAPI field values for type definitions that are handled by Swagger
      STATIC_OPENAPI_FIELDS.forEach((x) => {
        dtoData += appendRawApiPropertyValue(x, schemaProperties[property]);
      })

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

  if (!dryRun) {
    console.log('  + Finishing with \'index.ts\'');
    fs.writeFileSync(`${outputDtoDirectory}/index.ts`, index);
  } else {
    console.log('... finish process with index.ts output');
  }
})();
