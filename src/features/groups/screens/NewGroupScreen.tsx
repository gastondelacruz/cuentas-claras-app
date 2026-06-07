import { Camera, Contact, QrCode, UserPlus, Users } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { colors } from "../../../shared/theme/colors";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { groupCategoryVisuals } from "../components/groupCategory";
import { GroupCategory } from "../types";

type GroupTypeOption = {
  category: GroupCategory;
  label: string;
};

type GroupMember = {
  id: string;
  name: string;
  email: string;
  initials: string;
};

const groupTypeOptions: GroupTypeOption[] = [
  { category: "TRAVEL", label: "Viaje" },
  { category: "HOME", label: "Hogar" },
  { category: "FOOD", label: "Comida" },
  { category: "EVENT", label: "Evento" },
  { category: "OTHER", label: "Otro" },
];

const currentMember: GroupMember = {
  id: "current-user",
  name: "Jane Doe (Tú)",
  email: "jane.doe@example.com",
  initials: "JD",
};

export function NewGroupScreen() {
  const [selectedType, setSelectedType] = useState<GroupCategory>("TRAVEL");

  return (
    <ScreenContainer>
      <InternalScreenHeader title="Nuevo Grupo" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-5 pb-8 pt-8"
      >
        <View className="items-center">
          <View className="relative">
            <View className="h-32 w-32 items-center justify-center rounded-full bg-neutral200">
              <Users color={colors.neutral500} size={48} strokeWidth={2} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cambiar foto del grupo"
              hitSlop={8}
              onPress={() => undefined}
              className="absolute bottom-1 right-1 h-11 w-11 items-center justify-center rounded-full border-4 border-neutral100 bg-primary"
            >
              <Camera color={colors.white} size={20} strokeWidth={2.4} />
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold text-neutral500">
            Nombre del Grupo
          </Text>
          <TextInput
            accessibilityLabel="Nombre del grupo"
            placeholder="ej. Viaje a Europa 2024"
            placeholderTextColor={colors.neutral500}
            className="h-16 rounded-lg border border-neutral200 bg-white px-5 text-lg text-neutral900"
          />
        </View>

        <View className="gap-4">
          <Text className="text-sm font-bold uppercase tracking-wide text-neutral500">
            Tipo de grupo
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
          >
            {groupTypeOptions.map(({ category, label }) => {
              const { Icon } = groupCategoryVisuals[category];
              const selected = category === selectedType;

              return (
                <Pressable
                  key={category}
                  accessibilityRole="button"
                  accessibilityLabel={`Tipo de grupo ${label}`}
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedType(category)}
                  className={
                    selected
                      ? "h-12 flex-row items-center gap-3 rounded-full bg-green-400 px-5"
                      : "h-12 flex-row items-center gap-3 rounded-full bg-neutral200 px-5"
                  }
                >
                  <Icon color={colors.neutral900} size={20} strokeWidth={2.4} />
                  <Text className="text-base text-neutral900">{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold uppercase tracking-wide text-neutral500">
              Miembros (1)
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Agregar desde contactos"
              onPress={() => undefined}
              className="flex-row items-center gap-2"
            >
              <Contact color={colors.primary} size={20} strokeWidth={2.4} />
              <Text className="text-base font-semibold text-primary">
                Contactos
              </Text>
            </Pressable>
          </View>

          <View className="flex-row items-center gap-4 rounded-lg border border-neutral200 bg-white px-5 py-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primaryBg">
              <Text className="text-base font-bold text-primary">
                {currentMember.initials}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-neutral900">
                {currentMember.name}
              </Text>
              <Text className="text-sm text-neutral500">
                {currentMember.email}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center rounded-lg border border-neutral200 bg-white py-1.5 pl-5 pr-1.5">
            <TextInput
              accessibilityLabel="Correo o nombre del invitado"
              placeholder="Correo o nombre"
              placeholderTextColor={colors.neutral500}
              className="h-12 flex-1 text-lg text-neutral900"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Invitar miembro"
              onPress={() => undefined}
              className="h-12 items-center justify-center rounded-lg bg-green-400 px-6"
            >
              <Text className="text-base font-bold text-neutral900">Invitar</Text>
            </Pressable>
          </View>

          <View className="relative">
            <View className="items-center gap-3 rounded-lg border-2 border-dashed border-primary/30 px-6 py-10">
              <UserPlus color={colors.neutral500} size={36} strokeWidth={2} />
              <Text className="text-center text-lg text-neutral500">
                Aún no hay miembros invitados. Divide gastos con amigos agregando
                su correo.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Invitar con código QR"
              onPress={() => undefined}
              className="absolute -bottom-4 right-3 h-16 w-16 items-center justify-center rounded-full bg-primary"
            >
              <QrCode color={colors.white} size={28} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Guardar grupo"
          onPress={() => undefined}
          className="mt-8 h-20 items-center justify-center rounded-lg bg-green-400"
        >
          <Text className="text-xl font-bold text-neutral900">Guardar Grupo</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
