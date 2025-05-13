export class LoginResponseDto {
    accessToken!: string;
    expiresIn?: number;
    userId!: string;
    email!: string;
    firstName!: string;
    lastName!: string;
    phoneNumber?: string;

    constructor(partial: Partial<LoginResponseDto>) {
        Object.assign(this, partial);
    }
}