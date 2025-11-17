import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Subscription } from '../../subscription/entities/subscription.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ default: "$2b$10$defaulttemporarypasswordhash123456789" })
    @Exclude()
    password: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @OneToOne(() => Subscription, (subscription) => subscription.user, { cascade: true })
    @JoinColumn()
    subscription: Subscription;
}