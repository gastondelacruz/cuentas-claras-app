import { z } from 'zod';

import { ApiContractError, parseOrThrow } from '../errors';

const sampleSchema = z.object({
  id: z.string(),
  count: z.number(),
});

describe('parseOrThrow', () => {
  it('returns parsed data when the contract matches', () => {
    const data = { id: 'abc', count: 3 };

    expect(parseOrThrow(sampleSchema, data)).toEqual(data);
  });

  it('throws ApiContractError with issues when the contract fails', () => {
    const data = { id: 123, count: 'three' };

    expect(() => parseOrThrow(sampleSchema, data)).toThrow(ApiContractError);

    try {
      parseOrThrow(sampleSchema, data);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiContractError);
      expect((error as ApiContractError).issues).toHaveLength(2);
      expect((error as ApiContractError).message).toBe('API response does not match contract');
    }
  });

  it('exposes the original Zod issues for diagnostics', () => {
    const data = { id: 'abc' };

    expect(() => parseOrThrow(sampleSchema, data)).toThrow(ApiContractError);

    try {
      parseOrThrow(sampleSchema, data);
    } catch (error) {
      const issues = (error as ApiContractError).issues;
      const missingCount = issues.find((issue) => issue.path[0] === 'count');

      expect(missingCount).toBeDefined();
      expect(missingCount?.message).toMatch(/expected number/i);
    }
  });
});
