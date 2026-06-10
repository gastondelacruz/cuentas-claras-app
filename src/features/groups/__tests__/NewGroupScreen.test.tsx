import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { PermissionStatus } from 'expo-modules-core';

import { useAuthStore } from '../../../shared/store/authStore';
import { NewGroupScreen } from '../screens/NewGroupScreen';
import { useGroupsStore } from '../store/groupsStore';

type NavigationMock = {
  goBack: jest.Mock;
  replace: jest.Mock;
};

let navigationMock: NavigationMock;

describe('NewGroupScreen', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'token');
    jest.mocked(useRoute).mockReturnValue({ params: undefined } as ReturnType<typeof useRoute>);
    navigationMock = {
      goBack: jest.fn(),
      replace: jest.fn(),
    };
    jest.mocked(useNavigation).mockReturnValue(navigationMock as never);
    jest.clearAllMocks();
  });

  it('blocks saving when there are no invited members', async () => {
    const initialGroupsCount = useGroupsStore.getState().groups.length;

    render(<NewGroupScreen />);

    fireEvent.changeText(screen.getByTestId('new-group-name-input'), 'Viaje a Mendoza');
    await act(async () => {
      fireEvent.press(screen.getByTestId('save-group-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('Agregá al menos un miembro antes de guardar el grupo')).toBeTruthy();
      expect(useGroupsStore.getState().groups).toHaveLength(initialGroupsCount);
    });
  });

  it('shows invite validation messages in Spanish', () => {
    render(<NewGroupScreen />);

    fireEvent.press(screen.getByTestId('invite-member-button'));
    expect(screen.getByText('Ingresá un correo electrónico')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('invite-email-input'), 'friend@example.com');
    fireEvent.press(screen.getByTestId('invite-member-button'));
    fireEvent.changeText(screen.getByTestId('invite-email-input'), 'friend@example.com');
    fireEvent.press(screen.getByTestId('invite-member-button'));

    expect(screen.getByText('Este correo ya está invitado')).toBeTruthy();
  });

  it('shows the current member label in Spanish', () => {
    render(<NewGroupScreen />);

    expect(screen.getByText('Vos')).toBeTruthy();
  });

  it('saves the selected uploaded image when creating a group', async () => {
    jest.spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync').mockResolvedValue({
      granted: true,
      canAskAgain: true,
      expires: 'never',
      status: PermissionStatus.GRANTED,
    });
    jest.spyOn(ImagePicker, 'launchImageLibraryAsync').mockResolvedValue({
      canceled: false,
      assets: [
        {
          assetId: 'asset-1',
          base64: null,
          duration: null,
          exif: null,
          fileName: 'group.jpg',
          fileSize: 123,
          height: 400,
          mimeType: 'image/jpeg',
          pairedVideoAsset: null,
          type: 'image',
          uri: 'file:///group.jpg',
          width: 400,
        },
      ],
    });

    render(<NewGroupScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('pick-group-image-button'));
    });

    fireEvent.changeText(screen.getByTestId('new-group-name-input'), 'Viaje a Mendoza');
    fireEvent.changeText(screen.getByTestId('invite-email-input'), 'friend@example.com');
    fireEvent.press(screen.getByTestId('invite-member-button'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-group-button'));
    });

    await waitFor(() => {
      expect(useGroupsStore.getState().groups[0]?.image).toEqual({
        type: 'uploaded',
        uri: 'file:///group.jpg',
      });
    });
  });

  it('shows a short Spanish error when photo permission is denied', async () => {
    jest.spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync').mockResolvedValue({
      granted: false,
      canAskAgain: false,
      expires: 'never',
      status: PermissionStatus.DENIED,
    });

    render(<NewGroupScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('pick-group-image-button'));
    });

    expect(screen.getByText('Necesitás permiso para ver tus fotos')).toBeTruthy();
  });

  it('prefills edit mode and saves the updated group', async () => {
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

    jest.mocked(useRoute).mockReturnValue({
      params: { groupId: createdGroup.id },
    } as ReturnType<typeof useRoute>);

    render(<NewGroupScreen />);

    expect(screen.getByText('Editar grupo')).toBeTruthy();
    expect(screen.getByDisplayValue('Viaje a Mendoza')).toBeTruthy();
    expect(screen.getByText('Guardar cambios')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('new-group-name-input'), 'Viaje a Bariloche');

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-group-button'));
    });

    await waitFor(() => {
      expect(useGroupsStore.getState().groups.find((group) => group.id === createdGroup.id)?.name).toBe(
        'Viaje a Bariloche',
      );
      expect(navigationMock.goBack).toHaveBeenCalled();
    });
  });

  it('keeps seeded members visible while adding invites in edit mode', async () => {
    jest.mocked(useRoute).mockReturnValue({
      params: { groupId: 'group-1' },
    } as ReturnType<typeof useRoute>);

    render(<NewGroupScreen />);

    expect(screen.getByText('Alex')).toBeTruthy();
    expect(screen.getByText('Sarah')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('invite-email-input'), 'friend@example.com');
    fireEvent.press(screen.getByTestId('invite-member-button'));

    expect(screen.getByText('Alex')).toBeTruthy();
    expect(screen.getByText('Sarah')).toBeTruthy();
    expect(screen.getByText('friend@example.com')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-group-button'));
    });

    await waitFor(() => {
      expect(useGroupsStore.getState().groups.find((group) => group.id === 'group-1')).toMatchObject({
        invitedEmails: ['friend@example.com'],
        members: [
          { id: 'm1', name: 'Alex' },
          { id: 'm2', name: 'Sarah' },
          { id: 'invite-0-friend@example.com', name: 'friend@example.com' },
        ],
        extraMembersCount: 2,
      });
      expect(navigationMock.goBack).toHaveBeenCalled();
    });
  });
});
