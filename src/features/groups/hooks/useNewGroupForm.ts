import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { RootStackParamList } from '../../../app/navigation/types';
import { queryKeys } from '../../../shared/api/queryKeys';
import { useAuthStore } from '../../../shared/store/authStore';
import { getGroup } from '../api/groupsApi';
import type { CreateGroupResponse, GroupApiType } from '../api/groupsApi';
import type { GroupDetailDto } from '../schemas/groupSchema';
import { useCreateGroup } from './useCreateGroup';
import { useUpdateGroup } from './useGroupDetailActions';

import {
  inviteEmailSchema,
  inviteMembersRequiredMessage,
  NewGroupFormValues,
  newGroupFormSchema,
} from '../schemas/new-group-schema';
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

const categoryToApiType: Record<GroupCategory, GroupApiType> = {
  TRAVEL: 'trip',
  HOME: 'home',
  FOOD: 'other',
  EVENT: 'event',
  OTHER: 'other',
};

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

const apiTypeToCategoryMap: Record<GroupApiType, GroupCategory> = {
  trip: 'TRAVEL',
  home: 'HOME',
  couple: 'OTHER',
  friends: 'OTHER',
  event: 'EVENT',
  other: 'OTHER',
};

function toIsoString(value: CreateGroupResponse['createdAt'] | undefined): string {
  if (value instanceof Date) return value.toISOString();
  return value ?? new Date().toISOString();
}

function mapCreateResponseToGroupDetail(
  response: CreateGroupResponse,
  fallback: { name: string; type: GroupApiType; currency: string; members: GroupMember[] },
): GroupDetailDto {
  const members = response.members?.map((member) => ({
    id: member.id,
    displayName: member.name ?? member.email ?? 'Member',
    email: member.email,
    isCurrentUser: member.id === fallback.members[0]?.id || member.email === fallback.members[0]?.email,
  })) ?? fallback.members.map((member, index) => ({
    id: member.id,
    displayName: member.name,
    email: member.email,
    isCurrentUser: index === 0,
  }));

  return {
    id: response.id,
    name: response.name ?? fallback.name,
    type: response.type ?? fallback.type,
    currency: response.currency ?? fallback.currency,
    description: response.description ?? null,
    members,
    membersCount: response.membersCount ?? members.length,
    expensesCount: response.expensesCount ?? 0,
    totalAmount: response.totalAmount ?? 0,
    currentUserBalance: response.currentUserBalance ?? 0,
    createdAt: toIsoString(response.createdAt),
    updatedAt: toIsoString(response.updatedAt),
    archivedAt: response.archivedAt ? toIsoString(response.archivedAt) : null,
  };
}

export function useNewGroupForm() {
  const navigation = useNavigation<NewGroupNavigation>();
  const route = useRoute<NewGroupRoute>();
  const authUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const editGroupId = route.params?.groupId;

  // Fetch group data from API when editing — uses same React Query cache as GroupDetailScreen
  const { data: groupToEdit } = useQuery({
    queryKey: queryKeys.groups.detail(editGroupId ?? ''),
    queryFn: () => getGroup(editGroupId!),
    enabled: Boolean(editGroupId),
  });

  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();

  const isEditing = Boolean(editGroupId);

  const initialCategory: GroupCategory =
    groupToEdit?.type ? (apiTypeToCategoryMap[groupToEdit.type] ?? 'TRAVEL') : 'TRAVEL';

  // Initial invited emails derived from non-current-user members (excluding owner)
  const initialInvitedEmails = useMemo(() => {
    if (!groupToEdit) return [];
    return groupToEdit.members
      .filter((m) => !m.isCurrentUser && !m.removedAt && m.email)
      .map((m) => m.email!)
      .filter(Boolean);
  }, [groupToEdit]);

  const [selectedType, setSelectedType] = useState<GroupCategory>(initialCategory);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | undefined>();
  const [invitedEmails, setInvitedEmails] = useState<string[]>(initialInvitedEmails);
  const [groupImage, setGroupImage] = useState<GroupImage>(defaultGroupImage);
  const [imageError, setImageError] = useState<string | undefined>();
  const [membersError, setMembersError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

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

  // No read-only members from mocks — all members come from the API
  const readOnlyMembers: Array<{ id: string; name: string }> = [];
  const totalMembers = invitedEmails.length + 1;

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
    setSubmitError(undefined);

    if (isEditing && editGroupId) {
      updateGroupMutation.mutate(
        {
          groupId: editGroupId,
          data: {
            name: groupName.trim(),
            type: categoryToApiType[selectedType],
          },
        },
        {
          onSuccess: () => navigation.goBack(),
          onError: () => {
            setSubmitError('No pudimos actualizar el grupo. Intentá de nuevo.');
          },
        },
      );
      return;
    }

    createGroupMutation.mutate(
      {
        name: groupName.trim(),
        type: categoryToApiType[selectedType],
        currency: 'ARS',
        members: invitedEmails.map((email) => ({
          displayName: email.split('@')[0] ?? email,
          email,
        })),
      },
      {
        onSuccess: (response) => {
          const groupDetail = mapCreateResponseToGroupDetail(response, {
            name: groupName.trim(),
            type: categoryToApiType[selectedType],
            currency: 'ARS',
            members: [
              currentMember,
              ...invitedEmails.map((email) => ({
                id: email,
                name: email.split('@')[0] ?? email,
                email,
                initials: getInitialsFromValue(email.split('@')[0] ?? email),
                avatarUrl: null,
              })),
            ],
          });

          queryClient.setQueryData(queryKeys.groups.detail(response.id), groupDetail);
          queryClient.invalidateQueries({ queryKey: queryKeys.groups.all(), exact: true });
          navigation.replace('GroupDetail', { groupId: response.id });
        },
        onError: () => {
          setSubmitError('No pudimos crear el grupo. Intentá de nuevo.');
        },
      },
    );
  }

  return {
    control,
    handleSubmit,
    isEditing,
    isPending: createGroupMutation.isPending || updateGroupMutation.isPending,
    selectedType,
    setSelectedType,
    inviteEmail,
    setInviteEmail,
    inviteError,
    invitedEmails,
    groupImage,
    imageError,
    membersError,
    submitError,
    currentMember,
    readOnlyMembers,
    totalMembers,
    handleInvite,
    handlePickImage,
    onSubmit,
  };
}
