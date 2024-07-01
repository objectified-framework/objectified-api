export function appendRawApiPropertyValue(propertyName: string, properties: any): string {
  if (properties[propertyName] !== undefined) {
    return `    ${propertyName}: ${JSON.stringify(properties[propertyName])},\n`;
  }

  return '';
}
