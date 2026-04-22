import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BggService } from '../bgg/bgg.service';

import { Game, GameSortBy } from './entities/game.entity';
import { Expansion } from './entities/expansion.entity';
import { GameRecord } from './entities/game-record.entity';
import { GamePlayerStats } from './entities/game-player-stats.entity';
import { CreateGameInput } from './dto/create-game.input';
import { UpdatePointCategoryInput } from './dto/update-game-categories.input';
import { CreateExpansionInput } from './dto/create-expansion.input';
import { UpdateExpansionInput } from './dto/update-expansion.input';

@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private bggService: BggService,
  ) {}

  async findAll(
    userId: string,
    skip: number = 0,
    take: number = 10,
    sortBy: GameSortBy = GameSortBy.POPULARITY,
    includeNotInCollection: boolean = false,
  ): Promise<{ items: Game[]; total: number }> {
    const whereClause = includeNotInCollection
      ? { userId }
      : { userId, inCollection: true };
    const total = await this.prisma.game.count({ where: whereClause });

    let items: Game[];

    switch (sortBy) {
      case GameSortBy.POPULARITY:
        items = await this.prisma.game.findMany({
          where: whereClause,
          skip,
          take,
          include: {
            pointCategories: { orderBy: { order: 'asc' } },
          },
          orderBy: {
            results: { _count: 'desc' },
          },
        });
        break;

      case GameSortBy.LAST_PLAYED: {
        const gamesWithLatestResult = await this.prisma.game.findMany({
          where: whereClause,
          include: {
            pointCategories: { orderBy: { order: 'asc' } },
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

        items = sorted.slice(skip, skip + take).map((game) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { results, ...gameWithoutResults } = game;
          return gameWithoutResults as Game;
        });
        break;
      }

      case GameSortBy.AVG_PLAYING_TIME_2P: {
        const allGames = await this.prisma.game.findMany({
          where: whereClause,
          include: {
            pointCategories: { orderBy: { order: 'asc' } },
            results: {
              where: { playingTime: { not: null } },
              include: { _count: { select: { scores: true } } },
            },
          },
        });

        const withMedian = allGames.map((game) => {
          const times = game.results
            .filter((r) => r._count.scores === 2)
            .map((r) => r.playingTime!);
          return { game, median: times.length > 0 ? this.median(times) : null };
        });

        withMedian.sort((a, b) => {
          if (a.median === null && b.median === null) return 0;
          if (a.median === null) return 1;
          if (b.median === null) return -1;
          return a.median - b.median;
        });

        items = withMedian.slice(skip, skip + take).map(({ game }) => {
          const { results, ...gameWithoutResults } = game;
          void results;
          return gameWithoutResults as Game;
        });
        break;
      }

      case GameSortBy.ALPHABETICAL:
      default:
        items = await this.prisma.game.findMany({
          where: whereClause,
          skip,
          take,
          include: {
            pointCategories: { orderBy: { order: 'asc' } },
          },
          orderBy: { name: 'asc' },
        });
        break;
    }

    return { items, total };
  }

  private median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }

  async getAvgPlayingTime2Players(
    gameId: string,
    userId: string,
  ): Promise<number | null> {
    const results = await this.prisma.result.findMany({
      where: {
        gameId,
        userId,
        playingTime: { not: null },
      },
      include: {
        _count: { select: { scores: true } },
      },
    });

    const times = results
      .filter((r) => r._count.scores === 2)
      .map((r) => r.playingTime!);

    return times.length > 0 ? this.median(times) : null;
  }

  async findLatestResult(gameId: string, userId: string) {
    return this.prisma.result.findFirst({
      where: { gameId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Game | null> {
    return this.prisma.game.findFirst({
      where: { id, userId },
      include: {
        pointCategories: { orderBy: { order: 'asc' } },
      },
    });
  }

  async create(
    createGameInput: CreateGameInput,
    userId: string,
  ): Promise<Game> {
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
      maxPlayers: 4,
    };

    if (gameData.bggId) {
      try {
        const [details, stats] = await Promise.all([
          this.bggService.getGameDetails(gameData.bggId.toString()),
          this.bggService.getGameStats(gameData.bggId.toString()),
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
        userId,
        pointCategories: {
          create:
            pointCategoryNames && pointCategoryNames.length > 0
              ? pointCategoryNames.map((name, index) => ({
                  name,
                  order: index,
                }))
              : [{ name: 'Punkty', order: 0 }],
        },
      },
      include: {
        pointCategories: { orderBy: { order: 'asc' } },
      },
    });
  }

  async syncGameWithBgg(gameId: string, userId: string): Promise<Game> {
    await this.assertGameOwnership(gameId, userId);
    const game = await this.prisma.game.findUniqueOrThrow({
      where: { id: gameId },
      select: { bggId: true },
    });

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
        pointCategories: { orderBy: { order: 'asc' } },
      },
    });
  }

  async syncAllGamesWithBgg(userId: string): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      where: {
        userId,
        bggId: { not: null },
      },
    });

    const updatedGames: Game[] = [];

    for (const game of games) {
      try {
        const updated = await this.syncGameWithBgg(game.id, userId);
        updatedGames.push(updated);
      } catch (e) {
        console.error(`Failed to sync game ${game.id} (${game.name}):`, e);
      }
    }

    return updatedGames;
  }

  async updateCollectionStatus(
    gameId: string,
    inCollection: boolean,
    userId: string,
  ): Promise<Game> {
    await this.assertGameOwnership(gameId, userId);
    return this.prisma.game.update({
      where: { id: gameId },
      data: { inCollection },
      include: {
        pointCategories: { orderBy: { order: 'asc' } },
      },
    });
  }

  async updateGameManualUrl(
    gameId: string,
    url: string | null,
    userId: string,
  ): Promise<Game> {
    await this.assertGameOwnership(gameId, userId);
    return this.prisma.game.update({
      where: { id: gameId },
      data: { manualUrl: url },
      include: {
        pointCategories: { orderBy: { order: 'asc' } },
      },
    });
  }

  async findExpansionsByGameId(
    gameId: string,
    userId: string,
  ): Promise<Expansion[]> {
    return this.prisma.expansion.findMany({
      where: { gameId, deletedAt: null, game: { userId } },
      include: { pointCategories: { orderBy: { order: 'asc' } } },
    });
  }

  async createExpansion(
    input: CreateExpansionInput,
    userId: string,
  ): Promise<Expansion> {
    const { gameId, name, pointCategoryNames } = input;
    await this.assertGameOwnership(gameId, userId);
    return this.prisma.expansion.create({
      data: {
        gameId,
        name,
        pointCategories: {
          create:
            pointCategoryNames && pointCategoryNames.length > 0
              ? pointCategoryNames.map((catName, index) => ({
                  name: catName,
                  order: index,
                }))
              : [],
        },
      },
      include: { pointCategories: { orderBy: { order: 'asc' } } },
    });
  }

  async updateExpansion(
    input: UpdateExpansionInput,
    userId: string,
  ): Promise<Expansion> {
    const { id, name, categories } = input;
    await this.assertExpansionOwnership(id, userId);

    return this.prisma.$transaction(async (tx) => {
      if (name !== undefined) {
        await tx.expansion.update({ where: { id }, data: { name } });
      }

      if (categories !== undefined) {
        const existingCategories = await tx.pointCategory.findMany({
          where: { expansionId: id },
        });
        const existingMap = new Map(existingCategories.map((c) => [c.id, c]));

        const toCreate = categories.filter((c) => !c.id);
        const toUpdate = categories.filter(
          (c) => c.id && existingMap.has(c.id),
        );
        const toUpdateIds = new Set(toUpdate.map((c) => c.id));
        const toDelete = existingCategories.filter(
          (c) => !toUpdateIds.has(c.id),
        );

        if (toDelete.length > 0) {
          await tx.pointCategory.deleteMany({
            where: { id: { in: toDelete.map((c) => c.id) } },
          });
        }

        for (const category of toUpdate) {
          await tx.pointCategory.update({
            where: { id: category.id! },
            data: { name: category.name, order: category.order },
          });
        }

        if (toCreate.length > 0) {
          await tx.pointCategory.createMany({
            data: toCreate.map((c) => ({
              name: c.name,
              order: c.order,
              expansionId: id,
            })),
          });
        }
      }

      return tx.expansion.findUniqueOrThrow({
        where: { id },
        include: { pointCategories: { orderBy: { order: 'asc' } } },
      });
    });
  }

  async deleteExpansion(id: string, userId: string): Promise<Expansion> {
    await this.assertExpansionOwnership(id, userId);
    return this.prisma.expansion.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { pointCategories: { orderBy: { order: 'asc' } } },
    });
  }

  async findRecordsByGameId(
    gameId: string,
    userId: string,
  ): Promise<GameRecord[]> {
    const results = await this.prisma.result.findMany({
      where: { gameId, userId },
      include: {
        expansions: { where: { deletedAt: null } },
        scores: { include: { points: true, player: true } },
      },
    });

    const groups = new Map<
      string,
      { expansions: Expansion[]; best: GameRecord | null }
    >();

    for (const result of results) {
      const sortedExpansions = [...result.expansions].sort((a, b) =>
        a.id.localeCompare(b.id),
      );
      const key = sortedExpansions.map((e) => e.id).join(',');

      if (!groups.has(key)) {
        groups.set(key, { expansions: sortedExpansions, best: null });
      }
      const group = groups.get(key)!;

      for (const score of result.scores) {
        const total = score.points.reduce((sum, p) => sum + (p.value ?? 0), 0);
        if (!group.best || total > group.best.totalPoints) {
          group.best = {
            expansions: group.expansions,
            totalPoints: total,
            resultId: result.id,
            player: score.player,
            createdAt: result.createdAt,
          };
        }
      }
    }

    return [...groups.values()]
      .map((g) => g.best!)
      .filter((r) => r !== null && r.totalPoints > 0)
      .sort((a, b) => {
        const lenDiff = a.expansions.length - b.expansions.length;
        if (lenDiff !== 0) return lenDiff;
        return a.expansions
          .map((e) => e.name)
          .join()
          .localeCompare(b.expansions.map((e) => e.name).join());
      });
  }

  async findPlayerStatsByGameId(
    gameId: string,
    userId: string,
  ): Promise<GamePlayerStats[]> {
    const results = await this.prisma.result.findMany({
      where: { gameId, userId },
      include: {
        scores: { include: { points: true, player: true } },
      },
    });

    const statsByPlayer = new Map<
      string,
      { player: GamePlayerStats['player']; wins: number; totalGames: number }
    >();

    for (const result of results) {
      if (result.scores.length === 0) continue;

      const totals = result.scores.map((score) => ({
        score,
        total: score.points.reduce((sum, p) => sum + (p.value ?? 0), 0),
      }));

      const maxTotal = Math.max(...totals.map((t) => t.total));

      for (const { score } of totals) {
        if (!statsByPlayer.has(score.playerId)) {
          statsByPlayer.set(score.playerId, {
            player: score.player,
            wins: 0,
            totalGames: 0,
          });
        }
        statsByPlayer.get(score.playerId)!.totalGames++;
      }

      for (const { score, total } of totals) {
        if (total === maxTotal) {
          statsByPlayer.get(score.playerId)!.wins++;
        }
      }
    }

    return [...statsByPlayer.values()]
      .filter((s) => s.totalGames > 0)
      .sort(
        (a, b) =>
          b.wins - a.wins ||
          b.totalGames - a.totalGames ||
          a.player.name.localeCompare(b.player.name),
      );
  }

  async updateGameCategories(
    gameId: string,
    categories: UpdatePointCategoryInput[],
    userId: string,
  ): Promise<Game> {
    await this.assertGameOwnership(gameId, userId);
    return this.prisma.$transaction(async (tx) => {
      const existingCategories = await tx.pointCategory.findMany({
        where: { gameId },
      });
      const existingCategoriesMap = new Map(
        existingCategories.map((c) => [c.id, c]),
      );

      const categoriesToCreate = categories.filter((c) => !c.id);
      const categoriesToUpdate = categories.filter(
        (c) => c.id && existingCategoriesMap.has(c.id),
      );
      const categoriesToUpdateIds = new Set(
        categoriesToUpdate.map((c) => c.id),
      );
      const categoriesToDelete = existingCategories.filter(
        (c) => !categoriesToUpdateIds.has(c.id),
      );

      if (categoriesToDelete.length > 0) {
        await tx.pointCategory.deleteMany({
          where: { id: { in: categoriesToDelete.map((c) => c.id) } },
        });
      }

      for (const category of categoriesToUpdate) {
        if (category.id) {
          await tx.pointCategory.update({
            where: { id: category.id },
            data: { name: category.name, order: category.order },
          });
        }
      }

      if (categoriesToCreate.length > 0) {
        await tx.pointCategory.createMany({
          data: categoriesToCreate.map((c) => ({
            name: c.name,
            order: c.order,
            gameId,
          })),
        });
      }

      const game = await tx.game.findUnique({
        where: { id: gameId },
        include: { pointCategories: true },
      });

      if (!game) {
        throw new NotFoundException('Gra nie została znaleziona');
      }

      return game;
    });
  }

  private async assertGameOwnership(
    gameId: string,
    userId: string,
  ): Promise<void> {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, userId },
      select: { id: true },
    });
    if (!game) {
      throw new NotFoundException('Gra nie została znaleziona');
    }
  }

  private async assertExpansionOwnership(
    expansionId: string,
    userId: string,
  ): Promise<void> {
    const expansion = await this.prisma.expansion.findFirst({
      where: { id: expansionId, game: { userId } },
      select: { id: true },
    });
    if (!expansion) {
      throw new NotFoundException('Dodatek nie został znaleziony');
    }
  }
}
