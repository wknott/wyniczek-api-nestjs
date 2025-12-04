import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';

export enum GameSortBy {
    POPULARITY = 'POPULARITY',
    LAST_PLAYED = 'LAST_PLAYED',
    ALPHABETICAL = 'ALPHABETICAL',
}

registerEnumType(GameSortBy, {
    name: 'GameSortBy',
});

@ObjectType()
export class PointCategory {
    @Field(() => String)
    id: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    gameId: string;
}

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

    @Field(() => Int, { nullable: true })
    bggId?: number | null;

    @Field(() => String, { nullable: true })
    imgUrl?: string | null;

    @Field(() => String, { nullable: true })
    thumbnailUrl?: string | null;

    @Field(() => String)
    userId: string;

    @Field(() => [PointCategory], { nullable: true })
    pointCategories?: PointCategory[];

    @Field(() => Date, { nullable: true })
    lastPlayedAt?: Date | null;
}

@ObjectType()
export class PaginatedGames {
    @Field(() => [Game])
    items: Game[];

    @Field(() => Int)
    total: number;
}
