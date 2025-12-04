import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Game, GameSortBy } from './entities/game.entity';
import { CreateGameInput } from './dto/create-game.input';

@Injectable()
export class GamesService {
    constructor(private prisma: PrismaService) { }

    async findAll(skip: number = 0, take: number = 10, sortBy: GameSortBy = GameSortBy.POPULARITY): Promise<{ items: Game[]; total: number }> {
        const total = await this.prisma.game.count();

        let items: Game[];

        switch (sortBy) {
            case GameSortBy.POPULARITY:
                items = await this.prisma.game.findMany({
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

        return this.prisma.game.create({
            data: {
                ...gameData,
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
}
