import { NestMongoMigration } from '@app/nest-mongo-migrate';

export class UserMigration implements NestMongoMigration {
  // migration goes here
  async up() {
    console.log('up');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // UNDO the changes
  async down() {
    console.log('down');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
