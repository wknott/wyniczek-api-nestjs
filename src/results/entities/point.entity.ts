import { ObjectType, Field, Int } from '@nestjs/graphql';
import { PointCategory } from '../../games/entities/game.entity';

@ObjectType()
export class Point {
    @Field(() => String)
    id: string;

    @Field(() => String)
    scoreId: string;

    @Field(() => String)
    pointCategoryId: string;

    @Field(() => Int, { nullable: true })
    value?: number | null;

    @Field(() => PointCategory)
    pointCategory?: PointCategory;
}
