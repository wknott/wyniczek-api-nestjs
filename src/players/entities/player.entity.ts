import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Player {
    @Field(() => String)
    id: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    userId: string;
}
