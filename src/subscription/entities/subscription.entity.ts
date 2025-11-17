import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SubscriptionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    CANCELLED = 'cancelled',
}

export enum SubscriptionPlan {
    FREE = 'free_monthly',
    BASIC = 'basic_monthly',
    PRO = 'pro_monthly',
}

@Entity()
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @OneToOne(() => User, (user) => user.subscription)
    user: User;

    @Column({
        type: 'enum',
        enum: SubscriptionPlan,
        default: SubscriptionPlan.BASIC,
    })
    plan: SubscriptionPlan;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.INACTIVE,
    })
    status: SubscriptionStatus;

    @Column({ nullable: true })
    paystackSubscriptionCode: string;

    @Column({ nullable: true })
    paystackCustomerCode: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    nextPaymentDate: Date;
}