import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get or create current authenticated user' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'avatarUrl', required: false })
  async me(
    @Req() req: Request,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('avatarUrl') avatarUrl?: string,
  ) {
    const { id, email: jwtEmail } = req.user as {
      id: string;
      email?: string;
    };
    return this.authService.findOrCreateUser(id, {
      name,
      email: email || jwtEmail,
      avatarUrl,
    });
  }
}
