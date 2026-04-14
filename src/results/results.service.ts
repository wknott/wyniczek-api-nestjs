import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Result } from './entities/result.entity';
import { Game } from '../games/entities/game.entity';
import { Expansion } from '../games/entities/expansion.entity';
import { Score } from './entities/score.entity';
import { Player } from '../players/entities/player.entity';
import { Point } from './entities/point.entity';
import { PointCategory } from '../games/entities/point-category.entity';
import { ResultImage } from './entities/result-image.entity';

import { CreateResultInput, CreateScoreInput } from './dto/create-result.input';
import { UpdateResultInput } from './dto/update-result.input';

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  private prepareScoresData(
    scores: CreateScoreInput[],
    gameCategories: { id: string }[],
  ) {
    return scores.map((scoreInput) => {
      const inputPoints = scoreInput.points || [];

      const finalPoints = gameCategories.map((category) => {
        const inputPoint = inputPoints.find(
          (p) => p.pointCategoryId === category.id,
        );
        return {
          pointCategoryId: category.id,
          value: inputPoint?.value ?? 0,
        };
      });

      return {
        playerId: scoreInput.playerId,
        points: finalPoints,
      };
    });
  }

  async create(createResultInput: CreateResultInput): Promise<Result> {
    const { gameId, userId, scores, playingTime, expansionIds, images } =
      createResultInput;

    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { pointCategories: { orderBy: { order: 'asc' } } },
    });

    if (!game) {
      throw new Error(`Game with ID ${gameId} not found`);
    }

    let allCategories: { id: string }[] = [...game.pointCategories];

    if (expansionIds && expansionIds.length > 0) {
      const expansionCategories = await this.prisma.pointCategory.findMany({
        where: { expansionId: { in: expansionIds } },
        orderBy: { order: 'asc' },
      });
      allCategories = [...allCategories, ...expansionCategories];
    }

    const scoresData = this.prepareScoresData(scores, allCategories);

    return this.prisma.result.create({
      data: {
        gameId,
        userId,
        playingTime,
        expansions:
          expansionIds && expansionIds.length > 0
            ? { connect: expansionIds.map((id) => ({ id })) }
            : undefined,
        images:
          images && images.length > 0
            ? {
                create: images.map((img) => ({
                  url: img.url,
                  key: img.key,
                  order: img.order,
                })),
              }
            : undefined,
        scores: {
          create: scoresData.map((score) => ({
            playerId: score.playerId,
            points: {
              create: score.points.map((point) => ({
                pointCategoryId: point.pointCategoryId,
                value: point.value,
              })),
            },
          })),
        },
      },
    });
  }

  async findImages(resultId: string): Promise<ResultImage[]> {
    return this.prisma.resultImage.findMany({
      where: { resultId },
      orderBy: { order: 'asc' },
    });
  }

  async findAll(
    skip: number = 0,
    take: number = 10,
    gameId?: string,
  ): Promise<{ items: Result[]; total: number }> {
    const where = gameId ? { gameId } : {};

    const [items, total] = await Promise.all([
      this.prisma.result.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.result.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string): Promise<Result | null> {
    return this.prisma.result.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    updateResultInput: UpdateResultInput,
  ): Promise<Result> {
    const {
      scores,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      id: _,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      expansionIds: _expansionIds,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      images: _images,
      ...data
    } = updateResultInput;

    if (scores) {
      let gameId = data.gameId;
      if (!gameId) {
        const currentResult = await this.prisma.result.findUnique({
          where: { id },
          select: { gameId: true },
        });
        if (currentResult) gameId = currentResult.gameId;
      }

      let gameCategories: { id: string }[] = [];
      if (gameId) {
        const game = await this.prisma.game.findUnique({
          where: { id: gameId },
          include: { pointCategories: { orderBy: { order: 'asc' } } },
        });
        if (game) gameCategories = game.pointCategories;
      }

      const scoresData = this.prepareScoresData(scores, gameCategories);

      return this.prisma.result.update({
        where: { id },
        data: {
          ...data,
          scores: {
            deleteMany: {},
            create: scoresData.map((score) => ({
              playerId: score.playerId,
              points: {
                create: score.points,
              },
            })),
          },
        },
      });
    }

    return this.prisma.result.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async remove(id: string): Promise<Result> {
    return this.prisma.result.delete({
      where: { id },
    });
  }

  async findLatestByGameName(gameName: string): Promise<Result | null> {
    return this.prisma.result.findFirst({
      where: {
        game: {
          name: {
            contains: gameName,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findGame(gameId: string): Promise<Game | null> {
    return this.prisma.game.findUnique({
      where: { id: gameId },
      include: { pointCategories: { orderBy: { order: 'asc' } } },
    });
  }

  async findScores(resultId: string): Promise<Score[]> {
    return this.prisma.score.findMany({
      where: { resultId },
    });
  }

  async findPlayer(playerId: string): Promise<Player | null> {
    return this.prisma.player.findUnique({
      where: { id: playerId },
    });
  }

  async findPoints(scoreId: string): Promise<Point[]> {
    return this.prisma.point.findMany({
      where: { scoreId },
    });
  }

  async findPointCategory(
    pointCategoryId: string,
  ): Promise<PointCategory | null> {
    return this.prisma.pointCategory.findUnique({
      where: { id: pointCategoryId },
    });
  }

  async findExpansions(resultId: string): Promise<Expansion[]> {
    const result = await this.prisma.result.findUnique({
      where: { id: resultId },
      include: { expansions: true },
    });
    return result?.expansions ?? [];
  }
}
