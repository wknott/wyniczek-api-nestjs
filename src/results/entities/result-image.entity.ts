import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ResultImage {
  @Field(() => String)
  id: string;

  @Field(() => String)
  resultId: string;

  @Field(() => String)
  url: string;

  @Field(() => String)
  key: string;

  @Field(() => Int)
  order: number;
}
