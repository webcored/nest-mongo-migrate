import { MigrationDocument } from './nest-mongo-migrate.schema';
import { Ora } from 'ora';

enum MigrationAction {
  UP = 'up',
  DOWN = 'down',
}

interface MigrationOptions {
  generate: string;
  name: string;
  up: boolean;
  down: boolean;
}

interface MigrationRunParams {
  name: string;
  action: MigrationAction;
}

interface MigrationSuccessCallback extends MigrationRunParams {
  migrationDocument: MigrationDocument;
  terminal: Ora;
}

interface MigrationRunParamsWithTerminal extends MigrationRunParams {
  terminal: Ora;
}

interface NestMongoMigration {
  up: () => any;
  down: () => any;
}

export {
  MigrationAction,
  MigrationOptions,
  MigrationRunParams,
  MigrationRunParamsWithTerminal,
  MigrationSuccessCallback,
  NestMongoMigration,
};
