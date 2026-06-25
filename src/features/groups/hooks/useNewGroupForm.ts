import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { RootStackParamList } from '../../../app/navigation/types';
import { useAuthStore } from '../../../shared/store/authStore';
import { groupsListMock } from '../mocks/groupsList.mock';
import {
  inviteEmailSchema,
  inviteMembersRequiredMessage,
  NewGroupFormValues,
  newGroupFormSchema,
} from '../schemas/new-group-schema';
import { useGroupsStore } from '../store/groupsStore';
import { GroupCategory, GroupImage } from '../types';

type NewGroupRoute = RouteProp<RootStackParamList, 'NewGroup'>;
type NewGroupNavigation = NativeStackNavigationProp<RootStackParamList, 'NewGroup'>;

type GroupMember = {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
};

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

  if (tokens.length === 0) return 'YO';

  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('');
}

export function useNewGroupForm() {
  const navigation = useNavigation<NewGroupNavigation>();
  const route = useRoute<NewGroupRoute>();
  const authUser = useAuthStore((state) => state.user);

  const groupToEdit = useGroupsStore((state) =>
    state.groups.find((group) => group.id === route.params?.groupId),
  );
  const createGroup = useGroupsStore((state) => state.createGroup);
  const updateGroup = useGroupsStore((state) => state.updateGroup);

  const isEditing = Boolean(groupToEdit && route.params?.groupId);

  const [selectedType, setSelectedType] = useState<GroupCategory>(groupToEdit?.category ?? 'TRAVEL');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | undefined>();
  const [invitedEmails, setInvitedEmails] = useState<string[]>(groupToEdit?.invitedEmails ?? []);
  const [groupImage, setGroupImage] = useState<GroupImage>(groupToEdit?.image ?? defaultGroupImage);
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
    defaultValues: { groupName: groupToEdit?.name ?? '' },
  });

  const isSeededGroup = useMemo(
    () => Boolean(groupToEdit && groupsListMock.some((group) => group.id === groupToEdit.id)),
    [groupToEdit],
  );

  const readOnlyMembers = useMemo(
    () =>
      isEditing && isSeededGroup
        ? (groupsListMock.find((group) => group.id === groupToEdit?.id)?.members ?? [])
        : [],
    [groupToEdit?.id, isEditing, isSeededGroup],
  );

  const totalMembers = readOnlyMembers.length + invitedEmails.length + 1;

  function handleInvite() {
    const parsedInvite = inviteEmailSchema.safeParse(inviteEmail);

    if (!parsedInvite.success) {
      setInviteError(
        parsedInvite.error.flatten().formErrors[0] ?? 'Ingresá un correo electrónico válido',
      );
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
  }

  async function handlePickImage() {
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

      if (result.canceled) return;

      const selectedAsset = result.assets[0];
      if (!selectedAsset?.uri) return;

      setGroupImage({ type: 'uploaded', uri: selectedAsset.uri });
    } catch {
      setImageError('No pudimos abrir tus fotos');
    }
  }

  function onSubmit({ groupName }: NewGroupFormValues) {
    if (invitedEmails.length === 0 && readOnlyMembers.length === 0) {
      setMembersError(inviteMembersRequiredMessage);
      return;
    }

    setMembersError(undefined);

    if (isEditing && groupToEdit) {
      updateGroup({
        groupId: groupToEdit.id,
        name: groupName.trim(),
        category: selectedType,
        image: groupImage,
        invitedEmails,
        owner: currentMember,
      });
      navigation.goBack();
      return;
    }

    const createdGroup = createGroup({
      name: groupName.trim(),
      category: selectedType,
      image: groupImage,
      invitedEmails,
      owner: currentMember,
    });

    navigation.replace('GroupDetail', { groupId: createdGroup.id });
  }

  return {
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
  };
}
