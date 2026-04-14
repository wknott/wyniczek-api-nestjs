import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Game } from '../../games/entities/game.entity';
import { Expansion } from '../../games/entities/expansion.entity';
import { Score } from './score.entity';
import { ResultImage } from './result-image.entity';

@ObjectType()
export class Result {
  @Field(() => String)
  id: string;

  @Field(() => String)
  gameId: string;

  @Field(() => Game)
  game?: Game;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Int, { nullable: true })
  playingTime?: number | null;

  @Field(() => String)
  userId: string;

  @Field(() => [Score], { nullable: true })
  scores?: Score[];

  @Field(() => [Expansion], { nullable: true })
  expansions?: Expansion[];

  @Field(() => [ResultImage], { nullable: true })
  images?: ResultImage[];
}

@ObjectType()
export class PaginatedResults {
  @Field(() => [Result])
  items: Result[];

  @Field(() => Int)
  total: number;
}
