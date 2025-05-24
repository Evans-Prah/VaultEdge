import { z } from 'zod';

/**
 * Schema for address validation
 */
const addressSchema = z.object({
    street: z.string().min(3).max(100),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50),
    country: z.string().min(2).max(50),
    postal_code: z.string().min(3).max(20),
});

/**
 * Schema for validating user profile updates
 */
export const updateProfileSchema = z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    otherNames: z.string().min(2).max(100).optional(),
    phoneNumber: z.string().regex(/^\+?[0-9]{8,15}$/).optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    address: addressSchema.optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});

/**
 * Schema for KYC verification completion
 */
export const kycCompletionSchema = z.object({
    isApproved: z.enum(['true', 'false'])
});