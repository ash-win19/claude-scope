import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AssetsService } from './assets.service';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Serve an asset file' })
  async serve(@Param('id') id: string, @Res() res: Response) {
    const { buffer, mimeType } = await this.assetsService.getAsset(id);
    res.set('Content-Type', mimeType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buffer);
  }
}
