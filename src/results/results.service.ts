import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Result } from './entities/result.entity';
import { Game } from '../games/entities/game.entity';
import { Score } from './entities/score.entity';
import { Player } from '../players/entities/player.entity';
import { Point } from './entities/point.entity';
import { PointCategory } from '../games/entities/game.entity';


@Injectable()
export class ResultsService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<Result[]> {
        return this.prisma.result.findMany();
    }

    async findOne(id: string): Promise<Result | null> {
        return this.prisma.result.findUnique({
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
            include: { pointCategories: true },
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

    async findPointCategory(pointCategoryId: string): Promise<PointCategory | null> {
        return this.prisma.pointCategory.findUnique({
            where: { id: pointCategoryId },
        });
    }
}
