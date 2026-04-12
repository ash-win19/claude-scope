import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { VisionService } from './vision.service';
import { FrameExtractionService } from './frame-extraction.service';

@Module({
  controllers: [RecordingsController],
  providers: [RecordingsService, VisionService, FrameExtractionService],
  exports: [RecordingsService, VisionService, FrameExtractionService],
})
export class RecordingsModule {}
