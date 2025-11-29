import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { GamesService } from './games.service';
import { Game } from './entities/game.entity';
import { CreateGameInput } from './dto/create-game.input';

@Resolver(() => Game)
export class GamesResolver {
    constructor(private readonly gamesService: GamesService) { }

    @Query(() => [Game], { name: 'games' })
    findAll() {
        return this.gamesService.findAll();
    }

    @Query(() => Game, { name: 'game', nullable: true })
    findOne(@Args('id', { type: () => String }) id: string) {
        return this.gamesService.findOne(id);
    }

    @Mutation(() => Game)
    createGame(@Args('createGameInput') createGameInput: CreateGameInput) {
        return this.gamesService.create(createGameInput);
    }
}
