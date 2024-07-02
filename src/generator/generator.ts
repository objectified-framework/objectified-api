/**
 * This generator generates DTO files for NestJS Swagger.
 */

import { GENERATED_FILE_HEADER } from './typescript-generator';
import {
  appendRawApiPropertyValue,
  generateEnumTypeDefinition,
  generatePropertyTypeDefinition,
  generateTypeScriptTypeDefinition,
  initCap, toPascalCase
} from './util';
import fs from 'fs';

const STATIC_OPENAPI_FIELDS: string[] = ['default', 'minimum', 'maximum', 'minLength', 'maxLength'];
const NESTJS_IMPORTS: string = "import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n\n";

export function generateDtoFiles(schema: any, outputDtoDirectory: string, dryRun: boolean) {
  const fs = require('fs');

  // Output file header
  let index = `${GENERATED_FILE_HEADER}\n\n`;

  for (const key of Object.keys(schema)) {
    const schemaProperties = schema[key].getSchema()['properties'];
    const outputDtoFilename = `${outputDtoDirectory}/${key}.dto.ts`;
    let dtoHeader = `${GENERATED_FILE_HEADER}\n`;
    let dtoData = '';
    let enumMap = {};
    const classDescription = (
      schema[key].getSchema()['description'] ?? `Auto-generated DTO class for '${key}' in /components/schemas`
    )
      .trim()
      .replaceAll('\n', '\n * ');
    const required = schema[key].getSchema()['required'];

    dtoHeader += NESTJS_IMPORTS;

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
      // Research 'pattern'

      if (schemaProperties[property]['enum']) {
        // Generate enumeration type, along with mapping of the enumeration definitions.
        // Enumeration is the "class name + PascalCase Enumeration Property name" with the value being the originally
        // defined value, since this has to be serialized over the wire.
        dtoData += generateEnumTypeDefinition(schemaProperties[property]['enum']);
        tsType = `${key}${initCap(property)}Enum`;

        enumMap[tsType] = schemaProperties[property]['enum'];
      } else {
        if (propertyType === 'array') {
          // Handle Array here
          dtoData += generatePropertyTypeDefinition(schemaProperties[property]['items']['type'], true);
          tsType = generateTypeScriptTypeDefinition(schemaProperties[property]['items']['type']) + '[]';
        } else {
          dtoData += generatePropertyTypeDefinition(schemaProperties[property]['type']);
          tsType = generateTypeScriptTypeDefinition(schemaProperties[property]['type']);
        }
      }

      // Handle extra OpenAPI field values for type definitions that are handled by Swagger
      STATIC_OPENAPI_FIELDS.forEach((x) => {
        dtoData += appendRawApiPropertyValue(x, schemaProperties[property]);
      });

      dtoData += '  })\n';

      if (requiredProperty) {
        dtoData += `  ${property}: ${tsType};\n\n`;
      } else {
        dtoData += `  ${property}?: ${tsType};\n\n`;
      }
    }

    dtoData += '}\n';

    let dtoBody = '';

    dtoBody = dtoHeader;

    // Output each enumeration prior to the definition of the class here.  This generates the names of the
    // enumeration type names along with the PascalCase names and their respective values.  This makes for
    // programmatic use of the values, but only writes the enumeration maps if they exist.
    for (const enumType of Object.keys(enumMap)) {
      dtoBody += `export enum ${enumType} {\n`;

      enumMap[enumType].forEach((x: string) => {
        dtoBody += `  ${toPascalCase(x)} = '${x}',\n`;
      });

      dtoBody += `};\n\n`;
    }

    dtoBody += `/**
 * ${classDescription}
 */
export class ${key}Dto {
`;
    dtoBody += dtoData;

    if (!dryRun) {
      console.log(`  - ${key} -> ${outputDtoFilename}`);
      fs.writeFileSync(`${outputDtoFilename}`, dtoBody);
    } else {
      console.log(`... would write ${outputDtoFilename} DTO file`);
    }
  }

  if (!dryRun) {
    console.log("  + Finishing with 'index.ts'");
    fs.writeFileSync(`${outputDtoDirectory}/index.ts`, index);
  } else {
    console.log('... finish process with index.ts output');
  }

}