import { InputType, Field } from '@nestjs/graphql';
import { UpdatePointCategoryInput } from './update-game-categories.input';

@InputType()
export class UpdateExpansionInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => [UpdatePointCategoryInput], { nullable: true })
  categories?: UpdatePointCategoryInput[];
}
