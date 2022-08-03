import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { writeFileSync, existsSync, readdirSync } from 'fs';
import * as camelcase from 'lodash.camelcase';
import * as kebabcase from 'lodash.kebabcase';
import * as upperfirst from 'lodash.upperfirst';
import chalk from 'chalk';
import * as ora from 'ora';

import {
  MigrationAction,
  MigrationRunParamsWithTerminal,
  MigrationRunParams,
  MigrationSuccessCallback,
} from './nest-mongo-migrate.interface.dto';
import {
  Migration,
  MigrationDocument,
  MigrationModel,
} from './nest-mongo-migrate.schema';

@Injectable()
export class NestMongoMigrateService {
  constructor(
    private moduleRef: ModuleRef,
    @InjectModel(Migration.name)
    private readonly migrationModel: MigrationModel,
  ) {
    this.validateMigrationPath();
  }

  public exit() {
    process.exit(0);
  }

  // CREATE
  public get migrationFilePath() {
    try {
      return this.moduleRef.get('MONGO_MIGRATION_DIR');
    } catch (e) {
      return process.cwd();
    }
  }

  public validateMigrationPath() {
    if (!existsSync(this.migrationFilePath)) {
      console.error(
        chalk.red(
          `Migration directory "${this.migrationFilePath}" not exists.`,
        ),
      );
      this.exit();
    }
  }

  public async create(name: string) {
    const terminal = ora({
      text: `creating migration file for ${name}`,
    }).start();

    const fileName: string = kebabcase(name) + '.migration.ts';

    // check if file already exists
    const files = await this.getDirFiles();
    const exist = files.some((file) => {
      const [, ...actualFileName] = file.split('-');
      const migrationFileName = actualFileName.join('-');
      return migrationFileName === fileName;
    });

    if (exist) {
      terminal.fail(chalk.red(`Migration file for "${name}" already exists`));
      this.exit();
    }

    const migrationFileName = `${Date.now()}-${fileName}`;
    const filePath = `${this.migrationFilePath}/${migrationFileName}`;
    const template = this.getMigrationTemplate(this.getClassName(name));
    try {
      writeFileSync(filePath, template);
      terminal.succeed(
        chalk.green(
          `Migration file for "${name}" created: ${migrationFileName}`,
        ),
      );
    } catch (e) {
      terminal.fail(chalk.red(e.stack));
    } finally {
      this.exit();
    }
  }

  private getMigrationTemplate(name: string) {
    return `import { NestMongoMigration } from 'nest-mongo-migrate';

export class ${name} implements NestMongoMigration{
  // define your dependencies here
  constructor() {}

  // migration goes here
  up() {}

  // UNDO the changes
  down() {}
}`;
  }

  // RUN
  public async run({ action, name }: MigrationRunParams) {
    if (!name) {
      await this.runAll(action);
    } else {
      await this.runOne({ action, name });
    }
    this.exit();
  }

  private async runOne({ name, action }: MigrationRunParams) {
    const migrationName = camelcase(name);
    const terminal = ora({
      text: `running migration "${migrationName} [${action}]"`,
      stream: process.stdout,
    }).start();

    // verify DB status
    const { exist, migrationDocument } = await this.verifyStatus({
      name: migrationName,
      action,
      terminal,
    });
    if (exist) {
      return true; // stop exec;
    }

    // get instance
    const { instance, className, error } = this.getInstance(migrationName);

    if (!instance) {
      this.failureCallback({ name: migrationName, action, terminal });
      console.error(
        chalk.red(`${className} not found on the migration module`),
      );
      console.error(chalk.red(error.stack));
      return true; // stop exec
    }

    // clearing and creating new instance, if any msg's printed in the service it persists the old msg
    const newTerminal = terminal.clear();

    try {
      await instance[action]();
      await this.successCallback({
        name: migrationName,
        action,
        migrationDocument,
        terminal: newTerminal,
      });
    } catch (e) {
      this.failureCallback({
        name: migrationName,
        action,
        terminal: newTerminal,
      });
      console.log(e.stack);
    }
  }

  private async runAll(action: MigrationAction) {
    const files = await this.getDirFiles();
    const migrationFiles = files
      .filter((fileName) => fileName.includes('migration'))
      .map((fileName) => {
        const [migrationFileName] = fileName.split('.');
        const [, ...migrationName] = migrationFileName.split('-');
        return migrationName.join('-');
      });

    for (const name of migrationFiles) {
      await this.runOne({ name, action });
    }
  }

  // helper methods
  private getClassName(name: string): string {
    return upperfirst(`${camelcase(name)}Migration`);
  }

  private async getDirFiles() {
    return readdirSync(this.migrationFilePath);
  }

  private async verifyStatus({
    name,
    action,
    terminal,
  }: MigrationRunParamsWithTerminal): Promise<{
    exist: boolean;
    migrationDocument: MigrationDocument | null;
  }> {
    let exist = false;
    const migrationDocument = await this.migrationModel.findOne({ name });

    if (migrationDocument) {
      exist = Boolean(migrationDocument.status === action);
      if (exist) {
        terminal.warn(
          chalk.yellowBright(
            `cannot proceed migration "${name}" is already in "${action}" state`,
          ),
        );
      }
    }

    return { exist, migrationDocument };
  }

  private getInstance(name: string): {
    instance: any;
    className: string;
    error?: any;
  } {
    const className = this.getClassName(name);
    try {
      return { instance: this.moduleRef.get(className), className };
    } catch (e) {
      return { instance: undefined, className, error: e };
    }
  }

  private async updateStatus({
    name,
    action,
    migrationDocument,
  }: Omit<MigrationSuccessCallback, 'terminal'>) {
    const document =
      migrationDocument ||
      new this.migrationModel({
        name: name,
      });
    document.status = action;
    await document.save();
  }

  private async successCallback({
    name,
    action,
    migrationDocument,
    terminal,
  }: MigrationSuccessCallback) {
    await this.updateStatus({ name, action, migrationDocument });
    const migrationDisplayName = `${name} [${action}]`;
    terminal.succeed(`"${migrationDisplayName}" migration done`);
  }

  private failureCallback({
    name,
    action,
    terminal,
  }: MigrationRunParamsWithTerminal) {
    const migrationDisplayName = `${name} [${action}]`;
    terminal.fail(chalk.red(`"${migrationDisplayName}" migration failed`));
  }
}
