import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BggService } from '../bgg/bgg.service';

import { Game, GameSortBy } from './entities/game.entity';
import { CreateGameInput } from './dto/create-game.input';

@Injectable()
export class GamesService {
    constructor(
        private prisma: PrismaService,
        private bggService: BggService,
    ) { }

    async findAll(skip: number = 0, take: number = 10, sortBy: GameSortBy = GameSortBy.POPULARITY, includeNotInCollection: boolean = false): Promise<{ items: Game[]; total: number }> {
        const whereClause = includeNotInCollection ? {} : { inCollection: true };
        const total = await this.prisma.game.count({ where: whereClause });

        let items: Game[];

        switch (sortBy) {
            case GameSortBy.POPULARITY:
                items = await this.prisma.game.findMany({
                    where: whereClause,
                    skip,
                    take,
                    include: {
                        pointCategories: true,
                    },
                    orderBy: {
                        results: { _count: 'desc' }
                    },
                });
                break;

            case GameSortBy.LAST_PLAYED:
                const gamesWithLatestResult = await this.prisma.game.findMany({
                    where: whereClause,
                    include: {
                        pointCategories: true,
                        results: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                });

                const sorted = gamesWithLatestResult.sort((a, b) => {
                    const aDate = a.results[0]?.createdAt?.getTime() ?? 0;
                    const bDate = b.results[0]?.createdAt?.getTime() ?? 0;
                    return bDate - aDate;
                });

                items = sorted.slice(skip, skip + take).map(game => {
                    const { results, ...gameWithoutResults } = game;
                    return gameWithoutResults as Game;
                });
                break;

            case GameSortBy.ALPHABETICAL:
            default:
                items = await this.prisma.game.findMany({
                    where: whereClause,
                    skip,
                    take,
                    include: {
                        pointCategories: true,
                    },
                    orderBy: { name: 'asc' },
                });
                break;
        }

        return { items, total };
    }

    async findLatestResult(gameId: string) {
        return this.prisma.result.findFirst({
            where: { gameId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string): Promise<Game | null> {
        return this.prisma.game.findUnique({
            where: { id },
            include: {
                pointCategories: true,
            },
        });
    }

    async create(createGameInput: CreateGameInput): Promise<Game> {
        const { pointCategoryNames, ...gameData } = createGameInput;
        let additionalData: {
            bggRank?: number;
            bggWeight?: number;
            imgUrl?: string;
            thumbnailUrl?: string;
            minPlayers: number;
            maxPlayers: number;
        } = {
            minPlayers: 1,
            maxPlayers: 4
        };

        if (gameData.bggId) {
            try {
                const [details, stats] = await Promise.all([
                    this.bggService.getGameDetails(gameData.bggId.toString()),
                    this.bggService.getGameStats(gameData.bggId.toString())
                ]);

                additionalData = {
                    ...additionalData,
                    bggRank: stats.bggRank,
                    bggWeight: stats.weight,
                    imgUrl: details.img,
                    thumbnailUrl: details.thumbnail,
                    minPlayers: details.minPlayers ?? additionalData.minPlayers,
                    maxPlayers: details.maxPlayers ?? additionalData.maxPlayers,
                };
            } catch (error) {
                console.error(`Failed to fetch BGG data for ${gameData.name}:`, error);
            }
        }

        return this.prisma.game.create({
            data: {
                ...gameData,
                ...additionalData,
                pointCategories: {
                    create: pointCategoryNames && pointCategoryNames.length > 0
                        ? pointCategoryNames.map(name => ({ name }))
                        : [{ name: 'Punkty' }],
                },
            },
            include: {
                pointCategories: true,
            },
        });
    }

    async syncGameWithBgg(gameId: string): Promise<Game> {
        const game = await this.prisma.game.findUnique({ where: { id: gameId } });
        if (!game) {
            throw new Error('Game not found');
        }

        if (!game.bggId) {
            throw new Error('Game does not have a BGG ID');
        }

        const stats = await this.bggService.getGameStats(game.bggId.toString());

        return this.prisma.game.update({
            where: { id: gameId },
            data: {
                bggRank: stats.bggRank,
                bggWeight: stats.weight,
            },
            include: {
                pointCategories: true,
            },
        });
    }

    async syncAllGamesWithBgg(): Promise<Game[]> {
        const games = await this.prisma.game.findMany({
            where: {
                bggId: { not: null }
            }
        });

        const updatedGames: Game[] = [];

        for (const game of games) {
            try {
                const updated = await this.syncGameWithBgg(game.id);
                updatedGames.push(updated);
            } catch (e) {
                console.error(`Failed to sync game ${game.id} (${game.name}):`, e);
            }
        }

        return updatedGames;
    }

    async updateCollectionStatus(gameId: string, inCollection: boolean): Promise<Game> {
        return this.prisma.game.update({
            where: { id: gameId },
            data: { inCollection },
            include: {
                pointCategories: true,
            },
        });
    }
}
