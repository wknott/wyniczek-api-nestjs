import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Game } from './entities/game.entity';
import { CreateGameInput } from './dto/create-game.input';

@Injectable()
export class GamesService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<Game[]> {
        return this.prisma.game.findMany({
            include: {
                pointCategories: true,
            },
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
