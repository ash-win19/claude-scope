import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { VisionService } from './vision.service';

@Module({
  controllers: [RecordingsController],
  providers: [RecordingsService, VisionService],
  exports: [RecordingsService, VisionService],
})
export class RecordingsModule {}
