import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePlayerInput {
    @Field(() => String)
    name: string;

    @Field(() => String)
    userId: string;
}
