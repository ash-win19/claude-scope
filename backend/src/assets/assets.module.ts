import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AssetStorageService } from './asset-storage.service';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, AssetStorageService],
  exports: [AssetsService],
})
export class AssetsModule {}
