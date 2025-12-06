import { Resolver, Query, Args, Mutation, ResolveField, Parent, Int } from '@nestjs/graphql';
import { ResultsService } from './results.service';
import { Result, PaginatedResults } from './entities/result.entity';
import { Game } from '../games/entities/game.entity';
import { Score } from './entities/score.entity';
import { Player } from '../players/entities/player.entity';
import { Point } from './entities/point.entity';
import { PointCategory } from '../games/entities/game.entity';
import { CreateResultInput } from './dto/create-result.input';
import { UpdateResultInput } from './dto/update-result.input';

@Resolver(() => Result)
export class ResultsResolver {
    constructor(private readonly resultsService: ResultsService) { }

    @Mutation(() => Result)
    createResult(@Args('createResultInput') createResultInput: CreateResultInput) {
        return this.resultsService.create(createResultInput);
    }

    @Mutation(() => Result)
    updateResult(@Args('updateResultInput') updateResultInput: UpdateResultInput) {
        return this.resultsService.update(updateResultInput.id, updateResultInput);
    }

    @Mutation(() => Result)
    removeResult(@Args('id', { type: () => String }) id: string) {
        return this.resultsService.remove(id);
    }

    @Query(() => PaginatedResults, { name: 'results' })
    findAll(
        @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }) skip: number,
        @Args('take', { type: () => Int, nullable: true, defaultValue: 10 }) take: number,
    ) {
        return this.resultsService.findAll(skip, take);
    }

    @Query(() => Result, { name: 'result', nullable: true })
    findOne(@Args('id', { type: () => String }) id: string) {
        return this.resultsService.findOne(id);
    }

    @Query(() => Result, { name: 'latestResultByGameName', nullable: true })
    findLatestByGameName(@Args('gameName', { type: () => String }) gameName: string) {
        return this.resultsService.findLatestByGameName(gameName);
    }

    @ResolveField(() => Game)
    game(@Parent() result: Result) {
        return this.resultsService.findGame(result.gameId);
    }

    @ResolveField(() => [Score])
    scores(@Parent() result: Result) {
        return this.resultsService.findScores(result.id);
    }
}

@Resolver(() => Score)
export class ScoreResolver {
    constructor(private readonly resultsService: ResultsService) { }

    @ResolveField(() => Player)
    player(@Parent() score: Score) {
        return this.resultsService.findPlayer(score.playerId);
    }

    @ResolveField(() => [Point])
    points(@Parent() score: Score) {
        return this.resultsService.findPoints(score.id);
    }
}

@Resolver(() => Point)
export class PointResolver {
    constructor(private readonly resultsService: ResultsService) { }

    @ResolveField(() => PointCategory)
    pointCategory(@Parent() point: Point) {
        return this.resultsService.findPointCategory(point.pointCategoryId);
    }
}
