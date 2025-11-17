import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { PaystackService } from './paystack.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), JwtModule, UsersModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PaystackService],
})
export class SubscriptionModule { }