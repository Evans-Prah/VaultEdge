import {BaseEntity} from "./base.entity";
import {Check, Column, Entity, Index, JoinColumn, ManyToOne} from "typeorm";
import {User} from "./user.entity";

export enum WalletStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    FROZEN = "frozen"
}

export enum WalletType {
    STANDARD = 'standard',
    ESCROW = 'escrow',
    MARGIN = 'margin',
}

@Entity({ name: 'wallets' })
@Check(`"balance" >= 0`)
export class Wallet extends BaseEntity {
    @Index()
    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ name: 'balance', type: 'decimal', precision: 18, scale: 2, default: 0 })
    balance!: number;

    /**
     * Currency code, e.g., 'USD', 'EUR'
     */
    @Column({ name: 'currency', type: 'varchar', length: 10 })
    currency!: string;

    @Column({ name: 'status', type: 'enum', enum: WalletStatus, default: WalletStatus.ACTIVE })
    status!: WalletStatus;

    @Column({ name: 'type', type: 'enum', enum: WalletType, default: WalletType.STANDARD })
    type!: WalletType;

    // configure relationships
    @ManyToOne(() => User, user => user.wallets)
    @JoinColumn({ name: 'user_id' })
    user!: User;
}