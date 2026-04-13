import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateExpansionInput {
  @Field()
  gameId: string;

  @Field()
  name: string;

  @Field(() => [String], { nullable: true })
  pointCategoryNames?: string[];
}
