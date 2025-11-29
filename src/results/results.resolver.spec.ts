import { Test, TestingModule } from '@nestjs/testing';
import { ResultsResolver } from './results.resolver';

describe('ResultsResolver', () => {
  let resolver: ResultsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResultsResolver],
    }).compile();

    resolver = module.get<ResultsResolver>(ResultsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
