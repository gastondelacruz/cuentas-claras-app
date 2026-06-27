describe('api client environment configuration', () => {
  const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    jest.resetModules();

    if (originalApiUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
    }
  });

  it('uses EXPO_PUBLIC_API_URL when it is defined before module load', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://test-server';

    jest.isolateModules(() => {
      const { client } = require('../client') as typeof import('../client');

      expect(client.defaults.baseURL).toBe('http://test-server/api/v1');
    });
  });
});
