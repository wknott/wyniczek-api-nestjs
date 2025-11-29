import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ResultsService } from './results.service';
import { Result } from './entities/result.entity';
import { Game } from '../games/entities/game.entity';
import { Score } from './entities/score.entity';
import { Player } from '../players/entities/player.entity';
import { Point } from './entities/point.entity';
import { PointCategory } from '../games/entities/game.entity';


@Resolver(() => Result)
export class ResultsResolver {
    constructor(private readonly resultsService: ResultsService) { }

    @Query(() => [Result], { name: 'results' })
    findAll() {
        return this.resultsService.findAll();
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
