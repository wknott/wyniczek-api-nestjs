import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity';
import { CreatePlayerInput } from './dto/create-player.input';

@Resolver(() => Player)
export class PlayersResolver {
    constructor(private readonly playersService: PlayersService) { }

    @Query(() => [Player], { name: 'players' })
    findAll() {
        return this.playersService.findAll();
    }

    @Query(() => Player, { name: 'player', nullable: true })
    findOne(@Args('id', { type: () => String }) id: string) {
        return this.playersService.findOne(id);
    }

    @Mutation(() => Player)
    createPlayer(@Args('createPlayerInput') createPlayerInput: CreatePlayerInput) {
        return this.playersService.create(createPlayerInput);
    }

    @Mutation(() => Player)
    removePlayer(@Args('id', { type: () => String }) id: string) {
        return this.playersService.remove(id);
    }
}
