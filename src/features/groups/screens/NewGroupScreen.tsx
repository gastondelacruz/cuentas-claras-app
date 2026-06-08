import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, Contact, UserPlus, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../../../app/navigation/types';
import { useAuthStore } from '../../../shared/store/authStore';
import { colors } from '../../../shared/theme/colors';
import { Input } from '../../../shared/ui/Input';
import { InternalScreenHeader } from '../../../shared/ui/InternalScreenHeader';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer';
import { groupCategoryVisuals } from '../components/groupCategory';
import {
  inviteEmailSchema,
  inviteMembersRequiredMessage,
  NewGroupFormValues,
  newGroupFormSchema,
} from '../schemas/new-group-schema';
import { useGroupsStore } from '../store/groupsStore';
import { GroupCategory, GroupImage } from '../types';

type GroupTypeOption = {
  category: GroupCategory;
  label: string;
};

type GroupMember = {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
};

type NewGroupNavigation = NativeStackNavigationProp<RootStackParamList, 'NewGroup'>;

const groupTypeOptions: GroupTypeOption[] = [
  { category: "TRAVEL", label: "Viaje" },
  { category: "HOME", label: "Hogar" },
  { category: "FOOD", label: "Comida" },
  { category: "EVENT", label: "Evento" },
  { category: "OTHER", label: "Otro" },
];

const defaultCurrentMember: GroupMember = {
  id: 'current-user',
  name: 'Vos',
  email: 'jane.doe@example.com',
  initials: 'YO',
  avatarUrl: null,
};

const defaultGroupImage: GroupImage = { type: 'default', uri: null };

function getInitialsFromValue(value: string) {
  const tokens = value
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return 'YO';
  }

  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('');
}

