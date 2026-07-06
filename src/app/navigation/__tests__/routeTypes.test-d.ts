import { NavigationProp } from '@react-navigation/native';

import { RootStackParamList } from '../types';

declare const navigation: NavigationProp<RootStackParamList>;

navigation.navigate('GroupDetail', { groupId: 'group-1' });
navigation.navigate('NewGroup', { groupId: 'group-1' });
navigation.navigate('VerifyEmail', { token: 'verify-token' });
navigation.navigate('AcceptGroupInvitation', { token: 'invite-token' });

// @ts-expect-error unknown root routes must fail at compile time.
navigation.navigate('UnknownScreen');
