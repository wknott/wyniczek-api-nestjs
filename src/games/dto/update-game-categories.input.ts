import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdatePointCategoryInput {
    @Field(() => String, { nullable: true })
    id?: string;

    @Field(() => String)
    name: string;
}
