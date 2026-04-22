import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
  Int,
} from '@nestjs/graphql';
import { GamesService } from './games.service';
import { Game, PaginatedGames, GameSortBy } from './entities/game.entity';
import { Expansion } from './entities/expansion.entity';
import { GameRecord } from './entities/game-record.entity';
import { GamePlayerStats } from './entities/game-player-stats.entity';
import { Result } from '../results/entities/result.entity';
import { CreateGameInput } from './dto/create-game.input';
import { UpdatePointCategoryInput } from './dto/update-game-categories.input';
import { CreateExpansionInput } from './dto/create-expansion.input';
import { UpdateExpansionInput } from './dto/update-expansion.input';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Game)
export class GamesResolver {
  constructor(private readonly gamesService: GamesService) {}
  @Query(() => PaginatedGames, { name: 'games' })
  findAll(
    @CurrentUser() userId: string,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 10 })
    take: number,
    @Args('sortBy', {
      type: () => GameSortBy,
      nullable: true,
      defaultValue: GameSortBy.POPULARITY,
    })
    sortBy: GameSortBy,
    @Args('includeNotInCollection', {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    includeNotInCollection: boolean,
  ) {
    return this.gamesService.findAll(
      userId,
      skip,
      take,
      sortBy,
      includeNotInCollection,
    );
  }

  @Query(() => Game, { name: 'game', nullable: true })
  findOne(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() userId: string,
  ) {
    return this.gamesService.findOne(id, userId);
  }

  @Mutation(() => Game)
  createGame(
    @Args('createGameInput') createGameInput: CreateGameInput,
    @CurrentUser() userId: string,
  ) {
    return this.gamesService.create(createGameInput, userId);
  }

  @ResolveField(() => Int, { nullable: true })
  async avgPlayingTime2Players(
    @Parent() game: Game,
    @CurrentUser() userId: string,
  ): Promise<number | null> {
    return this.gamesService.getAvgPlayingTime2Players(game.id, userId);
  }

  @ResolveField(() => Result, { nullable: true })
  latestResult(@Parent() game: Game, @CurrentUser() userId: string) {
    return this.gamesService.findLatestResult(game.id, userId);
  }

  @ResolveField(() => Date, { nullable: true })
  async lastPlayedAt(@Parent() game: Game, @CurrentUser() userId: string) {
    const latestResult = await this.gamesService.findLatestResult(
      game.id,
      userId,
    );
    return latestResult?.createdAt ?? null;
  }

  @Mutation(() => Game)
  syncGameWithBgg(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() userId: string,
  ) {
    return this.gamesService.syncGameWithBgg(id, userId);
  }

  @Mutation(() => [Game])
  syncAllGamesWithBgg(@CurrentUser() userId: string) {
    return this.gamesService.syncAllGamesWithBgg(userId);
  }

  @Mutation(() => Game)
  updateGameManualUrl(
    @Args('id', { type: () => String }) id: string,
    @Args('url', { type: () => String, nullable: true }) url: string | null,
    @CurrentUser() userId: string,
  ) {
    return this.gamesService.updateGameManualUrl(id, url, userId);
  }

  @Mutation(() => Game)
  updateGameCollectionStatus(
    @Args('id', { type: () => String }) id: string,
    @Args('inCollection', { type: () => Boolean }) inCollection: boolean,
    @CurrentUser() userId: string,
  ) {
    return this.gamesService.updateCollectionStatus(id, inCollection, userId);
  }

  @Mutation(() => Game)
  updateGameCategories(
    @Args('id', { type: () => String }) id: string,
    @Args('categories', { type: () => [UpdatePointCategoryInput] })
    categories: UpdatePointCategoryInput[],
    @CurrentUser() userId: string,
  ) {
    return this.gamesService.updateGameCategories(id, categories, userId);
  }

  @ResolveField(() => [Expansion], { nullable: true })
  expansions(@Parent() game: Game, @CurrentUser() userId: string) {
    return this.gamesService.findExpansionsByGameId(game.id, userId);
  }

  @ResolveField(() => [GameRecord])
  records(@Parent() game: Game, @CurrentUser() userId: string) {
    return this.gamesService.findRecordsByGameId(game.id, userId);
  }

  @ResolveField(() => [GamePlayerStats])
  playerStats(@Parent() game: Game, @CurrentUser() userId: string) {
    return this.gamesService.findPlayerStatsByGameId(game.id, userId);
  }

  @Mutation(() => Expansion)
  createExpansion(
    @Args('createExpansionInput') createExpansionInput: CreateExpansionInput,
    @CurrentUser() userId: string,
  ) {
    return this.gamesService.createExpansion(createExpansionInput, userId);
  }

  @Mutation(() => Expansion)
  updateExpansion(
    @Args('updateExpansionInput') updateExpansionInput: UpdateExpansionInput,
    @CurrentUser() userId: string,
  ) {
    return this.gamesService.updateExpansion(updateExpansionInput, userId);
  }

  @Mutation(() => Expansion)
  deleteExpansion(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() userId: string,
  ) {
    return this.gamesService.deleteExpansion(id, userId);
  }
}
