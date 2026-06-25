import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

import { RootStackParamList } from '../../../app/navigation/types';
import { useExpensesStore } from '../../expenses/store/expensesStore';
import { useGroupsStore } from '../store/groupsStore';

type GroupDetailNavigation = NativeStackNavigationProp<RootStackParamList>;

export function useGroupDetailActions(groupId: string) {
  const navigation = useNavigation<GroupDetailNavigation>();
  const deleteGroup = useGroupsStore((state) => state.deleteGroup);
  const deleteGroupExpenses = useExpensesStore((state) => state.deleteGroupExpenses);

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
            deleteGroup(groupId);
            deleteGroupExpenses(groupId);
            navigation.goBack();
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
    navigation.navigate('SettleDebts');
  }

  return { handleConfirmDelete, handleOpenSettings, handleOpenBalances };
}
