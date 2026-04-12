import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { RECORDING_STORAGE } from './storage/recording-storage.interface';
import { LocalRecordingStorage } from './storage/local-recording-storage.service';

@Module({
  controllers: [RecordingsController],
  providers: [
    RecordingsService,
    { provide: RECORDING_STORAGE, useClass: LocalRecordingStorage },
  ],
  exports: [RecordingsService],
})
export class RecordingsModule {}