export function NewGroupScreen() {
  const navigation = useNavigation<NewGroupNavigation>();
  const authUser = useAuthStore((state) => state.user);
  const createGroup = useGroupsStore((state) => state.createGroup);
  const [selectedType, setSelectedType] = useState<GroupCategory>('TRAVEL');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | undefined>();
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [groupImage, setGroupImage] = useState<GroupImage>(defaultGroupImage);
  const [imageError, setImageError] = useState<string | undefined>();
  const [membersError, setMembersError] = useState<string | undefined>();

  const currentMember = useMemo<GroupMember>(() => {
    const email = authUser?.email ?? defaultCurrentMember.email;

    return {
      id: authUser?.id ?? defaultCurrentMember.id,
      name: defaultCurrentMember.name,
      email,
      initials: getInitialsFromValue(email.split('@')[0] ?? email),
      avatarUrl: null,
    };
  }, [authUser]);

  const { control, handleSubmit } = useForm<NewGroupFormValues>({
    resolver: zodResolver(newGroupFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: { groupName: '' },
  });

  const totalMembers = invitedEmails.length + 1;

  const handleInvite = () => {
    const parsedInvite = inviteEmailSchema.safeParse(inviteEmail);

    if (!parsedInvite.success) {
      setInviteError(parsedInvite.error.flatten().formErrors[0] ?? 'Ingresá un correo electrónico válido');
      return;
    }

    const normalizedEmail = parsedInvite.data;

    if (normalizedEmail === currentMember.email.toLowerCase()) {
      setInviteError('Ya formás parte de este grupo');
      return;
    }

    if (invitedEmails.includes(normalizedEmail)) {
      setInviteError('Este correo ya está invitado');
      return;
    }

    setInvitedEmails((current) => [...current, normalizedEmail]);
    setInviteEmail('');
    setInviteError(undefined);
    setMembersError(undefined);
  };

  const handlePickImage = async () => {
    setImageError(undefined);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setImageError('Necesitás permiso para ver tus fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const selectedAsset = result.assets[0];

      if (!selectedAsset?.uri) {
        return;
      }

      setGroupImage({ type: 'uploaded', uri: selectedAsset.uri });
    } catch {
      setImageError('No pudimos abrir tus fotos');
    }
  };

  const onSubmit = ({ groupName }: NewGroupFormValues) => {
    if (invitedEmails.length === 0) {
      setMembersError(inviteMembersRequiredMessage);
      return;
    }

    setMembersError(undefined);

    const createdGroup = createGroup({
      name: groupName.trim(),
      category: selectedType,
      image: groupImage,
      invitedEmails,
      owner: currentMember,
    });

    navigation.replace('GroupDetail', { groupId: createdGroup.id });
  };

  return (
    <ScreenContainer>
      <InternalScreenHeader title="Nuevo Grupo" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-5 pb-8 pt-8"
      >
        <View className="items-center">
          <View className="items-center gap-3">
            <View className="relative h-32 w-32 items-center justify-center">
              <View className="h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-neutral200">
                {groupImage.type === 'uploaded' ? (
                  <Image
                    accessibilityIgnoresInvertColors
                    accessibilityLabel="Imagen del grupo seleccionada"
                    source={{ uri: groupImage.uri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Users color={colors.neutral500} size={48} strokeWidth={2} />
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cambiar foto del grupo"
                hitSlop={8}
                onPress={handlePickImage}
                className="absolute bottom-1 right-1 h-11 w-11 items-center justify-center rounded-full border-4 border-neutral100 bg-primary"
                testID="pick-group-image-button"
              >
                <Camera color={colors.white} size={20} strokeWidth={2.4} />
              </Pressable>
            </View>
            {imageError ? (
              <Text
                accessibilityLiveRegion="polite"
                className="text-center text-sm text-error"
                selectable
              >
                {imageError}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold text-neutral500">
            Nombre del Grupo
          </Text>
          <Controller
            control={control}
            name="groupName"
            render={({ field, fieldState }) => (
              <Input
                accessibilityLabel="Nombre del grupo"
                autoCapitalize="words"
                errorMessage={fieldState.error?.message}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="ej. Viaje a Europa 2024"
                testID="new-group-name-input"
                value={field.value}
              />
            )}
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
              {`Miembros (${totalMembers})`}
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
              accessibilityLabel="Correo del invitado"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(value) => {
                setInviteEmail(value);

                if (inviteError) {
                  setInviteError(undefined);
                }
              }}
              placeholder="nombre@correo.com"
              placeholderTextColor={colors.neutral500}
              className="h-12 flex-1 text-lg text-neutral900"
              testID="invite-email-input"
              value={inviteEmail}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Invitar miembro"
              onPress={handleInvite}
              className="h-12 items-center justify-center rounded-lg bg-green-400 px-6"
              testID="invite-member-button"
            >
              <Text className="text-base font-bold text-neutral900">Invitar</Text>
            </Pressable>
          </View>

          {inviteError ? (
            <Text accessibilityLiveRegion="polite" className="-mt-2 text-sm text-error">
              {inviteError}
            </Text>
          ) : null}

          <View className="gap-3">
            {invitedEmails.length === 0 ? (
              <View className="items-center gap-3 rounded-lg border-2 border-dashed border-primary/30 px-6 py-10">
                <UserPlus color={colors.neutral500} size={36} strokeWidth={2} />
                <Text className="text-center text-lg text-neutral500">
                  Aún no hay miembros invitados. Agregá correos para invitarlos al
                  grupo.
                </Text>
              </View>
            ) : (
              invitedEmails.map((email) => (
                <View
                  key={email}
                  className="flex-row items-center justify-between rounded-lg border border-neutral200 bg-white px-4 py-3"
                >
                  <Text className="text-base text-neutral900">{email}</Text>
                  <Text className="text-sm font-semibold text-primary">Invitado</Text>
                </View>
              ))
            )}
          </View>

          {membersError ? (
            <Text accessibilityLiveRegion="polite" className="text-sm text-error">
              {membersError}
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Guardar grupo"
          onPress={handleSubmit(onSubmit)}
          className="mt-8 h-20 items-center justify-center rounded-lg bg-green-400"
          testID="save-group-button"
        >
          <Text className="text-xl font-bold text-neutral900">Guardar Grupo</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
