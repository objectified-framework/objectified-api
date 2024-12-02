/**
 * This is a type formatter that converts types from one type to another, matching object types for
 * GraphQL and for JSON Schema definitions.
 *
 * @param key The key to parse for.
 * @param value The value of the key.
 * @returns Altered value if applicable, otherwise, returns the original value that was sent.
 */
export function typeFormatter(key: string, value: string) {
  if (key.toLowerCase() === 'type') {
    switch(value.toLowerCase()) {
      case 'number':
      case 'integer':
      case 'float':
      case 'double':
        return 'number';

      case 'string':
        return 'string';

      case 'boolean':
        return 'boolean';

      case 'object':
        return 'object';

      case 'array':
        return 'array';

      default:
        return value;
    }
  }

  if (key.toLowerCase() === 'description') {
    return value.replaceAll('\n', ' ');
  }

  return value;
}

/**
 * Takes in a JSON Schema snippet, and returns a TypeScript type that matches the definition.
 * Translates $ref values, parsing off the `#/component/schemas` field, and attaching a TypeScript well formatted
 * type in its place.  Converts enumeration values to TypeScript enumeration values.  Converts numeric types to
 * `number`, string types to `string`, and arrays to `type[]` with recursion.
 *
 * @param properties The JSON schema snippet.
 * @param language {string} containing the language to convert to.  Default is `node`.
 * @returns string containing the translated value.
 */
export function propertyToType(properties: any, language: string = 'node'): string {
  const { type, $ref, format } = properties;

  if (language.toLowerCase() == 'node') {
    // Formatting is handled here if the type is a date-time
    if (format) {
      switch (format.toString()) {
        case 'date-time':
          return 'Date';
      }
    }

    // $ref objects are converted to a DTO, as this document covers only defined objects that this convertor knows about.
    if ($ref) {
      return $ref.substring($ref.lastIndexOf('/') + 1) + 'Dto';
    }

    // Enumeration values.
    if (properties.enum) {
      return '[ ' + properties.enum
        .map((x: string) => `'${x}'`)
        .join(' | ') + ' ]';
    }

    // Fall back to raw types if the type is not an enumeration or ref.
    switch (type.toLowerCase()) {
      case 'integer':
        if (format?.toLowerCase() === 'int64') {
          return 'bigint';
        }

        return 'number';

      case 'array':
        return `${propertyToType(properties.items)}[]`;

      case 'object':
        if (properties.properties) {
          throw new Error(`Unable to handle an object with properties: ${JSON.stringify(properties, null, 2)}`);
        }

        return 'any';
    }

    // Catch-all if no type checking is necessary
    return type;
  }

  return type;
}

/**
 * Capitalization of word.
 *
 * @param str Converts word to capitalized word.
 */
export function initCap(str: string): string {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

/**
 * Converts a string to camel case.
 *
 * @param str String to convert.
 */
export function toCamelCase(str: string): string {
  const s =
    str &&
    str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join('');

  return s.slice(0, 1).toLowerCase() + s.slice(1);
}

/**
 * Converts a string to kebab-case.
 *
 * @param str String to convert
 * @returns `string` in kebab-case.
 */
export function toKebabCase(str: string): string {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('-');
}

/**
 * Converts a string to PascalCase.
 *
 * @param str String to convert.
 * @returns The PascalCased string.
 */
export function toPascalCase(str: string): string {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
    .join('');
}