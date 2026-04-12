import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recording session' })
  create(@Req() req: Request, @Body() dto: CreateSessionDto) {
    const { id } = req.user as { id: string };
    return this.sessionsService.create(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all sessions for the current user' })
  findAll(@Req() req: Request) {
    const { id } = req.user as { id: string };
    return this.sessionsService.findAllByUser(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get session statistics for the current user' })
  stats(@Req() req: Request) {
    const { id } = req.user as { id: string };
    return this.sessionsService.getStats(id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get processing status for a session' })
  getStatus(@Req() req: Request, @Param('id') sessionId: string) {
    const { id } = req.user as { id: string };
    return this.sessionsService.getProcessingStatus(id, sessionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single session with frames' })
  findOne(@Req() req: Request, @Param('id') sessionId: string) {
    const { id } = req.user as { id: string };
    return this.sessionsService.findOne(id, sessionId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a session' })
  update(
    @Req() req: Request,
    @Param('id') sessionId: string,
    @Body() dto: UpdateSessionDto,
  ) {
    const { id } = req.user as { id: string };
    return this.sessionsService.update(id, sessionId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a session' })
  remove(@Req() req: Request, @Param('id') sessionId: string) {
    const { id } = req.user as { id: string };
    return this.sessionsService.remove(id, sessionId);
  }
}
