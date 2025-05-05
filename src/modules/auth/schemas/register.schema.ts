import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    firstName: z.string().max(255),
    otherNames: z.string().max(255).optional(),
    lastName: z.string().max(255),
    phoneNumber: z.string().max(20).optional(),
    dateOfBirth: z.string().optional(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;