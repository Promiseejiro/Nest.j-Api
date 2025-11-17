import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    const userId = req.user.sub;

    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new Error('User not found after authentication.');
    }
    return user;
  }
}