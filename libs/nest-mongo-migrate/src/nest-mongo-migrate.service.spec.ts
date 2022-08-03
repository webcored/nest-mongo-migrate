import { Test, TestingModule } from '@nestjs/testing';
import { NestMongoMigrateService } from './nest-mongo-migrate.service';

describe('NestMongoMigrateService', () => {
  let service: NestMongoMigrateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NestMongoMigrateService],
    }).compile();

    service = module.get<NestMongoMigrateService>(NestMongoMigrateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
