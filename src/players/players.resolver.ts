import { Resolver, Query, Args } from '@nestjs/graphql';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity';

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
}
