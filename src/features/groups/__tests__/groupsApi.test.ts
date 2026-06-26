import { client } from '../../../shared/api/client';
import { createGroup, getGroups } from '../api/groupsApi';

jest.mock('../../../shared/api/client', () => ({
  client: { post: jest.fn(), get: jest.fn() },
}));

const mockPost = jest.mocked(client.post);
const mockGet = jest.mocked(client.get);

describe('groupsApi.createGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts to /v1/groups with the correct body', async () => {
    mockPost.mockResolvedValueOnce({
      data: { id: 'server-id-1', name: 'Viaje a Mendoza', type: 'trip', currency: 'ARS' },
    });

    await createGroup({
      name: 'Viaje a Mendoza',
      type: 'trip',
      currency: 'ARS',
      members: [{ displayName: 'friend', email: 'friend@example.com' }],
    });

    expect(mockPost).toHaveBeenCalledWith('/v1/groups', {
      name: 'Viaje a Mendoza',
      type: 'trip',
      currency: 'ARS',
      members: [{ displayName: 'friend', email: 'friend@example.com' }],
    });
  });

  it('returns the response data from the server', async () => {
    const serverResponse = {
      id: 'server-id-1',
      name: 'Viaje a Mendoza',
      type: 'trip',
      currency: 'ARS',
      members: [],
    };
    mockPost.mockResolvedValueOnce({ data: serverResponse });

    const result = await createGroup({
      name: 'Viaje a Mendoza',
      type: 'trip',
      currency: 'ARS',
      members: [],
    });

    expect(result).toEqual(serverResponse);
  });

  it('maps FOOD category to other type', async () => {
    mockPost.mockResolvedValueOnce({
      data: { id: 'server-id-2', name: 'Cenas del mes', type: 'other', currency: 'ARS' },
    });

    await createGroup({
      name: 'Cenas del mes',
      type: 'other',
      currency: 'ARS',
      members: [],
    });

    expect(mockPost).toHaveBeenCalledWith('/v1/groups', expect.objectContaining({ type: 'other' }));
  });

  it('propagates errors from the HTTP client', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      createGroup({ name: 'Test', type: 'trip', currency: 'ARS', members: [] }),
    ).rejects.toThrow('Network error');
  });
});

describe('groupsApi.getGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls GET /v1/groups', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [] } });

    await getGroups();

    expect(mockGet).toHaveBeenCalledWith('/v1/groups');
  });

  it('returns the response data envelope', async () => {
    const groups = [
      { id: 'g1', name: 'Test', description: null, currency: 'ARS', createdAt: '2026-06-26T00:00:00.000Z', updatedAt: '2026-06-26T00:00:00.000Z' },
    ];
    mockGet.mockResolvedValueOnce({ data: { data: groups } });

    const result = await getGroups();

    expect(result).toEqual({ data: groups });
  });

  it('propagates errors from the HTTP client', async () => {
    mockGet.mockRejectedValueOnce(new Error('Unauthorized'));

    await expect(getGroups()).rejects.toThrow('Unauthorized');
  });
});
