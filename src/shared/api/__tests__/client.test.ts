import MockAdapter from 'axios-mock-adapter';

import { client, resetRefreshStateForTests } from '../client';
import { useAuthStore } from '../../store/authStore';
import { onAuthLogout } from '../authEvents';

describe('api client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    resetRefreshStateForTests();
    useAuthStore.getState().clearSession();
  });

  afterEach(() => {
    mock.restore();
  });

  it('uses fallback URL and timeout', () => {
    expect(client.defaults.baseURL).toBe('http://localhost:3000/api/v1');
    expect(client.defaults.timeout).toBe(10_000);
  });

  it('rejects with a timeout error when a request exceeds the configured timeout', async () => {
    mock.onGet('/slow').timeoutOnce();

    await expect(client.get('/slow')).rejects.toMatchObject({ code: 'ECONNABORTED' });
  });

  it('attaches auth header when token exists', async () => {
    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'abc123');
    mock.onGet('/groups').reply((config) => [200, { authorization: config.headers?.Authorization }]);

    const response = await client.get('/groups');

    expect(response.data.authorization).toBe('Bearer abc123');
  });

  it('does not attach auth header when token is null', async () => {
    mock.onGet('/groups').reply((config) => [200, { authorization: config.headers?.Authorization ?? null }]);

    const response = await client.get('/groups');

    expect(response.data.authorization).toBeNull();
  });

  it('does not refresh non-401 errors', async () => {
    mock.onGet('/groups').reply(404);
    mock.onPost('/auth/refresh').reply(200, { accessToken: 'new-token' });

    await expect(client.get('/groups')).rejects.toMatchObject({ response: { status: 404 } });
    expect(mock.history.post).toHaveLength(0);
  });

  it('marks the session unverified on likely unverified-email 403 without logging out', async () => {
    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, `header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`);
    mock.onPost('/groups').reply(403, { message: 'Email verification required' });

    await expect(client.post('/groups', {})).rejects.toMatchObject({ response: { status: 403 } });

    expect(useAuthStore.getState()).toMatchObject({
      user: { id: '1', email: 'a@b.com' },
      isAuthenticated: true,
      emailVerified: false,
    });
  });

  it('does not mark the session unverified for unrelated already-verified 403 responses', async () => {
    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, `header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`);
    mock.onPost('/auth/email-verification/verify').reply(403, { message: 'Email already verified' });

    await expect(client.post('/auth/email-verification/verify', { token: 'used-token' })).rejects.toMatchObject({ response: { status: 403 } });

    expect(useAuthStore.getState()).toMatchObject({
      user: { id: '1', email: 'a@b.com' },
      isAuthenticated: true,
      emailVerified: true,
    });
  });

  it('refreshes token and retries a 401 once', async () => {
    mock.onGet('/groups').replyOnce(401);
    mock.onPost('/auth/refresh').reply(200, { accessToken: 'new-token' });
    mock.onGet('/groups').replyOnce((config) => [200, { authorization: config.headers?.Authorization }]);

    const response = await client.get('/groups');

    expect(response.status).toBe(200);
    expect(response.data.authorization).toBe('Bearer new-token');
  });

  it('clears session when refresh fails', async () => {
    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'old-token');
    mock.onGet('/groups').replyOnce(401);
    mock.onPost('/auth/refresh').reply(401);

    await expect(client.get('/groups')).rejects.toMatchObject({ response: { status: 401 } });
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null, isAuthenticated: false });
  });

  it('emits auth:logout when refresh fails', async () => {
    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'old-token');
    const logoutListener = jest.fn();
    const unsubscribe = onAuthLogout(logoutListener);
    mock.onGet('/groups').replyOnce(401);
    mock.onPost('/auth/refresh').reply(401);

    await expect(client.get('/groups')).rejects.toMatchObject({ response: { status: 401 } });

    expect(logoutListener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('shares one refresh request across concurrent 401 responses', async () => {
    mock.onGet(/\/groups\/\d/).replyOnce(401).onGet(/\/groups\/\d/).replyOnce(401).onGet(/\/groups\/\d/).replyOnce(401);
    mock.onPost('/auth/refresh').reply(200, { accessToken: 'shared-token' });
    mock.onGet(/\/groups\/\d/).reply(200, { ok: true });

    const responses = await Promise.all([client.get('/groups/1'), client.get('/groups/2'), client.get('/groups/3')]);

    expect(responses).toHaveLength(3);
    expect(mock.history.post.filter((request) => request.url === '/auth/refresh')).toHaveLength(1);
  });
});
