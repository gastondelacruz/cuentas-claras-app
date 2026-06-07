import { CalendarDays, Check, ChevronDown, Globe2, ShoppingBag, TrainFront, Utensils } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { colors } from "../../../shared/theme/colors";
import { Avatar } from "../../../shared/ui/Avatar";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";

type Category = {
  label: string;
  Icon: typeof Utensils;
  selected?: boolean;
};

type Participant = {
  name: string;
  initials: string;
  sourceUrl?: string;
};

const categories: Category[] = [
  { label: "Comida", Icon: Utensils, selected: true },
  { label: "Compras", Icon: ShoppingBag },
  { label: "Transporte", Icon: TrainFront },
];

const participants: Participant[] = [
  {
    name: "Tú",
    initials: "T",
  },
  {
    name: "Sarah Miller",
    initials: "SM",
    sourceUrl: "https://i.pravatar.cc/120?img=47",
  },
  {
    name: "Alex Chen",
    initials: "AC",
    sourceUrl: "https://i.pravatar.cc/120?img=12",
  },
];

export function AddExpenseScreen() {
  return (
    <ScreenContainer>
      <InternalScreenHeader title="Crear gasto" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-5 pb-8 pt-10"
      >
        <View className="items-center">
          <View className="flex-row items-start gap-8">
            <Text className="pt-2 text-4xl text-neutral900">$</Text>
            <Text className="text-5xl font-light text-neutral900">0.00</Text>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-lg text-neutral900">Descripción</Text>
          <TextInput
            accessibilityLabel="Descripción del gasto"
            placeholder="¿En qué lo gastaste?"
            placeholderTextColor={colors.neutral500}
            className="h-16 rounded-lg border border-primary/35 bg-white px-5 text-lg text-neutral900"
          />
        </View>

        <View className="gap-4">
          <Text className="text-xl font-bold text-neutral900">Categoría</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-4"
          >
            {categories.map(({ label, Icon, selected }) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={`Categoría ${label}`}
                accessibilityState={{ selected: Boolean(selected) }}
                className={
                  selected
                    ? "h-12 flex-row items-center gap-3 rounded-full bg-green-400 px-5"
                    : "h-12 flex-row items-center gap-3 rounded-full bg-neutral200 px-5"
                }
                onPress={() => undefined}
              >
                <Icon color={colors.neutral900} size={22} strokeWidth={2.4} />
                <Text className="text-base text-neutral900">{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="gap-4">
          <FieldButton label="Pagado por" value="Tú" icon="chevron" />
          <FieldButton label="Grupo / Viaje" value="Viaje a Bali" icon="group" />
          <FieldButton label="Fecha" value="05/20/2024" icon="calendar" />
        </View>

        <View className="gap-4">
          <Text className="text-xl font-bold text-neutral900">División del gasto</Text>
          <View className="h-14 flex-row rounded-lg bg-neutral200 p-1">
            {[
              { label: "Equitativo", selected: true },
              { label: "Exacto" },
              { label: "Porcentaje" },
            ].map((option) => (
              <Pressable
                key={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: Boolean(option.selected) }}
                className={
                  option.selected
                    ? "flex-1 items-center justify-center rounded-md bg-white"
                    : "flex-1 items-center justify-center rounded-md"
                }
                onPress={() => undefined}
              >
                <Text
                  className={
                    option.selected
                      ? "text-base font-bold text-primary"
                      : "text-base text-neutral900"
                  }
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-neutral900">Participantes</Text>
            <Pressable accessibilityRole="button" onPress={() => undefined}>
              <Text className="text-base font-semibold text-primary">Seleccionar todos</Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {participants.map((participant) => (
              <Pressable
                key={participant.name}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: true }}
                accessibilityLabel={`${participant.name}, incluido en el gasto`}
                className="h-24 flex-row items-center gap-4 rounded-lg border border-primary/35 bg-white px-5"
                onPress={() => undefined}
              >
                <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/20">
                  <Avatar
                    name={participant.name}
                    initials={participant.initials}
                    sourceUrl={participant.sourceUrl}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-neutral900">{participant.name}</Text>
                  <Text className="text-sm text-neutral900">Incluido en el gasto</Text>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-md bg-primary">
                  <Check color={colors.white} size={22} strokeWidth={3} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Crear gasto"
          className="mt-8 h-20 items-center justify-center rounded-lg bg-green-400"
          onPress={() => undefined}
        >
          <Text className="text-xl font-bold text-neutral900">Crear Gasto</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

type FieldButtonProps = {
  label: string;
  value: string;
  icon: "chevron" | "group" | "calendar";
};

function FieldButton({ label, value, icon }: FieldButtonProps) {
  return (
    <View className="gap-3">
      <Text className="text-lg text-neutral900">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        className="h-16 flex-row items-center rounded-lg border border-primary/35 bg-white px-5"
        onPress={() => undefined}
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
