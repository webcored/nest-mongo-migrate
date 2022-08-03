import { NestMongoMigrateCommand } from './nest-mongo-migrate.command';
import { Module, DynamicModule, ModuleMetadata } from '@nestjs/common';
import { NestMongoMigrateService } from './nest-mongo-migrate.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Migration, MigrationSchema } from './nest-mongo-migrate.schema';

@Module({})
export class NestMongoMigrateModule {
  static register({
    providers = [],
    imports = [],
  }: ModuleMetadata): DynamicModule {
    // HACK: using migration class name as the provider token to fetch them dynamically using the moduleref
    const tokenizedProviders = providers.map((provider) => {
      const isProviderFunction = typeof provider === 'function';
      const providerName = (provider as any).name;
      const isProviderMigrationClass = providerName?.endsWith('Migration');

      // MODIFY MIGRATION CLASS provider alone with class name as token
      if (isProviderFunction && isProviderMigrationClass) {
        return {
          provide: providerName,
          useClass: provider,
        };
      }

      return provider;
    });

    return {
      module: NestMongoMigrateModule,
      providers: [
        NestMongoMigrateCommand,
        NestMongoMigrateService,
        ...tokenizedProviders,
      ],
      imports: [
        MongooseModule.forFeature([
          { name: Migration.name, schema: MigrationSchema },
        ]),
        ...imports,
      ],
    };
  }
}
