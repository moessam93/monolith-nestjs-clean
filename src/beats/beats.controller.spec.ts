import { Test, TestingModule } from '@nestjs/testing';
import { BeatsController } from './beats.controller';
import { BeatsService } from './beats.service';

describe('BeatsController', () => {
  let controller: BeatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeatsController],
      providers: [BeatsService],
    }).compile();

    controller = module.get<BeatsController>(BeatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
