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

  it('updates a created group and preserves its identity', () => {
    const createdGroup = useGroupsStore.getState().createGroup({
      name: 'Road Trip 2026',
      category: 'TRAVEL',
      image: { type: 'default', uri: null },
      invitedEmails: ['friend@example.com'],
      owner: {
        id: 'current-user',
        name: 'Vos',
        email: 'you@example.com',
        initials: 'YO',
        avatarUrl: null,
      },
    });

    const updatedGroup = useGroupsStore.getState().updateGroup({
      groupId: createdGroup.id,
      name: 'Road Trip 2027',
      category: 'EVENT',
      image: { type: 'uploaded', uri: 'file:///updated.jpg' },
      invitedEmails: ['pal@example.com'],
      owner: {
        id: 'current-user',
        name: 'Vos',
        email: 'you@example.com',
        initials: 'YO',
        avatarUrl: null,
      },
    });

    expect(updatedGroup).toMatchObject({
      id: createdGroup.id,
      name: 'Road Trip 2027',
      category: 'EVENT',
      image: { type: 'uploaded', uri: 'file:///updated.jpg' },
      invitedEmails: ['pal@example.com'],
      description: '1 invitación pendiente',
    });
    expect(useGroupsStore.getState().groups.find((group) => group.id === createdGroup.id)).toMatchObject({
      name: 'Road Trip 2027',
      invitedEmails: ['pal@example.com'],
    });
  });

  it('updates seeded group previews and restores mock members when invites change', () => {
    const updatedSeededGroup = useGroupsStore.getState().updateGroup({
      groupId: 'group-2',
      name: 'Departamento editado',
      category: 'HOME',
      image: { type: 'default', uri: null },
      invitedEmails: ['pal@example.com', 'ana@example.com'],
      owner: {
        id: 'current-user',
        name: 'Vos',
        email: 'you@example.com',
        initials: 'YO',
        avatarUrl: null,
      },
    });

    expect(updatedSeededGroup).toMatchObject({
      id: 'group-2',
      name: 'Departamento editado',
      invitedEmails: ['pal@example.com', 'ana@example.com'],
      description: '2 invitaciones pendientes',
      members: [
        { id: 'm3', name: 'Diego' },
        { id: 'm4', name: 'Lucía' },
        { id: 'invite-0-pal@example.com', name: 'pal@example.com' },
      ],
      extraMembersCount: 1,
    });

    const restoredSeededGroup = useGroupsStore.getState().updateGroup({
      groupId: 'group-2',
      name: 'Departamento editado',
      category: 'HOME',
      image: { type: 'default', uri: null },
      invitedEmails: [],
      owner: {
        id: 'current-user',
        name: 'Vos',
        email: 'you@example.com',
        initials: 'YO',
        avatarUrl: null,
      },
    });

    expect(restoredSeededGroup).toMatchObject({
      id: 'group-2',
      invitedEmails: [],
      description: 'Alquiler, servicios y gastos compartidos',
      members: [
        { id: 'm3', name: 'Diego' },
        { id: 'm4', name: 'Lucía' },
      ],
      extraMembersCount: 0,
    });
  });

  it('deletes a group by id and keeps a deletion tombstone', () => {
    useGroupsStore.getState().deleteGroup('group-1');

    expect(useGroupsStore.getState().groups.find((group) => group.id === 'group-1')).toBeUndefined();
    expect(useGroupsStore.getState().deletedGroupIds).toContain('group-1');
  });
});
