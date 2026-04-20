import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Player } from './entities/player.entity';
import { PlayerRecord } from './entities/player-record.entity';
import { Expansion } from '../games/entities/expansion.entity';
import { Game } from '../games/entities/game.entity';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Player[]> {
    return this.prisma.player.findMany();
  }

  async findOne(id: string): Promise<Player | null> {
    return this.prisma.player.findUnique({
      where: { id },
    });
  }

  async create(data: { name: string; userId: string }): Promise<Player> {
    return this.prisma.player.create({
      data,
    });
  }

  async remove(id: string): Promise<Player> {
    return this.prisma.player.delete({
      where: { id },
    });
  }

  async findRecordsByPlayerId(playerId: string): Promise<PlayerRecord[]> {
    const scores = await this.prisma.score.findMany({
      where: { playerId },
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
