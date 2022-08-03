import { NestMongoMigrateService } from './nest-mongo-migrate.service';
import { Command, Option, CommandRunner } from 'nest-commander';
import {
  MigrationAction,
  MigrationOptions,
} from './nest-mongo-migrate.interface.dto';

@Command({ name: 'mongo:migrate', description: 'Mongodb migration' })
export class NestMongoMigrateCommand extends CommandRunner {
  constructor(private readonly migrationService: NestMongoMigrateService) {
    super();
  }

  async run(inputs: string[], options?: MigrationOptions): Promise<void> {
    if (options.generate) {
      await this.migrationService.create(options.generate);
    }

    // action?
    let action = MigrationAction.UP;
    if (options.down) {
      action = MigrationAction.DOWN;
    }

    await this.migrationService.run({
      action,
      name: options.name,
    });

    this.migrationService.exit();
  }

  @Option({
    flags: '-g, --generate [migration filename]',
    description: 'create the migration file',
  })
  getFileName(val: string) {
    return val;
  }

  @Option({
    flags: '-n, --name [migration name]',
    description: 'name of the migration, defaults to all',
  })
  getMigrationName(val: string) {
    return val;
  }

  @Option({
    flags: '-u, --up [up action]',
    description: 'up action to perform migration, defaults to true',
  })
  isUp(action: boolean): boolean {
    return Boolean(action);
  }

  @Option({
    flags: '-d, --down [down action]',
    description: 'down action to rollback',
  })
  isDown(action: boolean): boolean {
    return Boolean(action);
  }
}
