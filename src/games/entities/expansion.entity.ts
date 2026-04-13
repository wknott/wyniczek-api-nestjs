import { ObjectType, Field } from '@nestjs/graphql';
import { PointCategory } from './point-category.entity';

@ObjectType()
export class Expansion {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  gameId: string;

  @Field(() => [PointCategory], { nullable: true })
  pointCategories?: PointCategory[];
}
