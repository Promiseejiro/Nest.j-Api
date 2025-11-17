import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Paystack = require('paystack');

@Injectable()
export class PaystackService {
    private readonly paystack: any;

    constructor(private readonly configService: ConfigService) {
        const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
        if (!secret) throw new Error('PAYSTACK_SECRET_KEY not set');
        this.paystack = Paystack(secret);
    }

    get client() {
        return this.paystack;
    }

    async createTransaction(plan: string, amount: number, email: string) {
        return this.paystack.transaction.initialize({
            amount: Math.round(amount * 100),
            email,
            plan: plan,
            callback_url: "http://localhost:3000/"
        });
    }

}
