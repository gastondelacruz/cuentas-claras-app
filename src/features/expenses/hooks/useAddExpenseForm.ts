import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { RootStackParamList } from '../../../app/navigation/types';
import { queryKeys } from '../../../shared/api/queryKeys';
import { useGroupMembers } from '../../groups/hooks/useGroupMembers';
import { ExpenseCategory } from '../../groups/types';
  import { useGroups } from '../../groups/hooks/useGroups';
import {
  createExpense,
  deleteExpense,
  updateExpense,
} from '../api/expensesApi';
import { SelectOption } from '../components/SelectModal';
import { useExpenseToEdit } from './useExpenseToEdit';
import { formatAmountForInput } from '../utils/formatAmountForInput';
import {
  NewExpenseFormInput,
  NewExpenseFormValues,
  newExpenseFormSchema,
} from '../schemas/new-expense-schema';

type AddExpenseNavigation = NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;
type AddExpenseRoute = RouteProp<RootStackParamList, 'AddExpense'>;

function buildCreatePayload(
  values: NewExpenseFormValues,
  options: {
    groupCurrency: string;
    paidById: string;
    participantIds: string[];
    category: ExpenseCategory;
    date: Date;
  },
) {
  return {
    title: values.description,
    amount: values.amount,
    currency: options.groupCurrency,
    paidByMemberId: options.paidById,
    participantMemberIds: options.participantIds,
    splitType: 'equal' as const,
    category: options.category,
    notes: null,
    expenseDate: options.date.toISOString(),
  };
}

export function useAddExpenseForm() {
  const navigation = useNavigation<AddExpenseNavigation>();
  const route = useRoute<AddExpenseRoute>();
  const queryClient = useQueryClient();

  const { data: groupsResponse, isLoading: isGroupsLoading } = useGroups();
  const groups = groupsResponse?.data ?? [];

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

  // groupId: prefer route params; fall back to first group once loaded
  const [groupId, setGroupId] = useState<string | undefined>(route.params?.groupId);
  const members = useGroupMembers(groupId);
  const currentUserId = members.find((member) => member.isCurrentUser)?.id ?? members[0]?.id;

  // Set default groupId from first group once the list loads (only if not coming from a route param)
  useEffect(() => {
    if (!route.params?.groupId && !groupId && groups.length > 0) {
      setGroupId(groups[0]?.id);
    }
  }, [groups, groupId, route.params?.groupId]);

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
  const [submitError, setSubmitError] = useState<string | undefined>();

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
      groups.map((group) => ({ id: group.id, label: group.name, sublabel: group.description ?? undefined })),
    [groups],
  );

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === groupId),
    [groupId, groups],
  );

  const paidByLabel =
    members.find((member) => member.id === paidById)?.name ?? 'Seleccioná quién pagó';
  const groupLabel =
    groups.find((group) => group.id === groupId)?.name ?? 'Seleccioná un grupo';
  const allParticipantsSelected =
    members.length > 0 && selectedParticipantIds.length === members.length;

  const createExpenseMutation = useMutation({
    mutationFn: ({ groupId: targetGroupId, input }: { groupId: string; input: ReturnType<typeof buildCreatePayload> }) =>
      createExpense(targetGroupId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.balances(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: () => {
      setSubmitError('No pudimos registrar el gasto. Intentá de nuevo.');
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ expenseId, input }: { expenseId: string; input: ReturnType<typeof buildCreatePayload> }) =>
      updateExpense(expenseId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.detail(variables.expenseId) });
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list(groupId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.balances(groupId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: (_data, expenseId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.detail(expenseId) });
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list(groupId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.balances(groupId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });

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

  function navigateAfterCreate(targetGroupId: string) {
    if (route.params?.groupId) {
      if (route.params.groupId !== targetGroupId) {
        navigation.popTo('GroupDetail', { groupId: targetGroupId });
        return;
      }
      navigation.goBack();
      return;
    }

    navigation.replace('GroupDetail', { groupId: targetGroupId });
  }

  function onSubmit(values: NewExpenseFormValues) {
    setSubmitError(undefined);

    if (!groupId) {
      setGroupError('Seleccioná un grupo para el gasto');
      return;
    }

    // Only reject "group not found" if the groups list has already loaded — avoids false negatives during loading
    if (!isGroupsLoading && !selectedGroup) {
      setGroupId(undefined);
      setGroupError('El grupo seleccionado ya no está disponible. Elegí otro grupo.');
      return;
    }

    setGroupError(undefined);

    const input = buildCreatePayload(values, {
      groupCurrency: 'ARS',
      paidById: paidById ?? currentUserId ?? '',
      participantIds: selectedParticipantIds,
      category: selectedCategory,
      date,
    });

    if (isEditing && expenseToEdit) {
      updateExpenseMutation.mutate(
        { expenseId: expenseToEdit.id, input },
        { onSuccess: () => navigation.goBack() },
      );
      return;
    }

    createExpenseMutation.mutate(
      { groupId, input },
      { onSuccess: () => navigateAfterCreate(groupId) },
    );
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
            deleteExpenseMutation.mutate(expenseToEdit.id, {
              onSuccess: () => navigation.goBack(),
            });
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
    isSubmitting:
      createExpenseMutation.isPending ||
      updateExpenseMutation.isPending ||
      deleteExpenseMutation.isPending,
    // group
    groupId,
    setGroupId,
    groupLabel,
    groupOptions,
    groupOpen,
    setGroupOpen,
    groupError,
    setGroupError,
    submitError,
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
