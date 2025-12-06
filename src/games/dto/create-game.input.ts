import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateGameInput {
    @Field(() => String)
    name: string;

    @Field(() => Int)
    minPlayers: number;

    @Field(() => Int)
    maxPlayers: number;

    @Field(() => Int, { nullable: true })
    bggId?: number;

    @Field(() => Int, { nullable: true })
    bggRank?: number;

    @Field(() => Float, { nullable: true })
    bggWeight?: number;

    @Field(() => String, { nullable: true })
    imgUrl?: string;

    @Field(() => String, { nullable: true })
    thumbnailUrl?: string;

    @Field(() => String)
    userId: string;

    @Field(() => [String], { nullable: true })
    pointCategoryNames?: string[];
}
