import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');

export const phoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

export const currencySchema = z.number()
  .min(0, 'Amount must be positive')
  .max(999999999, 'Amount is too large');

export const dateSchema = z.string()
  .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid date');

export const urlSchema = z.string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

// Text validation
export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .trim();

export const descriptionSchema = z.string()
  .max(1000, 'Description is too long')
  .optional();

export const notesSchema = z.string()
  .max(2000, 'Notes are too long')
  .optional();

// Health-specific validation
export const weightSchema = z.number()
  .min(1, 'Weight must be positive')
  .max(1000, 'Weight seems unrealistic');

export const bloodPressureSchema = z.string()
  .regex(/^\d{2,3}\/\d{2,3}$/, 'Format: systolic/diastolic (e.g., 120/80)');

export const heartRateSchema = z.number()
  .min(30, 'Heart rate seems too low')
  .max(250, 'Heart rate seems too high');

export const temperatureSchema = z.number()
  .min(90, 'Temperature seems too low')
  .max(110, 'Temperature seems too high');

export const bloodSugarSchema = z.number()
  .min(20, 'Blood sugar seems too low')
  .max(600, 'Blood sugar seems too high');

// Fitness validation
export const exerciseNameSchema = z.string()
  .min(1, 'Exercise name is required')
  .max(100, 'Exercise name is too long');

export const repsSchema = z.number()
  .min(1, 'Reps must be positive')
  .max(1000, 'Reps seem excessive')
  .optional();

export const setsSchema = z.number()
  .min(1, 'Sets must be positive')
  .max(100, 'Sets seem excessive')
  .optional();

export const durationSchema = z.number()
  .min(1, 'Duration must be positive')
  .max(720, 'Duration seems excessive (max 12 hours)')
  .optional();

// Business validation
export const amountCentsSchema = z.number()
  .min(0, 'Amount must be positive')
  .max(99999999999, 'Amount is too large');

export const percentageSchema = z.number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100%');

// Content validation
export const hashtagSchema = z.string()
  .regex(/^#[a-zA-Z0-9_]+$/, 'Hashtag must start with # and contain only letters, numbers, and underscores')
  .optional();

export const platformHandleSchema = z.string()
  .min(1, 'Handle is required')
  .max(50, 'Handle is too long')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Handle can only contain letters, numbers, dots, dashes, and underscores');

// Utility functions
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateAndSanitize = <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: 'Validation failed' };
  }
};

export const createFormValidator = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown) => {
    const result = validateAndSanitize(data, schema);
    if (result.success) {
      return result.data;
    }
    throw new Error((result as { success: false; error: string }).error);
  };
};