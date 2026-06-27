import { z } from 'zod';

export class ApiContractError extends Error {
  constructor(
    message: string,
    public readonly issues: z.ZodIssue[],
  ) {
    super(message);
    this.name = 'ApiContractError';
  }
}

export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiContractError('API response does not match contract', result.error.issues);
  }

  return result.data;
}
