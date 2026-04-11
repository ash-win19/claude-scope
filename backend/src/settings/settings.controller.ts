import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user settings' })
  get(@Req() req: Request) {
    const { id } = req.user as { id: string };
    return this.settingsService.get(id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user settings' })
  update(@Req() req: Request, @Body() dto: UpdateSettingsDto) {
    const { id } = req.user as { id: string };
    return this.settingsService.update(id, dto);
  }
}
