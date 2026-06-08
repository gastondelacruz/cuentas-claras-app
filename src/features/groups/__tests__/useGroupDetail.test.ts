import { renderHook } from '@testing-library/react-native';

import { useGroupDetail } from '../hooks/useGroupDetail';
import { useGroupsStore } from '../store/groupsStore';

describe('useGroupDetail', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
  });

  it('uses Spanish current member copy for newly created groups', () => {
    const createdGroup = useGroupsStore.getState().createGroup({
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

    const { result } = renderHook(() => useGroupDetail(createdGroup.id));

    expect(result.current.memberBalances[0]).toMatchObject({
      id: 'current-user',
      name: 'Vos',
      isCurrentUser: true,
    });
  });
});
