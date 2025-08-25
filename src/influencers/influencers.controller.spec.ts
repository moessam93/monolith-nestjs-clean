import { Test, TestingModule } from '@nestjs/testing';
import { InfluencersController } from './influencers.controller';
import { InfluencersService } from './influencers.service';

describe('InfluencersController', () => {
  let controller: InfluencersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfluencersController],
      providers: [InfluencersService],
    }).compile();

    controller = module.get<InfluencersController>(InfluencersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
