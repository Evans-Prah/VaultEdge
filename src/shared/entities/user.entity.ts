import {BaseEntity} from "./base.entity";
import {Column, Entity, OneToMany} from "typeorm";
import {Account} from "./account.entity";
import {Wallet} from "./wallet.entity";

export enum KYCStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED'
}

@Entity({ name: 'users' })
export class User extends BaseEntity {

    @Column({ name: 'email', type: 'varchar', unique: true, length: 255 })
    email!: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash!: string;

    @Column({ name: 'first_name', type: 'varchar', length: 255 })
    firstName!: string;

    @Column({ name: 'other_names', type: 'varchar', length: 255, nullable: true })
    otherNames!: string;

    @Column({ name: 'last_name', type: 'varchar', length: 255 })
    lastName!: string;

    @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
    phoneNumber!: string;

    @Column({ name: 'date_of_birth', type: 'date', nullable: true })
    dateOfBirth!: Date;

    @Column({ name: 'email_verified', type: 'boolean', default: false })
    emailVerified!: boolean;

    @Column({ name: 'phone_verified', type: 'boolean', default: false })
    phoneVerified!: boolean;

    @Column({ name: 'address', type: 'json', nullable: true })
    address!: {
        street: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
    };

    @Column({ name: 'kyc_status', type: 'enum', enum: KYCStatus, default: KYCStatus.NOT_STARTED })
    kycStatus!: KYCStatus;

    @Column({ name: 'kyc_document', type: 'jsonb', nullable: true })
    kycDocument!: {
        type: string;
        number: string;
        issued_by?: string;
        verification_date?: Date;
        front_image?: string;
        back_image?: string;
    };


    // configure relationships
    @OneToMany(() => Account, account => account.user)
    accounts!: Account[];

    @OneToMany(() => Wallet, wallet => wallet.user)
    wallets!: Wallet[];
}