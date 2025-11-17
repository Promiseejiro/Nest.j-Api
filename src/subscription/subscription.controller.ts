import { Controller, Post, Body, UseGuards, Req, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Import our custom guard
import { Subscription, SubscriptionPlan } from './entities/subscription.entity';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { PaystackSubscriptionPlanDto } from './dto/paystack-subscription.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService,
    private readonly usersService: UsersService) { }

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize a subscription payment' })
  async initializeSubscription(
    @Req() req: RequestWithUser,
    @Body('plan') plan: SubscriptionPlan,
  ) {
    const userPayload = req.user;
    return this.subscriptionService.createSubscription(userPayload as any, plan);
  }

  @Get("plans")
  async getPlans(): Promise<PaystackSubscriptionPlanDto[]> {
    return this.subscriptionService.getSubscriptionPlans();
  }



  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserSubscriptions(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    return this.subscriptionService.getUserSubscriptions(user?.email || null);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription status' })
  async getSubscriptionStatus(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const subscription = await this.subscriptionService.findSubscriptionByUser(userId);
    if (!subscription) {
      return { plan: null, status: 'no_subscription' };
    }
    return { plan: subscription.plan, status: subscription.status };
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch all subscriptions (Admin)' })
  @ApiOkResponse({
    description: 'List of all subscriptions with user details',
    type: [Subscription]
  })
  async getAllSubscriptions() {
    return this.subscriptionService.findAll();
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Paystack webhooks' })
  async handleWebhook(@Body() body: any) {
    this.subscriptionService.handlePaystackWebhook(body);
    return 'Webhook received';
  }
}