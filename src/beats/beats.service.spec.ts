import { Test, TestingModule } from '@nestjs/testing';
import { BeatsService } from './beats.service';

describe('BeatsService', () => {
  let service: BeatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeatsService],
    }).compile();

    service = module.get<BeatsService>(BeatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
