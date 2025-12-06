
import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';

@ObjectType()
export class BggGameSearchResult {
    @Field(() => ID)
    bggId: string;

    @Field()
    name: string;

    @Field(() => Int, { nullable: true })
    yearPublished?: number;
}

@ObjectType()
export class BggGameDetails {
    @Field(() => ID)
    bggId: string;

    @Field(() => [String])
    names: string[];

    @Field({ nullable: true })
    img?: string;

    @Field({ nullable: true })
    thumbnail?: string;

    @Field(() => Int)
    minPlayers: number;

    @Field(() => Int)
    maxPlayers: number;
}

@ObjectType()
export class BggGameStats {
    @Field(() => Int)
    bggRank: number;

    @Field(() => Float)
    weight: number;
}
