import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Check, ShoppingBag, TrainFront, Utensils } from "lucide-react-native";
import { CalendarDays, ChevronDown, Globe2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { RootStackParamList } from "../../../app/navigation/types";
import { useGroupMembers } from "../../groups/hooks/useGroupMembers";
import { ExpenseCategory } from "../../groups/types";
import { useGroupsStore } from "../../groups/store/groupsStore";
import { colors } from "../../../shared/theme/colors";
import { Avatar } from "../../../shared/ui/Avatar";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { SelectModal, SelectOption } from "../components/SelectModal";
import { useExpensesStore } from "../store/expensesStore";
import { buildGroupExpense } from "../utils/buildGroupExpense";
import { maskAmountInput } from "../utils/maskAmountInput";
import {
  NewExpenseFormInput,
  NewExpenseFormValues,
  newExpenseFormSchema,
} from "../schemas/new-expense-schema";

type Category = {
  label: string;
  Icon: typeof Utensils;
  value: ExpenseCategory;
};

type AddExpenseNavigation = NativeStackNavigationProp<RootStackParamList, "AddExpense">;
type AddExpenseRoute = RouteProp<RootStackParamList, "AddExpense">;

const categories: Category[] = [
  { label: "Comida", Icon: Utensils, value: "FOOD" },
  { label: "Compras", Icon: ShoppingBag, value: "SHOPPING" },
  { label: "Transporte", Icon: TrainFront, value: "TRANSPORT" },
];

function formatExpenseDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function AddExpenseScreen() {
  const navigation = useNavigation<AddExpenseNavigation>();
  const route = useRoute<AddExpenseRoute>();
  const groups = useGroupsStore((state) => state.groups);
  const addExpense = useExpensesStore((state) => state.addExpense);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewExpenseFormInput, unknown, NewExpenseFormValues>({
    resolver: zodResolver(newExpenseFormSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: { amount: "", description: "" },
  });

  const [groupId, setGroupId] = useState<string | undefined>(route.params?.groupId ?? groups[0]?.id);
  const members = useGroupMembers(groupId);
  const currentUserId = members.find((member) => member.isCurrentUser)?.id ?? members[0]?.id;

  const [paidById, setPaidById] = useState<string | undefined>(currentUserId);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>("FOOD");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(() =>
    members.map((member) => member.id),
  );
  const [paidByOpen, setPaidByOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [groupError, setGroupError] = useState<string | undefined>();

  // When the selected group changes, reset participants/payer to its members.
  useEffect(() => {
    setSelectedParticipantIds(members.map((member) => member.id));
    setPaidById(members.find((member) => member.isCurrentUser)?.id ?? members[0]?.id);
  }, [members]);

  const paidByOptions = useMemo<SelectOption[]>(
    () => members.map((member) => ({ id: member.id, label: member.name })),
    [members],
  );

  const groupOptions = useMemo<SelectOption[]>(
    () => groups.map((group) => ({ id: group.id, label: group.name, sublabel: group.description })),
    [groups],
  );

  const paidByLabel = members.find((member) => member.id === paidById)?.name ?? "Seleccioná quién pagó";
  const groupLabel = groups.find((group) => group.id === groupId)?.name ?? "Seleccioná un grupo";
  const allParticipantsSelected =
    members.length > 0 && selectedParticipantIds.length === members.length;

  const toggleParticipant = (id: string) => {
    setSelectedParticipantIds((current) => {
      if (current.includes(id)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((participantId) => participantId !== id);
      }

      return [...current, id];
    });
  };

  const selectAllParticipants = () => {
    setSelectedParticipantIds(members.map((member) => member.id));
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  const onSubmit = (values: NewExpenseFormValues) => {
    if (!groupId) {
      setGroupError("Seleccioná un grupo para el gasto");
      return;
    }

    setGroupError(undefined);

    const expense = buildGroupExpense({
      amount: values.amount,
      description: values.description,
      category: selectedCategory,
      date,
      paidById: paidById ?? currentUserId ?? "",
      participantIds: selectedParticipantIds,
      participants: members,
      currentUserId: currentUserId ?? "",
      now: new Date(),
    });

    addExpense(groupId, expense);
    navigation.replace("GroupDetail", { groupId });
  };

  return (
    <ScreenContainer>
      <InternalScreenHeader title="Crear gasto" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-5 pb-8 pt-10"
      >
        <View className="items-center gap-1">
          <View className="flex-row items-center justify-center gap-3">
            <Text
              className="font-light text-neutral900"
              style={{
                fontSize: 48,
                lineHeight: 60,
                includeFontPadding: false,
                padding: 0,
                textAlignVertical: "center",
              }}
            >
              $
            </Text>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <TextInput
                  accessibilityLabel="Monto del gasto"
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                  placeholderTextColor={colors.neutral500}
                  className="font-light text-neutral900"
                  style={{
                    fontSize: 48,
                    lineHeight: 60,
                    height: 60,
                    fontVariant: ["tabular-nums"],
                    padding: 0,
                    includeFontPadding: false,
                    textAlignVertical: "center",
                  }}
                  onBlur={field.onBlur}
                  onChangeText={(value) => field.onChange(maskAmountInput(value))}
                  value={field.value}
                  testID="expense-amount-input"
                />
              )}
            />
          </View>
          {errors.amount ? (
            <Text accessibilityLiveRegion="polite" selectable className="text-sm text-error">
              {errors.amount.message}
            </Text>
          ) : null}
        </View>

        <View className="gap-3">
          <Text className="text-lg text-neutral900">Descripción</Text>
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  accessibilityLabel="Descripción del gasto"
                  placeholder="¿En qué lo gastaste?"
                  placeholderTextColor={colors.neutral500}
                  className="h-16 rounded-lg border border-primary/35 bg-white px-5 text-lg text-neutral900"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  value={field.value}
                  testID="expense-description-input"
                />
                {fieldState.error ? (
                  <Text accessibilityLiveRegion="polite" selectable className="text-sm text-error">
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </>
            )}
          />
        </View>

        <View className="gap-4">
          <Text className="text-xl font-bold text-neutral900">Categoría</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-4"
          >
            {categories.map(({ label, Icon, value }) => {
              const selected = value === selectedCategory;

              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`Categoría ${label}`}
                  accessibilityState={{ selected }}
                  className={
                    selected
                      ? "h-12 flex-row items-center gap-3 rounded-full bg-green-400 px-5"
                      : "h-12 flex-row items-center gap-3 rounded-full bg-neutral200 px-5"
                  }
                  onPress={() => setSelectedCategory(value)}
                  testID={`expense-category-${value}`}
                >
                  <Icon color={colors.neutral900} size={22} strokeWidth={2.4} />
                  <Text className="text-base text-neutral900">{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="gap-4">
          <FieldButton
            label="Pagado por"
            value={paidByLabel}
            icon="chevron"
            onPress={() => setPaidByOpen(true)}
            testID="expense-paidby-field"
          />
          <FieldButton
            label="Grupo / Viaje"
            value={groupLabel}
            icon="group"
            onPress={() => setGroupOpen(true)}
            testID="expense-group-field"
          />
          <FieldButton
            label="Fecha"
            value={formatExpenseDate(date)}
            icon="calendar"
            onPress={() => setShowDatePicker(true)}
            testID="expense-date-field"
          />
          {groupError ? (
            <Text accessibilityLiveRegion="polite" selectable className="text-sm text-error">
              {groupError}
            </Text>
          ) : null}
        </View>

        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-neutral900">Participantes</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Seleccionar todos los participantes"
              accessibilityState={{ disabled: allParticipantsSelected }}
              disabled={allParticipantsSelected}
              onPress={selectAllParticipants}
              testID="expense-select-all"
            >
              <Text
                className={
                  allParticipantsSelected
                    ? "text-base font-semibold text-neutral500"
                    : "text-base font-semibold text-primary"
                }
              >
                Seleccionar todos
              </Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {members.map((member) => {
              const checked = selectedParticipantIds.includes(member.id);

              return (
                <Pressable
                  key={member.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  accessibilityLabel={`${member.name}, ${checked ? "incluido en el gasto" : "excluido del gasto"}`}
                  className={
                    checked
                      ? "h-24 flex-row items-center gap-4 rounded-lg border border-primary/35 bg-white px-5"
                      : "h-24 flex-row items-center gap-4 rounded-lg border border-neutral200 bg-white px-5"
                  }
                  onPress={() => toggleParticipant(member.id)}
                  testID={`expense-participant-${member.id}`}
                >
                  <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/20">
                    <Avatar
                      name={member.name}
                      initials={member.initials}
                      sourceUrl={member.avatarUrl ?? undefined}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-neutral900">{member.name}</Text>
                    <Text className="text-sm text-neutral900">
                      {checked ? "Incluido en el gasto" : "Excluido del gasto"}
                    </Text>
                  </View>
                  <View
                    className={
                      checked
                        ? "h-8 w-8 items-center justify-center rounded-md bg-primary"
                        : "h-8 w-8 items-center justify-center rounded-md border-2 border-neutral200 bg-white"
                    }
                  >
                    {checked ? <Check color={colors.white} size={22} strokeWidth={3} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Crear gasto"
          className="mt-2 h-20 items-center justify-center rounded-lg bg-green-400"
          onPress={handleSubmit(onSubmit)}
          testID="create-expense-button"
        >
          <Text className="text-xl font-bold text-neutral900">Crear Gasto</Text>
        </Pressable>
      </ScrollView>

      <SelectModal
        visible={paidByOpen}
        title="¿Quién pagó?"
        options={paidByOptions}
        selectedId={paidById}
        onSelect={(id) => {
          setPaidById(id);
          setPaidByOpen(false);
        }}
        onClose={() => setPaidByOpen(false)}
        testID="expense-paidby-modal"
      />

      <SelectModal
        visible={groupOpen}
        title="Seleccioná un grupo"
        options={groupOptions}
        selectedId={groupId}
        onSelect={(id) => {
          setGroupId(id);
          setGroupOpen(false);
          setGroupError(undefined);
        }}
        onClose={() => setGroupOpen(false)}
        testID="expense-group-modal"
      />

      {showDatePicker ? (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={onDateChange}
          testID="expense-date-picker"
        />
      ) : null}
    </ScreenContainer>
  );
}

type FieldButtonProps = {
  label: string;
  value: string;
  icon: "chevron" | "group" | "calendar";
  onPress: () => void;
  testID?: string;
};

function FieldButton({ label, value, icon, onPress, testID }: FieldButtonProps) {
  return (
    <View className="gap-3">
      <Text className="text-lg text-neutral900">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        className="h-16 flex-row items-center rounded-lg border border-primary/35 bg-white px-5"
        onPress={onPress}
        testID={testID}
      >
        <Text className="flex-1 text-lg text-neutral900">{value}</Text>
        {icon === "chevron" ? (
          <ChevronDown color={colors.neutral900} size={24} strokeWidth={2.4} />
        ) : null}
        {icon === "group" ? (
          <Globe2 color={colors.neutral900} size={24} strokeWidth={2.4} />
        ) : null}
        {icon === "calendar" ? (
          <CalendarDays color={colors.neutral900} size={24} strokeWidth={2.4} />
        ) : null}
      </Pressable>
    </View>
  );
}
