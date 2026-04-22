import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_GUARD } from '@nestjs/core';
import { Request } from 'express';
import { join } from 'path';

import { GamesModule } from './games/games.module';
import { PlayersModule } from './players/players.module';
import { ResultsModule } from './results/results.module';
import { PrismaModule } from './prisma/prisma.module';
import { BggModule } from './bgg/bgg.module';
import { AuthModule } from './auth/auth.module';
import { ClerkAuthGuard } from './auth/clerk-auth.guard';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }: { req: Request }) => ({ req }),
    }),

    GamesModule,
    PlayersModule,
    ResultsModule,
    PrismaModule,
    BggModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ClerkAuthGuard }],
})
export class AppModule {}
