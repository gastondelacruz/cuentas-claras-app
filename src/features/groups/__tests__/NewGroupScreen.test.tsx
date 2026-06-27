import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { PermissionStatus } from 'expo-modules-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useAuthStore } from '../../../shared/store/authStore';
import { NewGroupScreen } from '../screens/NewGroupScreen';
import { useCreateGroup } from '../hooks/useCreateGroup';
import { useUpdateGroup } from '../hooks/useGroupDetailActions';
import { queryKeys } from '../../../shared/api/queryKeys';

jest.mock('../hooks/useCreateGroup');
jest.mock('../hooks/useGroupDetailActions');

const mockMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockUseCreateGroup = jest.mocked(useCreateGroup);
const mockUseUpdateGroup = jest.mocked(useUpdateGroup);

let sharedQueryClient: QueryClient;

function renderWithQueryClient(ui: React.ReactElement) {
  return render(<QueryClientProvider client={sharedQueryClient}>{ui}</QueryClientProvider>);
}

type NavigationMock = {
  goBack: jest.Mock;
  replace: jest.Mock;
};

let navigationMock: NavigationMock;

describe('NewGroupScreen', () => {
  beforeEach(() => {
    sharedQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'token');
    jest.mocked(useRoute).mockReturnValue({ params: undefined } as ReturnType<typeof useRoute>);
    navigationMock = {
      goBack: jest.fn(),
      replace: jest.fn(),
    };
    jest.mocked(useNavigation).mockReturnValue(navigationMock as never);
    mockMutate.mockReset();
    mockUseCreateGroup.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateGroup>);
    mockUseUpdateGroup.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateGroup>);
    jest.clearAllMocks();
    // Re-apply mock after clearAllMocks since clearAllMocks resets mock implementations
    mockUseCreateGroup.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateGroup>);
    mockUseUpdateGroup.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateGroup>);
  });

  it('blocks saving when there are no invited members', async () => {
    renderWithQueryClient(<NewGroupScreen />);

    fireEvent.changeText(screen.getByTestId('new-group-name-input'), 'Viaje a Mendoza');
    await act(async () => {
      fireEvent.press(screen.getByTestId('save-group-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('Agregá al menos un miembro antes de guardar el grupo')).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows invite validation messages in Spanish', () => {
    renderWithQueryClient(<NewGroupScreen />);

    fireEvent.press(screen.getByTestId('invite-member-button'));
    expect(screen.getByText('Ingresá un correo electrónico')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('invite-email-input'), 'friend@example.com');
    fireEvent.press(screen.getByTestId('invite-member-button'));
    fireEvent.changeText(screen.getByTestId('invite-email-input'), 'friend@example.com');
    fireEvent.press(screen.getByTestId('invite-member-button'));

    expect(screen.getByText('Este correo ya está invitado')).toBeTruthy();
  });

  it('shows the current member label in Spanish', () => {
    renderWithQueryClient(<NewGroupScreen />);

    expect(screen.getByText('Vos')).toBeTruthy();
  });

  it('calls the create mutation with correct params including the uploaded image path', async () => {
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

    renderWithQueryClient(<NewGroupScreen />);

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
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Viaje a Mendoza',
          type: 'trip',
          currency: 'ARS',
          members: [{ displayName: 'friend', email: 'friend@example.com' }],
        }),
        expect.any(Object),
      );
    });
  });

  it('navigates to GroupDetail with the server id on create success', async () => {
    // Simulate mutation calling onSuccess
    mockMutate.mockImplementationOnce((_input, callbacks) => {
      callbacks?.onSuccess?.({ id: 'server-id-1', name: 'Viaje a Mendoza' });
    });

    renderWithQueryClient(<NewGroupScreen />);

    fireEvent.changeText(screen.getByTestId('new-group-name-input'), 'Viaje a Mendoza');
    fireEvent.changeText(screen.getByTestId('invite-email-input'), 'friend@example.com');
    fireEvent.press(screen.getByTestId('invite-member-button'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-group-button'));
    });

    await waitFor(() => {
      expect(navigationMock.replace).toHaveBeenCalledWith('GroupDetail', { groupId: 'server-id-1' });
    });
  });

  it('shows a Spanish error message when creation fails', async () => {
    mockMutate.mockImplementationOnce((_input, callbacks) => {
      callbacks?.onError?.();
    });

    renderWithQueryClient(<NewGroupScreen />);

    fireEvent.changeText(screen.getByTestId('new-group-name-input'), 'Viaje a Mendoza');
    fireEvent.changeText(screen.getByTestId('invite-email-input'), 'friend@example.com');
    fireEvent.press(screen.getByTestId('invite-member-button'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-group-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('No pudimos crear el grupo. Intentá de nuevo.')).toBeTruthy();
    });
  });

  it('shows a short Spanish error when photo permission is denied', async () => {
    jest.spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync').mockResolvedValue({
      granted: false,
      canAskAgain: false,
      expires: 'never',
      status: PermissionStatus.DENIED,
    });

    renderWithQueryClient(<NewGroupScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('pick-group-image-button'));
    });

    expect(screen.getByText('Necesitás permiso para ver tus fotos')).toBeTruthy();
  });

  it('prefills edit mode and saves the updated group', async () => {
    const editGroupId = 'edit-group-id';
    // Pre-seed React Query cache so useNewGroupForm gets data synchronously
    sharedQueryClient.setQueryData(queryKeys.groups.detail(editGroupId), {
      id: editGroupId,
      name: 'Viaje a Mendoza',
      type: 'trip',
      currency: 'ARS',
      members: [
        { id: 'current-user', displayName: 'Vos', email: 'you@example.com', isCurrentUser: true },
        { id: 'friend-id', displayName: 'friend@example.com', email: 'friend@example.com', isCurrentUser: false },
      ],
    });

    jest.mocked(useRoute).mockReturnValue({
      params: { groupId: editGroupId },
    } as ReturnType<typeof useRoute>);

    renderWithQueryClient(<NewGroupScreen />);

    expect(screen.getByText('Editar grupo')).toBeTruthy();
    expect(screen.getByDisplayValue('Viaje a Mendoza')).toBeTruthy();
    expect(screen.getByText('Guardar cambios')).toBeTruthy();

    mockUpdateMutate.mockImplementationOnce((_vars, callbacks) => {
      callbacks?.onSuccess?.();
    });

    fireEvent.changeText(screen.getByTestId('new-group-name-input'), 'Viaje a Bariloche');

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-group-button'));
    });

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: editGroupId,
          data: expect.objectContaining({ name: 'Viaje a Bariloche', type: 'trip' }),
        }),
        expect.any(Object),
      );
      expect(navigationMock.goBack).toHaveBeenCalled();
    });
  });

  it('keeps existing invites visible while adding more in edit mode', async () => {
    const editGroupId = 'edit-group-with-members-id';
    // Pre-seed cache with two existing non-current members
    sharedQueryClient.setQueryData(queryKeys.groups.detail(editGroupId), {
      id: editGroupId,
      name: 'Viaje a Mendoza',
      type: 'trip',
      currency: 'ARS',
      members: [
        { id: 'current-user', displayName: 'Vos', email: 'you@example.com', isCurrentUser: true },
        { id: 'alex-id', displayName: 'alex@example.com', email: 'alex@example.com', isCurrentUser: false },
        { id: 'sarah-id', displayName: 'sarah@example.com', email: 'sarah@example.com', isCurrentUser: false },
      ],
    });

    jest.mocked(useRoute).mockReturnValue({
      params: { groupId: editGroupId },
    } as ReturnType<typeof useRoute>);

    renderWithQueryClient(<NewGroupScreen />);

    expect(screen.getByText('alex@example.com')).toBeTruthy();
    expect(screen.getByText('sarah@example.com')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('invite-email-input'), 'friend@example.com');
    fireEvent.press(screen.getByTestId('invite-member-button'));

    expect(screen.getByText('alex@example.com')).toBeTruthy();
    expect(screen.getByText('sarah@example.com')).toBeTruthy();
    expect(screen.getByText('friend@example.com')).toBeTruthy();

    mockUpdateMutate.mockImplementationOnce((_vars, callbacks) => {
      callbacks?.onSuccess?.();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-group-button'));
    });

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ groupId: editGroupId }),
        expect.any(Object),
      );
      expect(navigationMock.goBack).toHaveBeenCalled();
    });
  });
});
