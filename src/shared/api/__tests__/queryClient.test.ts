import { queryClient } from '../queryClient';

describe('queryClient', () => {
  it('uses expected defaults', () => {
    expect(queryClient.getDefaultOptions().queries).toMatchObject({
      retry: 2,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    });
  });
});
