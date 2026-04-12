import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { SettingsModule } from './settings/settings.module';
import { RecordingsModule } from './recordings/recordings.module';
import { CredentialsModule } from './credentials/credentials.module';
import { AssetsModule } from './assets/assets.module';
import { HealthController } from './health.controller';
import { validateConfig } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateConfig }),
    DatabaseModule,
    AuthModule,
    SessionsModule,
    SettingsModule,
    RecordingsModule,
    CredentialsModule,
    AssetsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
