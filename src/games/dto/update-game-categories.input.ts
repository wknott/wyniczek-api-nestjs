import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdatePointCategoryInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  order: number;
}
