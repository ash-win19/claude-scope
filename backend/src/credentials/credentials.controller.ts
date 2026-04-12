import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';

@ApiTags('Credentials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Get()
  @ApiOperation({ summary: 'List all credentials for current user' })
  findAll(@Req() req: Request) {
    const { id } = req.user as { id: string };
    return this.credentialsService.findAll(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new API key credential' })
  create(@Req() req: Request, @Body() dto: CreateCredentialDto) {
    const { id } = req.user as { id: string };
    return this.credentialsService.create(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing credential' })
  update(@Req() req: Request, @Param('id') credentialId: string, @Body() dto: UpdateCredentialDto) {
    const { id } = req.user as { id: string };
    return this.credentialsService.update(id, credentialId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a credential' })
  remove(@Req() req: Request, @Param('id') credentialId: string) {
    const { id } = req.user as { id: string };
    return this.credentialsService.remove(id, credentialId);
  }
}
