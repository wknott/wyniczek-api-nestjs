import {
  ObjectType,
  Field,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { Expansion } from './expansion.entity';
import { PointCategory } from './point-category.entity';

export { PointCategory } from './point-category.entity';

export enum GameSortBy {
  POPULARITY = 'POPULARITY',
  LAST_PLAYED = 'LAST_PLAYED',
  ALPHABETICAL = 'ALPHABETICAL',
  AVG_PLAYING_TIME_2P = 'AVG_PLAYING_TIME_2P',
}

registerEnumType(GameSortBy, {
  name: 'GameSortBy',
});

@ObjectType()
export class Game {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  minPlayers: number;

  @Field(() => Int)
  maxPlayers: number;

  @Field(() => Boolean)
  inCollection: boolean;

  @Field(() => Int, { nullable: true })
  bggId?: number | null;

  @Field(() => Int, { nullable: true })
  bggRank?: number | null;

  @Field(() => Float, { nullable: true })
  bggWeight?: number | null;

  @Field(() => String, { nullable: true })
  imgUrl?: string | null;

  @Field(() => String, { nullable: true })
  thumbnailUrl?: string | null;

  @Field(() => String)
  userId: string;

  @Field(() => [PointCategory], { nullable: true })
  pointCategories?: PointCategory[];

  @Field(() => [Expansion], { nullable: true })
  expansions?: Expansion[];

  @Field(() => Date, { nullable: true })
  lastPlayedAt?: Date | null;

  @Field(() => Int, { nullable: true })
  avgPlayingTime2Players?: number | null;
}

@ObjectType()
export class PaginatedGames {
  @Field(() => [Game])
  items: Game[];

  @Field(() => Int)
  total: number;
}
