
export class RegisterDto {
    email!: string;
    password!: string;
    firstName!: string;
    otherNames?: string;
    lastName!: string;
    phoneNumber?: string;
    dateOfBirth?: string;
}