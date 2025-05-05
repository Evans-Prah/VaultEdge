import {BaseEntity} from "./base.entity";
import {Column, Entity, Index, JoinColumn, ManyToOne} from "typeorm";
import {User} from "./user.entity";

export enum AccountType {
    CHECKING = "checking",
    SAVINGS = "savings",
    INVESTMENT = "investment",
    LOAN = "loan"
}

export enum AccountStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    FROZEN = "frozen",
    CLOSED = "closed"
}

@Entity({ name: 'accounts' })
export class Account extends BaseEntity {
    @Index()
    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ name: 'account_number', type: 'varchar' })
    accountNumber!: string;

    @Column({ type: 'enum', enum: AccountType })
    type!: AccountType;

    @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
    status!: AccountStatus;

    @Column({ name: 'balance', type: 'decimal', precision: 18, scale: 2, default: 0 })
    balance!: number;

    @Column({ name: 'currency', type: 'varchar', length: 10 })
    currency!: string;


    // configure relationships
     @ManyToOne(() => User, user => user.accounts)
     @JoinColumn({ name: 'user_id' })
     user!: User;
}