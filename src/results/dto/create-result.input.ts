import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreatePointInput {
    @Field()
    pointCategoryId: string;

    @Field(() => Int, { nullable: true })
    value?: number;
}

@InputType()
export class CreateScoreInput {
    @Field()
    playerId: string;

    @Field(() => [CreatePointInput], { nullable: 'itemsAndList' })
    points?: CreatePointInput[];
}

@InputType()
export class CreateResultInput {
    @Field()
    gameId: string;

    @Field()
    userId: string;

    @Field(() => Int, { nullable: true })
    playingTime?: number;

    @Field(() => [CreateScoreInput])
    scores: CreateScoreInput[];
}
