import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { GamesModule } from './games/games.module';
import { PlayersModule } from './players/players.module';
import { ResultsModule } from './results/results.module';
import { PrismaModule } from './prisma/prisma.module';


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),

    GamesModule,
    PlayersModule,
    ResultsModule,
    PrismaModule,

  ],
})
export class AppModule { }
