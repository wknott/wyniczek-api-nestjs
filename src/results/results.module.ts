import { Module } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ResultsResolver, ScoreResolver, PointResolver } from './results.resolver';

@Module({
  providers: [ResultsService, ResultsResolver, ScoreResolver, PointResolver]
})
export class ResultsModule { }
