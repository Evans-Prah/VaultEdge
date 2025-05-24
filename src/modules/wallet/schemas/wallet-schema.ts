import {z} from "zod";

export const createWalletSchema = z.object({
    type: z.enum(['standard', 'escrow', 'margin']),
    currency: z.string().min(3).max(10),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for creation"
});

export const updateWalletSchema = z.object({
    type: z.enum(['standard', 'escrow', 'margin']).optional(),
    status: z.enum(['active', 'inactive', 'frozen']).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});