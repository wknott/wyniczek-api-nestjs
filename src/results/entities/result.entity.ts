import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Game } from '../../games/entities/game.entity';
import { Score } from './score.entity';


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
}

@ObjectType()
export class PaginatedResults {
    @Field(() => [Result])
    items: Result[];

    @Field(() => Int)
    total: number;
}
