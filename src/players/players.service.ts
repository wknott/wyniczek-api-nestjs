import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Player } from './entities/player.entity';
import { PlayerRecord } from './entities/player-record.entity';
import { Expansion } from '../games/entities/expansion.entity';
import { Game } from '../games/entities/game.entity';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<Player[]> {
    return this.prisma.player.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Player | null> {
    return this.prisma.player.findFirst({
      where: { id, userId },
    });
  }

  async create(data: { name: string; userId: string }): Promise<Player> {
    return this.prisma.player.create({
      data,
    });
  }

  async remove(id: string, userId: string): Promise<Player> {
    const player = await this.prisma.player.findFirst({
      where: { id, userId },
    });
    if (!player) {
      throw new NotFoundException('Gracz nie został znaleziony');
    }
    return this.prisma.player.delete({
      where: { id },
    });
  }

  async findTotalWinsByPlayerId(
    playerId: string,
    userId: string,
  ): Promise<number> {
    const results = await this.prisma.result.findMany({
      where: { userId, scores: { some: { playerId } } },
      include: { scores: { include: { points: true } } },
    });

    let wins = 0;
    for (const result of results) {
      if (result.scores.length === 0) continue;

      const totals = result.scores.map((s) => ({
        playerId: s.playerId,
        total: s.points.reduce((sum, p) => sum + (p.value ?? 0), 0),
      }));

      const maxTotal = Math.max(...totals.map((t) => t.total));
      const playerScore = totals.find((t) => t.playerId === playerId);
      if (playerScore && playerScore.total === maxTotal) wins++;
    }

    return wins;
  }

  async findRecordsByPlayerId(
    playerId: string,
    userId: string,
  ): Promise<PlayerRecord[]> {
    const scores = await this.prisma.score.findMany({
      where: { playerId, result: { userId } },
      include: {
        points: true,
        result: {
          include: {
            game: true,
            expansions: { where: { deletedAt: null } },
          },
        },
      },
    });

    const groups = new Map<
      string,
      {
        game: Game;
        expansions: Expansion[];
        best: PlayerRecord | null;
      }
    >();

    for (const score of scores) {
      const { result } = score;
      const sortedExpansions = [...result.expansions].sort((a, b) =>
        a.id.localeCompare(b.id),
      );
      const key = `${result.gameId}::${sortedExpansions.map((e) => e.id).join(',')}`;

      if (!groups.has(key)) {
        groups.set(key, {
          game: result.game,
          expansions: sortedExpansions,
          best: null,
        });
      }
      const group = groups.get(key)!;

      const total = score.points.reduce((sum, p) => sum + (p.value ?? 0), 0);
      if (!group.best || total > group.best.totalPoints) {
        group.best = {
          game: group.game,
          expansions: group.expansions,
          totalPoints: total,
          resultId: result.id,
          createdAt: result.createdAt,
        };
      }
    }

    return [...groups.values()]
      .map((g) => g.best!)
      .filter((r) => r !== null && r.totalPoints > 0)
      .sort((a, b) => {
        const nameDiff = a.game.name.localeCompare(b.game.name);
        if (nameDiff !== 0) return nameDiff;
        const lenDiff = a.expansions.length - b.expansions.length;
        if (lenDiff !== 0) return lenDiff;
        return a.expansions
          .map((e) => e.name)
          .join()
          .localeCompare(b.expansions.map((e) => e.name).join());
      });
  }
}
