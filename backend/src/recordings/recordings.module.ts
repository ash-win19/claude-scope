import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { VisionService } from './vision.service';
import { FrameExtractionService } from './frame-extraction.service';
import { VisionTimelineService } from './vision-timeline.service';
import { PlaywrightService } from './playwright.service';
import { SynthesisService } from './synthesis.service';
import { AssetsModule } from '../assets/assets.module';
import { CredentialsModule } from '../credentials/credentials.module';

@Module({
  imports: [AssetsModule, CredentialsModule],
  controllers: [RecordingsController],
  providers: [
    RecordingsService,
    VisionService,
    FrameExtractionService,
    VisionTimelineService,
    PlaywrightService,
    SynthesisService,
  ],
  exports: [
    RecordingsService,
    VisionService,
    FrameExtractionService,
    VisionTimelineService,
    PlaywrightService,
    SynthesisService,
  ],
})
export class RecordingsModule {}
