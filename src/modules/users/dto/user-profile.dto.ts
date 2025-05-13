import {KYCStatus, User} from "../../../shared/entities/user.entity";

export class UserProfileDto {
    id?: string;
    email?: string;
    firstName?: string;
    otherNames?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    kycStatus?: KYCStatus;
    createdAt?: Date;
    updatedAt?: Date;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
    };
    kycDocument?: {
        type: string;
        number: string;
        issued_by?: string;
        verification_date?: Date;
        front_image?: string;
        back_image?: string;
    };


    // Omit sensitive information like password and full KYC documents
    static fromEntity(user: User): UserProfileDto {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            otherNames: user.otherNames,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            kycStatus: user.kycStatus,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            address: user.address,
            kycDocument: user.kycDocument,
        };
    }
}

export class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    otherNames?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
    };
}