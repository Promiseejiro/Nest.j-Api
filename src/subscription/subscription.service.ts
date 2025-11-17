import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { PaystackService } from './paystack.service';
import { PaystackSubscriptionPlanDto } from './dto/paystack-subscription.dto';

@Injectable()
export class SubscriptionService {
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private paystackService: PaystackService,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) throw new Error('PAYSTACK_SECRET_KEY not set');
  }

  async createSubscription(user: User, plan: SubscriptionPlan): Promise<any> {
    let response: any
    if (plan === "free_monthly") {
    } else {
      const planPrices = { [SubscriptionPlan.BASIC]: 5000, [SubscriptionPlan.PRO]: 1500 };
      const amount = planPrices[plan];
      response = await this.paystackService.createTransaction(amount === 5000 ? "PLN_up4up8bvjpjc069" : "PLN_4221v1kpd52dmah", amount, user.email);
      if (!response.status) {
        throw new InternalServerErrorException('Could not initialize Paystack transaction.');
      }
    }
    let subscription = await this.findSubscriptionByUser(user.id);
    if (!subscription) {
      subscription = this.subscriptionRepository.create({ user, plan });
    } else {
      subscription.plan = plan;
    }

    await this.subscriptionRepository.save(subscription);
    return { authorization_url: plan === "free_monthly" ? "" : response.data.authorization_url };
  }

  async getSubscriptionPlans(): Promise<PaystackSubscriptionPlanDto[]> {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    try {
      const response = await axios.get(`${this.paystackBaseUrl}/plan`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch subscription plans: ${error.message}`);
    }
  }
  async getUserSubscriptions(email: string | null): Promise<PaystackSubscriptionPlanDto[]> {
    console.log(email)
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    try {
      const response = await axios.get(`${this.paystackBaseUrl}/subscription?email=${email}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      throw new NotFoundException(`Failed to fetch subscription plans: ${error.message}`);
    }
  }

  async findSubscriptionByUser(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findAll(): Promise<Subscription[] | null> {
    return this.subscriptionRepository.find();
  }

  async handlePaystackWebhook(body: any) {
    console.log(body)
    const event = body.event;
    switch (event) {
      case 'charge.success':
        const { email } = body.data;
        const subscription = await this.subscriptionRepository.findOne({
          where: { user: { email } },
          relations: ['user'],
        });
        if (subscription) {
          subscription.status = SubscriptionStatus.ACTIVE;
          const now = new Date();
          subscription.nextPaymentDate = new Date(now.setMonth(now.getMonth() + 1));
          await this.subscriptionRepository.save(subscription);
        }
        break;
      default:
        console.log(`Unhandled event type: ${event}`);
    }
  }
}
