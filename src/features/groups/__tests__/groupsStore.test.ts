import { useGroupsStore } from '../store/groupsStore';

describe('useGroupsStore', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
  });

  it('rejects creating a group without invited members', () => {
    const initialGroupsCount = useGroupsStore.getState().groups.length;

    expect(() =>
      useGroupsStore.getState().createGroup({
        name: 'Casa',
        category: 'HOME',
        image: { type: 'default', uri: null },
        invitedEmails: [],
        owner: {
          id: 'current-user',
          name: 'Vos',
          email: 'you@example.com',
          initials: 'VO',
          avatarUrl: null,
        },
      }),
    ).toThrow('Agregá al menos un miembro antes de guardar el grupo');

    expect(useGroupsStore.getState().groups).toHaveLength(initialGroupsCount);
  });

  it('uses singular Spanish copy for one pending invite', () => {
    const createdGroup = useGroupsStore.getState().createGroup({
      name: 'Cena',
      category: 'FOOD',
      image: { type: 'default', uri: null },
      invitedEmails: ['friend@example.com'],
      owner: {
        id: 'current-user',
        name: 'Vos',
        email: 'you@example.com',
        initials: 'VO',
        avatarUrl: null,
      },
    });

    expect(createdGroup.description).toBe('1 invitación pendiente');
  });

  it('creates and persists a new group with default image and invited emails', () => {
    const createdGroup = useGroupsStore.getState().createGroup({
      name: 'Road Trip 2026',
      category: 'TRAVEL',
      image: { type: 'default', uri: null },
      invitedEmails: ['Friend@Example.com', 'pal@example.com'],
      owner: {
        id: 'current-user',
        name: 'Vos',
        email: 'you@example.com',
        initials: 'YO',
        avatarUrl: null,
      },
    });

    const persistedGroup = useGroupsStore.getState().groups[0];

    expect(createdGroup.id).toBe(persistedGroup.id);
    expect(persistedGroup).toMatchObject({
      name: 'Road Trip 2026',
      image: { type: 'default', uri: null },
      invitedEmails: ['friend@example.com', 'pal@example.com'],
      description: '2 invitaciones pendientes',
      balance: 0,
    });
  });
});
