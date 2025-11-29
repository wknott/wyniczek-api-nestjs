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
}
