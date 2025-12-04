import { Resolver, Query, Args, Mutation, ResolveField, Parent, Int } from '@nestjs/graphql';
import { GamesService } from './games.service';
import { Game, PaginatedGames, GameSortBy } from './entities/game.entity';
import { Result } from '../results/entities/result.entity';
import { CreateGameInput } from './dto/create-game.input';

@Resolver(() => Game)
export class GamesResolver {
    constructor(private readonly gamesService: GamesService) { }

    @Query(() => PaginatedGames, { name: 'games' })
    findAll(
        @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }) skip: number,
        @Args('take', { type: () => Int, nullable: true, defaultValue: 10 }) take: number,
        @Args('sortBy', { type: () => GameSortBy, nullable: true, defaultValue: GameSortBy.POPULARITY }) sortBy: GameSortBy,
    ) {
        return this.gamesService.findAll(skip, take, sortBy);
    }

    @Query(() => Game, { name: 'game', nullable: true })
    findOne(@Args('id', { type: () => String }) id: string) {
        return this.gamesService.findOne(id);
    }

    @Mutation(() => Game)
    createGame(@Args('createGameInput') createGameInput: CreateGameInput) {
        return this.gamesService.create(createGameInput);
    }

    @ResolveField(() => Result, { nullable: true })
    latestResult(@Parent() game: Game) {
        return this.gamesService.findLatestResult(game.id);
    }

    @ResolveField(() => Date, { nullable: true })
    async lastPlayedAt(@Parent() game: Game) {
        const latestResult = await this.gamesService.findLatestResult(game.id);
        return latestResult?.createdAt ?? null;
    }
}
