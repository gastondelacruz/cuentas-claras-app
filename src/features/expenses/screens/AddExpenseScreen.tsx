import DateTimePicker from '@react-native-community/datetimepicker';
import { Check, ShoppingBag, Trash2, TrainFront, Utensils } from 'lucide-react-native';
import { CalendarDays, ChevronDown, Globe2 } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { Avatar } from '../../../shared/ui/Avatar';
import { InternalScreenHeader } from '../../../shared/ui/InternalScreenHeader';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer';
import { SelectModal } from '../components/SelectModal';
import { useAddExpenseForm } from '../hooks/useAddExpenseForm';
import { maskAmountInput } from '../utils/maskAmountInput';
import { ExpenseCategory } from '../../groups/types';

type Category = {
  label: string;
  Icon: typeof Utensils;
  value: ExpenseCategory;
};

const categories: Category[] = [
  { label: 'Comida', Icon: Utensils, value: 'FOOD' },
  { label: 'Compras', Icon: ShoppingBag, value: 'SHOPPING' },
  { label: 'Transporte', Icon: TrainFront, value: 'TRANSPORT' },
];

function formatExpenseDate(date: Date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function AddExpenseScreen() {
  const {
    control,
    handleSubmit,
    errors,
    isEditing,
    groupId,
    setGroupId,
    groupLabel,
    groupOptions,
    groupOpen,
    setGroupOpen,
    groupError,
    setGroupError,
    paidById,
    setPaidById,
    paidByLabel,
    paidByOptions,
    paidByOpen,
    setPaidByOpen,
    selectedCategory,
    setSelectedCategory,
    date,
    showDatePicker,
    setShowDatePicker,
    onDateChange,
    members,
    selectedParticipantIds,
    allParticipantsSelected,
    toggleParticipant,
    selectAllParticipants,
    onSubmit,
    onDelete,
  } = useAddExpenseForm();

  return (
    <ScreenContainer>
      <InternalScreenHeader title={isEditing ? 'Editar gasto' : 'Crear gasto'} />

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
                textAlignVertical: 'center',
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
                    fontVariant: ['tabular-nums'],
                    padding: 0,
                    includeFontPadding: false,
                    textAlignVertical: 'center',
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
                      ? 'h-12 flex-row items-center gap-3 rounded-full bg-green-400 px-5'
                      : 'h-12 flex-row items-center gap-3 rounded-full bg-neutral200 px-5'
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
            disabled={isEditing}
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
                    ? 'text-base font-semibold text-neutral500'
                    : 'text-base font-semibold text-primary'
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
                  accessibilityLabel={`${member.name}, ${checked ? 'incluido en el gasto' : 'excluido del gasto'}`}
                  className={
                    checked
                      ? 'h-24 flex-row items-center gap-4 rounded-lg border border-primary/35 bg-white px-5'
                      : 'h-24 flex-row items-center gap-4 rounded-lg border border-neutral200 bg-white px-5'
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
                      {checked ? 'Incluido en el gasto' : 'Excluido del gasto'}
                    </Text>
                  </View>
                  <View
                    className={
                      checked
                        ? 'h-8 w-8 items-center justify-center rounded-md bg-primary'
                        : 'h-8 w-8 items-center justify-center rounded-md border-2 border-neutral200 bg-white'
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
          accessibilityLabel={isEditing ? 'Guardar cambios' : 'Crear gasto'}
          className="mt-2 h-20 items-center justify-center rounded-lg bg-green-400"
          onPress={handleSubmit(onSubmit)}
          testID="create-expense-button"
        >
          <Text className="text-xl font-bold text-neutral900">
            {isEditing ? 'Guardar cambios' : 'Crear Gasto'}
          </Text>
        </Pressable>

        {isEditing ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Eliminar gasto"
            className="h-16 flex-row items-center justify-center gap-3 rounded-lg border border-error bg-white"
            onPress={onDelete}
            testID="delete-expense-button"
          >
            <Trash2 color={colors.error} size={22} strokeWidth={2.4} />
            <Text className="text-lg font-bold text-error">Eliminar gasto</Text>
          </Pressable>
        ) : null}
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
  icon: 'chevron' | 'group' | 'calendar';
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

function FieldButton({ label, value, icon, onPress, disabled = false, testID }: FieldButtonProps) {
  return (
    <View className="gap-3">
      <Text className="text-lg text-neutral900">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        className={
          disabled
            ? 'h-16 flex-row items-center rounded-lg border border-neutral200 bg-neutral200/40 px-5'
            : 'h-16 flex-row items-center rounded-lg border border-primary/35 bg-white px-5'
        }
        onPress={onPress}
        testID={testID}
      >
        <Text className="flex-1 text-lg text-neutral900">{value}</Text>
        {icon === 'chevron' ? (
          <ChevronDown color={colors.neutral900} size={24} strokeWidth={2.4} />
        ) : null}
        {icon === 'group' ? (
          <Globe2 color={colors.neutral900} size={24} strokeWidth={2.4} />
        ) : null}
        {icon === 'calendar' ? (
          <CalendarDays color={colors.neutral900} size={24} strokeWidth={2.4} />
        ) : null}
      </Pressable>
    </View>
  );
}
