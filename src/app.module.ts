import { NestMongoMigrateModule } from '@app/nest-mongo-migrate';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { UserMigration } from './migrations/1659507635591-user.migration';
import { UserEmailMigration } from './migrations/1659510881054-user-email.migration';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/test'),
    NestMongoMigrateModule.register({
      providers: [
        {
          provide: 'MONGO_MIGRATION_DIR',
          useValue: join(process.cwd(), './src/migrations'),
        },
        UserMigration,
        UserEmailMigration,
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
