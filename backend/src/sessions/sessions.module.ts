import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SynthesisService } from '../recordings/synthesis.service';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, SynthesisService],
  exports: [SessionsService],
})
export class SessionsModule {}
