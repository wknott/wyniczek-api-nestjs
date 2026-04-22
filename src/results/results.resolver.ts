import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
  Int,
} from '@nestjs/graphql';
import { ResultsService } from './results.service';
import { Result, PaginatedResults } from './entities/result.entity';
import { Game } from '../games/entities/game.entity';
import { Score } from './entities/score.entity';
import { Player } from '../players/entities/player.entity';
import { Point } from './entities/point.entity';
import { PointCategory } from '../games/entities/point-category.entity';
import { Expansion } from '../games/entities/expansion.entity';
import { ResultImage } from './entities/result-image.entity';
import { CreateResultInput } from './dto/create-result.input';
import { UpdateResultInput } from './dto/update-result.input';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Result)
export class ResultsResolver {
  constructor(private readonly resultsService: ResultsService) {}

  @Mutation(() => Result)
  createResult(
    @Args('createResultInput') createResultInput: CreateResultInput,
    @CurrentUser() userId: string,
  ) {
    return this.resultsService.create(createResultInput, userId);
  }

  @Mutation(() => Result)
  updateResult(
    @Args('updateResultInput') updateResultInput: UpdateResultInput,
    @CurrentUser() userId: string,
  ) {
    return this.resultsService.update(
      updateResultInput.id,
      updateResultInput,
      userId,
    );
  }

  @Mutation(() => Result)
  removeResult(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() userId: string,
  ) {
    return this.resultsService.remove(id, userId);
  }

  @Query(() => PaginatedResults, { name: 'results' })
  findAll(
    @CurrentUser() userId: string,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 10 })
    take: number,
    @Args('gameId', { type: () => String, nullable: true }) gameId?: string,
  ) {
    return this.resultsService.findAll(userId, skip, take, gameId);
  }

  @Query(() => Result, { name: 'result', nullable: true })
  findOne(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() userId: string,
  ) {
    return this.resultsService.findOne(id, userId);
  }

  @Query(() => Result, { name: 'latestResultByGameName', nullable: true })
  findLatestByGameName(
    @Args('gameName', { type: () => String }) gameName: string,
    @CurrentUser() userId: string,
  ) {
    return this.resultsService.findLatestByGameName(gameName, userId);
  }

  @ResolveField(() => Game)
  game(@Parent() result: Result, @CurrentUser() userId: string) {
    return this.resultsService.findGame(result.gameId, userId);
  }

  @ResolveField(() => [Score])
  scores(@Parent() result: Result) {
    return this.resultsService.findScores(result.id);
  }

  @ResolveField(() => [Expansion])
  expansions(@Parent() result: Result) {
    return this.resultsService.findExpansions(result.id);
  }

  @ResolveField(() => [ResultImage])
  images(@Parent() result: Result) {
    return this.resultsService.findImages(result.id);
  }
}

@Resolver(() => Score)
export class ScoreResolver {
  constructor(private readonly resultsService: ResultsService) {}

  @ResolveField(() => Player)
  player(@Parent() score: Score, @CurrentUser() userId: string) {
    return this.resultsService.findPlayer(score.playerId, userId);
  }

  @ResolveField(() => [Point])
  points(@Parent() score: Score) {
    return this.resultsService.findPoints(score.id);
  }
}

@Resolver(() => Point)
export class PointResolver {
  constructor(private readonly resultsService: ResultsService) {}

  @ResolveField(() => PointCategory)
  pointCategory(@Parent() point: Point) {
    return this.resultsService.findPointCategory(point.pointCategoryId);
  }
}
