import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Player } from '../../players/entities/player.entity';

@ObjectType()
export class GamePlayerStats {
  @Field(() => Player)
  player: Player;

  @Field(() => Int)
  wins: number;

  @Field(() => Int)
  totalGames: number;
}
