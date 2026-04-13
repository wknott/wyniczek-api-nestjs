import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PointCategory {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  order: number;

  @Field(() => String, { nullable: true })
  gameId?: string | null;

  @Field(() => String, { nullable: true })
  expansionId?: string | null;
}
