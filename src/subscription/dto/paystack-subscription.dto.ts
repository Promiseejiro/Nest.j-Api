// src/subscription/dto/paystack-subscription.dto.ts
export class PaystackSubscriptionPlanDto {
    id: number;
    name: string;
    plan_code: string;
    description?: string;
    amount: number;
    interval: string;
    send_invoices: boolean;
    send_sms: boolean;
    currency: string;
}