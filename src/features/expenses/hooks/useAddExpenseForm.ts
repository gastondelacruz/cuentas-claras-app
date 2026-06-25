import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { RootStackParamList } from '../../../app/navigation/types';
import { useGroupMembers } from '../../groups/hooks/useGroupMembers';
import { ExpenseCategory } from '../../groups/types';
import { useGroupsStore } from '../../groups/store/groupsStore';
import { SelectOption } from '../components/SelectModal';
import { useExpenseToEdit } from './useExpenseToEdit';
import { useExpensesStore } from '../store/expensesStore';
import { buildGroupExpense } from '../utils/buildGroupExpense';
import { formatAmountForInput } from '../utils/formatAmountForInput';
import {
  NewExpenseFormInput,
  NewExpenseFormValues,
  newExpenseFormSchema,
} from '../schemas/new-expense-schema';

type AddExpenseNavigation = NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;
type AddExpenseRoute = RouteProp<RootStackParamList, 'AddExpense'>;

export function useAddExpenseForm() {
  const navigation = useNavigation<AddExpenseNavigation>();
  const route = useRoute<AddExpenseRoute>();

  const deletedGroupIds = useGroupsStore((state) => state.deletedGroupIds);
  const groups = useGroupsStore((state) => state.groups);
  const addExpense = useExpensesStore((state) => state.addExpense);
  const updateExpense = useExpensesStore((state) => state.updateExpense);
  const deleteExpense = useExpensesStore((state) => state.deleteExpense);

  const expenseToEdit = useExpenseToEdit(route.params?.groupId, route.params?.expenseId);
  const isEditing = Boolean(expenseToEdit);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewExpenseFormInput, unknown, NewExpenseFormValues>({
    resolver: zodResolver(newExpenseFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      amount: expenseToEdit ? formatAmountForInput(expenseToEdit.totalAmount) : '',
      description: expenseToEdit?.title ?? '',
    },
  });

  const [groupId, setGroupId] = useState<string | undefined>(
    route.params?.groupId ?? groups[0]?.id,
  );
  const members = useGroupMembers(groupId);
  const currentUserId = members.find((member) => member.isCurrentUser)?.id ?? members[0]?.id;

  const [paidById, setPaidById] = useState<string | undefined>(
    expenseToEdit?.paidById ?? currentUserId,
  );
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(
    expenseToEdit?.category ?? 'FOOD',
  );
  const [date, setDate] = useState<Date>(() =>
    expenseToEdit ? new Date(expenseToEdit.date) : new Date(),
  );
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(() =>
    expenseToEdit ? expenseToEdit.participantIds : members.map((member) => member.id),
  );
  const [paidByOpen, setPaidByOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [groupError, setGroupError] = useState<string | undefined>();

  const skipMemberSync = useRef(isEditing);

  useEffect(() => {
    if (skipMemberSync.current) {
      skipMemberSync.current = false;
      return;
    }

    setSelectedParticipantIds(members.map((member) => member.id));
    setPaidById(members.find((member) => member.isCurrentUser)?.id ?? members[0]?.id);
  }, [members]);

  const paidByOptions = useMemo<SelectOption[]>(
    () => members.map((member) => ({ id: member.id, label: member.name })),
    [members],
  );

  const groupOptions = useMemo<SelectOption[]>(
    () =>
      groups.map((group) => ({ id: group.id, label: group.name, sublabel: group.description })),
    [groups],
  );

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === groupId),
    [groupId, groups],
  );

  const paidByLabel =
    members.find((member) => member.id === paidById)?.name ?? "Seleccioná quién pagó";
  const groupLabel =
    groups.find((group) => group.id === groupId)?.name ?? 'Seleccioná un grupo';
  const allParticipantsSelected =
    members.length > 0 && selectedParticipantIds.length === members.length;

  function toggleParticipant(id: string) {
    setSelectedParticipantIds((current) => {
      if (current.includes(id)) {
        if (current.length === 1) return current;
        return current.filter((participantId) => participantId !== id);
      }
      return [...current, id];
    });
  }

  function selectAllParticipants() {
    setSelectedParticipantIds(members.map((member) => member.id));
  }

  function onDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  }

  function onSubmit(values: NewExpenseFormValues) {
    if (!groupId) {
      setGroupError('Seleccioná un grupo para el gasto');
      return;
    }

    if (!selectedGroup || deletedGroupIds.includes(groupId)) {
      setGroupId(undefined);
      setGroupError('El grupo seleccionado ya no está disponible. Elegí otro grupo.');
      return;
    }

    setGroupError(undefined);

    const expense = buildGroupExpense({
      id: expenseToEdit?.id,
      amount: values.amount,
      description: values.description,
      category: selectedCategory,
      date,
      paidById: paidById ?? currentUserId ?? '',
      participantIds: selectedParticipantIds,
      participants: members,
      currentUserId: currentUserId ?? '',
      now: new Date(),
    });

    if (isEditing) {
      updateExpense(groupId, expense);
      navigation.goBack();
      return;
    }

    addExpense(groupId, expense);
    if (route.params?.groupId) {
      if (route.params.groupId !== groupId) {
        navigation.popTo('GroupDetail', { groupId });
        return;
      }
      navigation.goBack();
      return;
    }

    navigation.replace('GroupDetail', { groupId });
  }

  function onDelete() {
    if (!expenseToEdit || !groupId) return;

    Alert.alert(
      'Eliminar gasto',
      '¿Seguro que querés eliminar este gasto? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteExpense(groupId, expenseToEdit.id);
            navigation.goBack();
          },
        },
      ],
    );
  }

  return {
    // form
    control,
    handleSubmit,
    errors,
    // state flags
    isEditing,
    // group
    groupId,
    setGroupId,
    groupLabel,
    groupOptions,
    groupOpen,
    setGroupOpen,
    groupError,
    setGroupError,
    // paid by
    paidById,
    setPaidById,
    paidByLabel,
    paidByOptions,
    paidByOpen,
    setPaidByOpen,
    // category
    selectedCategory,
    setSelectedCategory,
    // date
    date,
    showDatePicker,
    setShowDatePicker,
    onDateChange,
    // participants
    members,
    selectedParticipantIds,
    allParticipantsSelected,
    toggleParticipant,
    selectAllParticipants,
    // actions
    onSubmit,
    onDelete,
  };
}
