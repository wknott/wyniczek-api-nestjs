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
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Player)
export class PlayersResolver {
  constructor(private readonly playersService: PlayersService) {}

  @Query(() => [Player], { name: 'players' })
  findAll(@CurrentUser() userId: string) {
    return this.playersService.findAll(userId);
  }

  @Query(() => Player, { name: 'player', nullable: true })
  findOne(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() userId: string,
  ) {
    return this.playersService.findOne(id, userId);
  }

  @Mutation(() => Player)
  createPlayer(
    @Args('createPlayerInput') createPlayerInput: CreatePlayerInput,
    @CurrentUser() userId: string,
  ) {
    return this.playersService.create(createPlayerInput, userId);
  }

  @Mutation(() => Player)
  removePlayer(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() userId: string,
  ) {
    return this.playersService.remove(id, userId);
  }

  @ResolveField(() => [PlayerRecord])
  records(@Parent() player: Player, @CurrentUser() userId: string) {
    return this.playersService.findRecordsByPlayerId(player.id, userId);
  }

  @ResolveField(() => Int)
  totalWins(@Parent() player: Player, @CurrentUser() userId: string) {
    return this.playersService.findTotalWinsByPlayerId(player.id, userId);
  }
}
