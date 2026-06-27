import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { RootStackParamList } from '../../../app/navigation/types';
import { queryKeys } from '../../../shared/api/queryKeys';
import { deleteGroup, updateGroup } from '../api/groupsApi';
import { GroupDetailDto } from '../schemas/groupSchema';

type GroupDetailNavigation = NativeStackNavigationProp<RootStackParamList>;

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: Partial<GroupDetailDto> }) =>
      updateGroup(groupId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
    },
  });
}

export function useGroupDetailActions(groupId: string) {
  const navigation = useNavigation<GroupDetailNavigation>();
  const deleteGroupMutation = useDeleteGroup();

  function handleConfirmDelete() {
    Alert.alert(
      'Eliminar grupo',
      '¿Seguro que querés eliminar este grupo? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteGroupMutation.mutate(groupId, {
              onSuccess: () => navigation.goBack(),
            });
          },
        },
      ],
    );
  }

  function handleOpenSettings() {
    Alert.alert('Opciones del grupo', 'Elegí qué querés hacer con este grupo.', [
      {
        text: 'Editar grupo',
        onPress: () => navigation.navigate('NewGroup', { groupId }),
      },
      {
        text: 'Eliminar grupo',
        style: 'destructive',
        onPress: handleConfirmDelete,
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function handleOpenBalances() {
    navigation.navigate('SettleDebts', { groupId });
  }

  return { handleConfirmDelete, handleOpenSettings, handleOpenBalances };
}
