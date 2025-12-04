import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Player } from './entities/player.entity';

@Injectable()
export class PlayersService {
    constructor(private prisma: PrismaService) { }

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
}
