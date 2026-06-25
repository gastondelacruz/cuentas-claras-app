import { Camera, Contact, UserPlus, Users } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { Input } from '../../../shared/ui/Input';
import { InternalScreenHeader } from '../../../shared/ui/InternalScreenHeader';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer';
import { groupCategoryVisuals } from '../components/groupCategory';
import { useNewGroupForm } from '../hooks/useNewGroupForm';
import { GroupCategory } from '../types';

type GroupTypeOption = {
  category: GroupCategory;
  label: string;
};

const groupTypeOptions: GroupTypeOption[] = [
  { category: 'TRAVEL', label: 'Viaje' },
  { category: 'HOME', label: 'Hogar' },
  { category: 'FOOD', label: 'Comida' },
  { category: 'EVENT', label: 'Evento' },
  { category: 'OTHER', label: 'Otro' },
];

export function NewGroupScreen() {
  const {
    control,
    handleSubmit,
    isEditing,
    selectedType,
    setSelectedType,
    inviteEmail,
    setInviteEmail,
    inviteError,
    invitedEmails,
    groupImage,
    imageError,
    membersError,
    currentMember,
    readOnlyMembers,
    totalMembers,
    handleInvite,
    handlePickImage,
    onSubmit,
  } = useNewGroupForm();

  return (
    <ScreenContainer>
      <InternalScreenHeader title={isEditing ? 'Editar grupo' : 'Nuevo Grupo'} />

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
          <Text className="text-sm font-semibold text-neutral500">Nombre del Grupo</Text>
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
                      ? 'h-12 flex-row items-center gap-3 rounded-full bg-green-400 px-5'
                      : 'h-12 flex-row items-center gap-3 rounded-full bg-neutral200 px-5'
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
              <Text className="text-base font-semibold text-primary">Contactos</Text>
            </Pressable>
          </View>

          <View className="flex-row items-center gap-4 rounded-lg border border-neutral200 bg-white px-5 py-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primaryBg">
              <Text className="text-base font-bold text-primary">{currentMember.initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-neutral900">{currentMember.name}</Text>
              <Text className="text-sm text-neutral500">{currentMember.email}</Text>
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
            {invitedEmails.length === 0 && readOnlyMembers.length === 0 ? (
              <View className="items-center gap-3 rounded-lg border-2 border-dashed border-primary/30 px-6 py-10">
                <UserPlus color={colors.neutral500} size={36} strokeWidth={2} />
                <Text className="text-center text-lg text-neutral500">
                  Aún no hay miembros invitados. Agregá correos para invitarlos al grupo.
                </Text>
              </View>
            ) : (
              <>
                {readOnlyMembers.map((member) => (
                  <View
                    key={member.id}
                    className="flex-row items-center justify-between rounded-lg border border-neutral200 bg-white px-4 py-3"
                  >
                    <Text className="text-base text-neutral900">{member.name}</Text>
                    <Text className="text-sm font-semibold text-primary">Miembro actual</Text>
                  </View>
                ))}
                {invitedEmails.map((email) => (
                  <View
                    key={email}
                    className="flex-row items-center justify-between rounded-lg border border-neutral200 bg-white px-4 py-3"
                  >
                    <Text className="text-base text-neutral900">{email}</Text>
                    <Text className="text-sm font-semibold text-primary">Invitado</Text>
                  </View>
                ))}
              </>
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
          accessibilityLabel={isEditing ? 'Guardar cambios del grupo' : 'Guardar grupo'}
          onPress={handleSubmit(onSubmit)}
          className="mt-8 h-20 items-center justify-center rounded-lg bg-green-400"
          testID="save-group-button"
        >
          <Text className="text-xl font-bold text-neutral900">
            {isEditing ? 'Guardar cambios' : 'Guardar Grupo'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
