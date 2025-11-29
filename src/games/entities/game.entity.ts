import { ObjectType, Field, Int } from '@nestjs/graphql';

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
}
