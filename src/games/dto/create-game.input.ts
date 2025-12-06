import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateGameInput {
    @Field(() => String)
    name: string;

    @Field(() => Int, { nullable: true })
    bggId?: number;

    @Field(() => String)
    userId: string;

    @Field(() => [String], { nullable: true })
    pointCategoryNames?: string[];
}
