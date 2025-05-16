import { ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../errors/validation-error';

/**
 * Validate data against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated data
 * @throws ValidationError if validation fails
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Validation failed', error.errors);
    }
    throw error;
  }
}
