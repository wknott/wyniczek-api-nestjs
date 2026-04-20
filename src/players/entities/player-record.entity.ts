import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Game } from '../../games/entities/game.entity';
import { Expansion } from '../../games/entities/expansion.entity';

@ObjectType()
export class PlayerRecord {
  @Field(() => Game)
  game: Game;

  @Field(() => [Expansion])
  expansions: Expansion[];

  @Field(() => Int)
  totalPoints: number;

  @Field(() => String)
  resultId: string;

  @Field(() => Date)
  createdAt: Date;
}
