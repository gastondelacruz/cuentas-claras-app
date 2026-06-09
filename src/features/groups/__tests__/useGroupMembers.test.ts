import { buildGroupMembers } from '../hooks/useGroupMembers';
import { useGroupsStore } from '../store/groupsStore';

describe('buildGroupMembers', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
  });

  it('returns current user plus seeded group preview members', () => {
    const group = useGroupsStore.getState().groups.find((item) => item.id === 'group-1');

    const members = buildGroupMembers(group, { id: 'current-user', email: 'you@example.com' });

    expect(members.map((member) => member.name)).toEqual(['Vos', 'Alex', 'Sarah']);
    expect(members[0]).toMatchObject({ id: 'current-user', isCurrentUser: true });
    expect(members[1]).toMatchObject({ id: 'm1', isCurrentUser: false });
  });

  it('returns current user plus invited emails for user-created groups', () => {
    const group = useGroupsStore.getState().createGroup({
      name: 'Viaje a Mendoza',
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

    const members = buildGroupMembers(group, { id: 'current-user', email: 'you@example.com' });

    expect(members.map((member) => member.name)).toEqual(['Vos', 'friend@example.com']);
    expect(members[1]).toMatchObject({
      id: 'invite-0-friend@example.com',
      initials: 'F',
      isCurrentUser: false,
    });
  });

  it('falls back to only the current user when the group is missing', () => {
    const members = buildGroupMembers(undefined, null);

    expect(members).toEqual([
      {
        id: 'current-user',
        name: 'Vos',
        initials: 'YO',
        avatarUrl: null,
        isCurrentUser: true,
      },
    ]);
  });
});
