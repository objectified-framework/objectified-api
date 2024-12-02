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

import * as fs from 'fs';
import * as yaml from 'yaml';

(async () => {
  const version = yaml.parse(fs.readFileSync('gen.yaml', 'utf8'))['version'];
  const { Command, Option } = require('commander');
  const program = new Command();

  program
    .argument('<filename>', 'OpenAPI Input Specification')
    .addOption(new Option('-g <generator>', 'output generator to use').choices(GENERATORS))
    .option('--dto <directory>', 'output directory for generated DTOs', DTO_DIRECTORY)
    .option('--dao <directory>', 'output directory for generated DAOs', DAO_DIRECTORY)
    .parse();

  if (!fs.existsSync(program.args[0])) {
    console.error(`File ${program.args[0]} not found.`);
    console.log(program.help());
    return;
  }

  const fileData = fs.readFileSync(program.args[0], 'utf8');
  const openapi = yaml.parse(fileData);

  console.log(`Code Auto-Generator: ${version}`);

  fs.rmSync(DTO_DIRECTORY, { recursive: true, force: true });

  const generator = require(`./${program.opts().g}`);

  generator.generateDaos(program.opts().dao, openapi);
  generator.generateDtos(program.opts().dto, openapi);
  // generator.generateControllers(program.opts().out, openapi);
  // generator.generateServices(program.opts().out, openapi);
  // generator.generateTests(program.opts().out, openapi);
  // generator.generateSecuritySchemes(program.opts().out, openapi);

})();
