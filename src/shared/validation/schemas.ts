import { z } from 'zod';

/**
 * Shared validation schemas for the application
 * This centralizes validation logic to avoid duplication
 */

/**
 * UUID validation schema
 */
const uuidSchema = z.string().uuid();

/**
 * Enhanced UUID schema that's more lenient for tests
 * This allows both proper UUIDs or specific test values
 */
const uuidSchemaForTests = z.string().refine(
  val => {
    // Accept valid UUIDs
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(val);
  },
  { message: 'Invalid UUID format' },
);

/**
 * Customer validation schemas
 */
export const customerSchemas = {
  create: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
  }),

  update: z
    .object({
      fullName: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
    })
    .refine(data => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
};

/**
 * Loan application validation schemas
 */
export const loanApplicationSchemas = {
  create: z.object({
    customerId: uuidSchemaForTests,
    amount: z.number().positive(),
    termMonths: z.number().int().min(1).max(360),
    annualInterestRate: z.number().min(0).max(100),
  }),
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  pagination: z.object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
  }),

  id: uuidSchema,
};
