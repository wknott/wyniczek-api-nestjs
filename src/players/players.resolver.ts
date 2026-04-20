import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
  Int,
} from '@nestjs/graphql';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity';
import { PlayerRecord } from './entities/player-record.entity';
import { CreatePlayerInput } from './dto/create-player.input';

@Resolver(() => Player)
export class PlayersResolver {
  constructor(private readonly playersService: PlayersService) {}

  @Query(() => [Player], { name: 'players' })
  findAll() {
    return this.playersService.findAll();
  }

  @Query(() => Player, { name: 'player', nullable: true })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.playersService.findOne(id);
  }

  @Mutation(() => Player)
  createPlayer(
    @Args('createPlayerInput') createPlayerInput: CreatePlayerInput,
  ) {
    return this.playersService.create(createPlayerInput);
  }

  @Mutation(() => Player)
  removePlayer(@Args('id', { type: () => String }) id: string) {
    return this.playersService.remove(id);
  }

  @ResolveField(() => [PlayerRecord])
  records(@Parent() player: Player) {
    return this.playersService.findRecordsByPlayerId(player.id);
  }

  @ResolveField(() => Int)
  totalWins(@Parent() player: Player) {
    return this.playersService.findTotalWinsByPlayerId(player.id);
  }
}
