import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { XMLParser } from 'fast-xml-parser';
import { lastValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { BggGameDetails, BggGameSearchResult, BggGameStats } from './bgg.types';

@Injectable()
export class BggService {
    private readonly logger = new Logger(BggService.name);
    private readonly baseUrl = 'https://boardgamegeek.com/xmlapi2/';
    private readonly parser: XMLParser;

    constructor(
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            isArray: (name) => {
                return ['item', 'name', 'link', 'poll', 'result'].includes(name);
            }
        });
    }

    private get headers() {
        const token = process.env.BGG_AUTH_TOKEN;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async searchGames(query: string): Promise<BggGameSearchResult[]> {
        try {
            const url = `${this.baseUrl}/search`;
            const params = { query, type: 'boardgame' };

            const { data } = await lastValueFrom(
                this.httpService.get(url, { params, headers: this.headers })
            );

            const parsed = this.parser.parse(data);

            if (!parsed.items || !parsed.items.item) {
                return [];
            }

            const items = parsed.items.item;

            return items.map((item: any) => ({
                bggId: item.id,
                name: Array.isArray(item.name) ? item.name[0].value : item.name.value,
                yearPublished: item.yearpublished ? parseInt(item.yearpublished.value, 10) : 0,
            }));
        } catch (error) {
            this.logger.error(`Error searching BGG games: ${error.message}`, error.stack);
            return [];
        }
    }

    async getGameDetails(bggId: string): Promise<BggGameDetails> {
        const cacheKey = `game_details_${bggId}`;
        const cached = await this.cacheManager.get<BggGameDetails>(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const url = `${this.baseUrl}/thing`;
            const params = { id: bggId };

            const { data } = await lastValueFrom(
                this.httpService.get(url, { params, headers: this.headers })
            );

            const parsed = this.parser.parse(data);
            const item = parsed.items?.item?.[0];

            if (!item) {
                throw new Error('Game not found');
            }

            const names = item.name.map((n: any) => n.value);

            const details = {
                bggId: item.id,
                names: names,
                img: item.image,
                thumbnail: item.thumbnail,
                minPlayers: parseInt(item.minplayers.value, 10),
                maxPlayers: parseInt(item.maxplayers.value, 10),
            };

            await this.cacheManager.set(cacheKey, details);
            return details;
        } catch (error) {
            this.logger.error(`Error fetching BGG game details for ID ${bggId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getGameStats(bggId: string): Promise<BggGameStats> {
        try {
            const url = `${this.baseUrl}/thing`;
            const params = { id: bggId, stats: 1 };

            const { data } = await lastValueFrom(
                this.httpService.get(url, { params, headers: this.headers })
            );

            const parsed = this.parser.parse(data);
            const item = parsed.items?.item?.[0];
            const stats = item?.statistics?.ratings;

            if (!stats) {
                return { bggRank: 99999, weight: 0 };
            }

            const ranks = stats.ranks?.rank;
            let bggRank = 99999;

            if (Array.isArray(ranks)) {
                const bgRankObj = ranks.find((r: any) => r.name === 'boardgame');
                if (bgRankObj && bgRankObj.value !== 'Not Ranked') {
                    bggRank = parseInt(bgRankObj.value, 10);
                } else if (ranks[0] && ranks[0].value !== 'Not Ranked') {
                    bggRank = parseInt(ranks[0].value, 10);
                }
            } else if (ranks && ranks.value !== 'Not Ranked') {
                bggRank = parseInt(ranks.value, 10);
            }

            const weight = stats.averageweight ? parseFloat(stats.averageweight.value) : 0;

            return {
                bggRank,
                weight,
            };
        } catch (error) {
            this.logger.error(`Error fetching BGG game stats for ID ${bggId}: ${error.message}`, error.stack);
            return { bggRank: 99999, weight: 0 };
        }
    }
}
