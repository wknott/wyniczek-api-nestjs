import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { BggService } from './bgg.service';
import { BggResolver } from './bgg.resolver';

@Module({
    imports: [
        HttpModule,
        CacheModule.register({
            ttl: 60 * 60 * 1000,
            max: 100,
        }),
    ],
    providers: [BggService, BggResolver],
    exports: [BggService],
})
export class BggModule { }
