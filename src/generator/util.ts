export function appendRawApiPropertyValue(propertyName: string, properties: any): string {
  if (properties[propertyName] !== undefined) {
    return `    ${propertyName}: ${JSON.stringify(properties[propertyName])},\n`;
  }

  return '';
}

// TODO:
// Support for '$ref'
// Support for 'array' types
// Support for 'date-time' format
// Research 'pattern'
// Support for enum

export function generatePropertyTypeDefinition(type: string, array: boolean = false): string {
  const propertyType = type.toLowerCase();
  let typeValue = '';

  switch (propertyType) {
    case 'integer':
    case 'number':
    case 'float':
    case 'double':
      typeValue = 'Number';
      break;

    case 'boolean':
      typeValue = 'Boolean';
      break;

    case 'string':
      typeValue = 'String';
      break;

    case 'object':
      typeValue = 'Object';
      break;

    case 'array':
      typeValue = 'Array';
      break;

    default:
      typeValue = type;
      break;
  }

  if (array) {
    return `    type: [${typeValue}],\n`;
  }

  return `    type: ${typeValue},\n`;
}

export function generateTypeScriptTypeDefinition(type: string): string {
  const propertyType = type.toLowerCase();

  switch (propertyType) {
    case 'integer':
    case 'number':
    case 'float':
    case 'double':
      return 'number';

    case 'boolean':
      return 'boolean';

    case 'string':
      return 'string';

    case 'object':
      return 'any';

    case 'array':
      return 'any[]';

    default:
      return 'any';
  }
}