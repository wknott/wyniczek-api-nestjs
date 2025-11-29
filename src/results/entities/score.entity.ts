import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Player } from '../../players/entities/player.entity';
import { Point } from './point.entity';

@ObjectType()
export class Score {
    @Field(() => String)
    id: string;

    @Field(() => String)
    resultId: string;

    @Field(() => String)
    playerId: string;

    @Field(() => Player, { nullable: true })
    player?: Player;

    @Field(() => [Point], { nullable: true })
    points?: Point[];
}
