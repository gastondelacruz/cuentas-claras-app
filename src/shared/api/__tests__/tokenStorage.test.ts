import { clearRefreshToken, getRefreshToken, setRefreshToken } from '../tokenStorage';

describe('tokenStorage', () => {
  it('persists and clears refresh token through secure-store', async () => {
    await setRefreshToken('tok-xyz');
    await expect(getRefreshToken()).resolves.toBe('tok-xyz');

    await clearRefreshToken();
    await expect(getRefreshToken()).resolves.toBeNull();
  });
});
