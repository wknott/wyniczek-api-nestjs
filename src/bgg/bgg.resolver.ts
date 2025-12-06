
import { Resolver, Query, Args } from '@nestjs/graphql';
import { BggService } from './bgg.service';
import { BggGameDetails, BggGameSearchResult, BggGameStats } from './bgg.types';

@Resolver()
export class BggResolver {
    constructor(private readonly bggService: BggService) { }

    @Query(() => [BggGameSearchResult], { name: 'searchBggGames' })
    async searchGames(@Args('query') query: string) {
        return this.bggService.searchGames(query);
    }

    @Query(() => BggGameDetails, { name: 'getBggGameDetails' })
    async getGameDetails(@Args('bggId') bggId: string) {
        return this.bggService.getGameDetails(bggId);
    }

    @Query(() => BggGameStats, { name: 'getBggGameStats' })
    async getGameStats(@Args('bggId') bggId: string) {
        return this.bggService.getGameStats(bggId);
    }
}
