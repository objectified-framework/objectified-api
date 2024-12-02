/**
 * This is a purpose-built Data Type Object (DTO) generator.
 *
 * It reads the openapi.yaml file, traverses the `#/components/schemas` section, and generates DTO objects
 * compatible for use with NestJS and React applications.  These DTO objects are decorated with
 * annotations from the NestJS Swagger library.
 */
import {Option} from "commander";

const GENERATORS = ['nestjs', 'python'];
const DTO_DIRECTORY: string = 'src/generated/dto';
const DAO_DIRECTORY: string = 'src/generated/dao';
const CONTROLLER_DIRECTORY: string = 'src/generated/controllers';
const SERVICES_DIRECTORY: string = 'src/generated/services';
const UTILS_DIRECTORY: string = 'src/generated/util';

import * as fs from 'fs';
import * as yaml from 'yaml';

(async () => {
  const version = yaml.parse(fs.readFileSync('gen.yaml', 'utf8'))['version'];
  const { Command, Option } = require('commander');
  const program = new Command();

  console.log(`Code Auto-Generator: ${version}`);

  program
    .argument('<filename>', 'OpenAPI Input Specification')
    .addOption(new Option('-g <generator>', 'output generator to use').choices(GENERATORS))
    .option('--dto <directory>', 'output directory for generated DTOs', DTO_DIRECTORY)
    .option('--dao <directory>', 'output directory for generated DAOs', DAO_DIRECTORY)
    .option('--controller <directory>', 'output directory for generated controllers', CONTROLLER_DIRECTORY)
    .option('--services <directory>', 'output directory for generated services', SERVICES_DIRECTORY)
    .option('--utils <directory>', 'output directory for generated utils', UTILS_DIRECTORY)
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

  generator.generateDaos(program.opts().dao, openapi);
  generator.generateDtos(program.opts().dto, openapi);
  generator.generateControllers(program.opts().controller, openapi);
  generator.generateServices(program.opts().services, openapi);
  generator.generateSecuritySchemes(program.opts().utils, openapi);

})();
