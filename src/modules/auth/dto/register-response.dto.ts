export class RegisterResponseDto {
    id!: string;
    email!: string;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<RegisterResponseDto>) {
        Object.assign(this, partial);
    }
}