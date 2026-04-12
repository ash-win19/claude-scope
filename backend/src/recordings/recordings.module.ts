import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { VisionService } from './vision.service';
import { FrameExtractionService } from './frame-extraction.service';
import { VisionTimelineService } from './vision-timeline.service';
import { PlaywrightService } from './playwright.service';

@Module({
  controllers: [RecordingsController],
  providers: [RecordingsService, VisionService, FrameExtractionService, VisionTimelineService, PlaywrightService],
  exports: [RecordingsService, VisionService, FrameExtractionService, VisionTimelineService, PlaywrightService],
})
export class RecordingsModule {}
