import { z } from 'zod';

const normalizedAmountPattern = /^\d+(\.\d{1,2})?$/;

export const newExpenseFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Ingresá un monto')
    // Strip thousands dots and turn the decimal comma into a dot before validating.
    .transform((value) => value.replace(/\./g, '').replace(',', '.'))
    .refine((value) => normalizedAmountPattern.test(value), 'Ingresá un monto válido')
    .transform((value) => Number(value))
    .refine((value) => value > 0, 'El monto debe ser mayor a 0'),
  description: z
    .string()
    .trim()
    .min(1, 'Ingresá una descripción'),
});

export type NewExpenseFormInput = z.input<typeof newExpenseFormSchema>;
export type NewExpenseFormValues = z.infer<typeof newExpenseFormSchema>;
