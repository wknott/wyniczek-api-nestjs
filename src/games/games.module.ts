import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesResolver } from './games.resolver';
import { BggModule } from '../bgg/bgg.module';

@Module({
  imports: [BggModule],
  providers: [GamesService, GamesResolver]
})
export class GamesModule { }
