import { z } from 'zod';

/**
 * Login form validation schema
 * Validates email format and password strength
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'البريد الإلكتروني مطلوب' })
    .email({ message: 'البريد الإلكتروني غير صحيح' }),
  password: z
    .string()
    .min(1, { message: 'كلمة المرور مطلوبة' })
    .min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
});

/**
 * Sign up form validation schema
 * Includes password confirmation and stronger rules
 */
export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'البريد الإلكتروني مطلوب' })
    .email({ message: 'البريد الإلكتروني غير صحيح' }),
  password: z
    .string()
    .min(1, { message: 'كلمة المرور مطلوبة' })
    .min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
    .regex(/[A-Z]/, { message: 'يجب أن تحتوي على حرف كبير واحد على الأقل' })
    .regex(/[0-9]/, { message: 'يجب أن تحتوي على رقم واحد على الأقل' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'تأكيد كلمة المرور مطلوب' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'البريد الإلكتروني مطلوب' })
    .email({ message: 'البريد الإلكتروني غير صحيح' }),
});

/**
 * Update password schema
 */
export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
    .regex(/[A-Z]/, { message: 'يجب أن تحتوي على حرف كبير واحد على الأقل' })
    .regex(/[0-9]/, { message: 'يجب أن تحتوي على رقم واحد على الأقل' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'تأكيد كلمة المرور مطلوب' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

/**
 * Validate form data against schema
 * @param {object} data - Form data to validate
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {object} { valid: boolean, errors: object }
 */
export const validateFormData = (data, schema) => {
  try {
    const validated = schema.parse(data);
    return { valid: true, errors: {}, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { valid: false, errors, data: null };
    }
    return { valid: false, errors: { general: 'خطأ في التحقق من البيانات' }, data: null };
  }
};

export default {
  loginSchema,
  signUpSchema,
  passwordResetSchema,
  updatePasswordSchema,
  validateFormData,
};
