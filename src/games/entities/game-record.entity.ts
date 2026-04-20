import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Expansion } from './expansion.entity';
import { Player } from '../../players/entities/player.entity';

@ObjectType()
export class GameRecord {
  @Field(() => [Expansion])
  expansions: Expansion[];

  @Field(() => Int)
  totalPoints: number;

  @Field(() => String)
  resultId: string;

  @Field(() => Player)
  player: Player;

  @Field(() => Date)
  createdAt: Date;
}
