import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { VisionService } from './vision.service';
import { FrameExtractionService } from './frame-extraction.service';
import { VisionTimelineService } from './vision-timeline.service';

@Module({
  controllers: [RecordingsController],
  providers: [RecordingsService, VisionService, FrameExtractionService, VisionTimelineService],
  exports: [RecordingsService, VisionService, FrameExtractionService, VisionTimelineService],
})
export class RecordingsModule {}
