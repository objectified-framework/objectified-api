/**
 * This is a purpose-built Data Type Object (DTO) generator.
 *
 * It reads the openapi.yaml file, traverses the `#/components/schemas` section, and generates DTO objects
 * compatible for use with NestJS and React applications.  These DTO objects are decorated with
 * annotations from the NestJS Swagger library.
 */

const GENERATORS = ['nestjs'];
const DTO_DIRECTORY: string = 'src/generated/dto';
const DAO_DIRECTORY: string = 'src/generated/dao';
const CONTROLLER_DIRECTORY: string = 'src/generated/controllers';
const CLIENT_DIRECTORY: string = 'src/generated/clients';
const SERVICES_DIRECTORY: string = 'src/generated/services';
const UTILS_DIRECTORY: string = 'src/generated/util';
const VERSION: string = '0.1.9';

import * as fs from 'fs';
import * as yaml from 'yaml';

(async () => {
  const { Command, Option } = require('commander');
  const program = new Command();

  console.log(`Code Auto-Generator: ${VERSION}`);

  program
    .argument('<filename>', 'OpenAPI Input Specification')
    .addOption(new Option('-g <generator>', 'output generator to use').choices(GENERATORS))
    .option('--dto <directory>', 'output directory for generated DTOs', DTO_DIRECTORY)
    .option('--dao <directory>', 'output directory for generated DAOs', DAO_DIRECTORY)
    .option('--controllers <directory>', 'output directory for generated controllers', CONTROLLER_DIRECTORY)
    .option('--clients <directory>', 'output directory for generated clients', CLIENT_DIRECTORY)
    .option('--services <directory>', 'output directory for generated services', SERVICES_DIRECTORY)
    .option('--utils <directory>', 'output directory for generated utils', UTILS_DIRECTORY)
    .option('--skip-dto', 'skip generation of DTOs')
    .option('--skip-dao', 'skip generation of DAOs')
    .option('--skip-controller', 'skip generation of controllers')
    .option('--skip-clients', 'skip generation of clients')
    .option('--skip-services', 'skip generation of services')
    .option('--skip-utils', 'skip generation of utils')
    .parse();

  if (!fs.existsSync(program.args[0])) {
    console.error(`File ${program.args[0]} not found.`);
    console.log(program.help());
    return;
  }

  const fileData = fs.readFileSync(program.args[0], 'utf8');
  const openapi = yaml.parse(fileData);

  fs.rmSync(DTO_DIRECTORY, { recursive: true, force: true });

  const generator = require(`./${program.opts().g}`);

  if (!program.opts().skipDao) {
    generator.generateDaos(program.opts().dao, openapi);
  }

  if (!program.opts().skipDto) {
    generator.generateDtos(program.opts().dto, openapi);
  }

  if (!program.opts().skipController) {
    generator.generateControllers(program.opts().controllers, openapi);
  }

  if (!program.opts().skipClients) {
    generator.generateClients(program.opts().clients, openapi);
  }

  if (!program.opts().skipServices) {
    generator.generateServices(program.opts().services, openapi);
  }

  if (!program.opts().skipUtils) {
    generator.generateSecuritySchemes(program.opts().utils, openapi);
  }
})();
