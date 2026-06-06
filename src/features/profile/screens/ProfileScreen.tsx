import { Image, Pressable, ScrollView, Text, View } from "react-native";
import type { ComponentType } from "react";
import {
  Bell,
  ChevronRight,
  CircleDollarSign,
  LogOut,
  Pencil,
  Plane,
  ShieldCheck,
  Utensils,
} from "lucide-react-native";

import { colors } from "../../../shared/theme/colors";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

const profile = {
  name: "Alex Thompson",
  email: "alex.thompson@lumifinance.com",
  plan: "Miembro Pro",
  status: "Verificado",
  avatarUrl:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&fit=crop&crop=faces",
};

const activityItems = [
  {
    id: "taco-tuesday",
    title: "Grupo Martes de Tacos",
    subtitle: "Ayer, 8:45 PM",
    amount: "-$24,00",
    amountClassName: "text-debt",
    Icon: Utensils,
    iconClassName: "bg-white",
    iconColor: colors.primary,
  },
  {
    id: "weekend-trip",
    title: "Viaje de Fin de Semana",
    subtitle: "12 oct, 11:20 AM",
    amount: "+$180,50",
    amountClassName: "text-primary",
    Icon: Plane,
    iconClassName: "bg-debtBg",
    iconColor: colors.debt,
  },
];

const preferenceItems = [
  { id: "notifications", label: "Notificaciones", Icon: Bell },
  { id: "privacy", label: "Privacidad y Seguridad", Icon: ShieldCheck },
  {
    id: "currency",
    label: "Moneda Predeterminada",
    value: "USD ($)",
    Icon: CircleDollarSign,
  },
];

function ProfileCard() {
  return (
    <View className="items-center rounded-lg bg-white px-5 py-8 shadow-sm">
      <View className="relative mb-5">
        <View className="h-32 w-32 items-center justify-center rounded-full bg-neutral200 p-2">
          <Image
            accessibilityLabel={profile.name}
            className="h-full w-full rounded-full"
            source={{ uri: profile.avatarUrl }}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar foto de perfil"
          className="absolute bottom-0 right-0 h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-primary"
        >
          <Pencil color={colors.white} size={22} strokeWidth={2.6} />
        </Pressable>
      </View>

      <Text className="text-2xl font-bold text-neutral900">{profile.name}</Text>
      <Text selectable className="mt-1 text-xl text-neutral700">
        {profile.email}
      </Text>

      <View className="mt-6 w-full flex-row items-center justify-center gap-10">
        <Text className="text-xl text-primary">{profile.plan}</Text>
        <View className="rounded-full bg-debtBg px-5 py-2">
          <Text className="text-xl text-debt">{profile.status}</Text>
        </View>
      </View>
    </View>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  valueClassName,
}: {
  title: string;
  value: string;
  detail: string;
  valueClassName: string;
}) {
  return (
    <View className="flex-1 rounded-lg bg-white p-5 shadow-sm">
      <Text className="text-xl text-neutral700">{title}</Text>
      <Text className={`mt-1 text-4xl font-medium ${valueClassName}`}>
        {value}
      </Text>
      <Text className="mt-1 text-xl leading-7 text-primary">{detail}</Text>
    </View>
  );
}

function ActivityIcon({
  Icon,
  className,
  color,
}: {
  Icon: IconComponent;
  className: string;
  color: string;
}) {
  return (
    <View
      className={`h-12 w-12 items-center justify-center rounded-full ${className}`}
    >
      <Icon color={color} size={28} strokeWidth={2.4} />
    </View>
  );
}

function ActivityHistory() {
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-neutral900">
          Historial de Actividad
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver todo el historial de actividad"
        >
          <Text className="text-xl text-primary">Ver Todo</Text>
        </Pressable>
      </View>

      <View className="gap-4">
        {activityItems.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center gap-4 rounded-lg bg-white p-5 shadow-sm"
          >
            <ActivityIcon
              Icon={item.Icon}
              className={item.iconClassName}
              color={item.iconColor}
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-neutral900">
                {item.title}
              </Text>
              <Text className="mt-1 text-lg text-neutral700">
                {item.subtitle}
              </Text>
            </View>
            <Text className={`text-lg font-bold ${item.amountClassName}`}>
              {item.amount}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PreferenceRow({
  Icon,
  label,
  value,
  isFirst,
}: {
  Icon: IconComponent;
  label: string;
  value?: string;
  isFirst: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}: ${value}` : label}
      className={`flex-row items-center gap-5 px-5 py-5 ${isFirst ? "" : "border-t border-neutral200"}`}
    >
      <Icon color={colors.neutral900} size={26} strokeWidth={2.2} />
      <Text className="flex-1 text-xl text-neutral900">{label}</Text>
      {value ? <Text className="text-lg text-neutral700">{value}</Text> : null}
      <ChevronRight color={colors.neutral500} size={24} strokeWidth={2.4} />
    </Pressable>
  );
}

function Preferences() {
  return (
    <View className="gap-4">
      <Text className="text-2xl font-bold text-neutral900">Preferencias</Text>
      <View className="overflow-hidden rounded-lg bg-white shadow-sm">
        {preferenceItems.map((item, index) => (
          <PreferenceRow
            key={item.id}
            Icon={item.Icon}
            label={item.label}
            value={item.value}
            isFirst={index === 0}
          />
        ))}
      </View>
    </View>
  );
}

export function ProfileScreen() {
  return (
    <ScreenContainer>
      <AppTopBar />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 pb-28 pt-6"
      >
        <View className="gap-8 px-5">
          <ProfileCard />

          <View className="flex-row gap-4">
            <SummaryCard
              title="Gasto Total"
              value="$2.450"
              detail="+12% vs mes pasado"
              valueClassName="text-neutral900"
            />
            <SummaryCard
              title="Deudas Activas"
              value="-$142,50"
              detail="3 pendientes de liquidar"
              valueClassName="text-debt"
            />
          </View>

          <ActivityHistory />
          <Preferences />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            className="flex-row items-center justify-center gap-3 py-6"
          >
            <LogOut color={colors.debt} size={24} strokeWidth={2.2} />
            <Text className="text-xl text-debt">Cerrar Sesión</Text>
          </Pressable>

          <Text className="text-center text-lg text-neutral700">
            Versión 2.4.1 (Compilación 829)
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
