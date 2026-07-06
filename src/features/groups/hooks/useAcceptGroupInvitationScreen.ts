import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import type { RootStackParamList } from "../../../app/navigation/types";
import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuthStore } from "../../../shared/store/authStore";
import { acceptGroupInvitation } from "../api/groupsApi";

type AcceptInvitationRoute = RouteProp<
	RootStackParamList,
	"AcceptGroupInvitation"
>;
type AcceptInvitationNavigation = NativeStackNavigationProp<RootStackParamList>;

export function useAcceptGroupInvitationScreen() {
	const route = useRoute<AcceptInvitationRoute>();
	const navigation = useNavigation<AcceptInvitationNavigation>();
	const queryClient = useQueryClient();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const emailVerified = useAuthStore((state) => state.emailVerified);
	const setPendingGroupInvitationToken = useAuthStore(
		(state) => state.setPendingGroupInvitationToken,
	);
	const token = route.params?.token;
	const acceptMutation = useMutation({
		mutationFn: (invitationToken: string) =>
			acceptGroupInvitation(invitationToken),
		onSuccess: async () => {
			setPendingGroupInvitationToken(null);
			await queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
			navigation.navigate("Main", { screen: "GroupsList" });
		},
	});

	function acceptInvitation() {
		if (
			!token ||
			!isAuthenticated ||
			!emailVerified ||
			acceptMutation.isPending
		)
			return;

		acceptMutation.mutate(token);
	}

	useEffect(() => {
		if (!token) return;

		if (!isAuthenticated) {
			setPendingGroupInvitationToken(token);
			navigation.navigate("Auth", { initialTab: "login" });
			return;
		}

		if (!emailVerified) {
			setPendingGroupInvitationToken(token);
			return;
		}

		if (
			acceptMutation.isPending ||
			acceptMutation.isSuccess ||
			acceptMutation.isError
		)
			return;

		acceptInvitation();
	}, [
		acceptMutation.isPending,
		acceptMutation.isSuccess,
		acceptMutation.isError,
		emailVerified,
		isAuthenticated,
		navigation,
		setPendingGroupInvitationToken,
		token,
	]);

	return {
		hasToken: Boolean(token),
		isAuthenticated,
		emailVerified,
		isPending: acceptMutation.isPending,
		isSuccess: acceptMutation.isSuccess,
		isError: acceptMutation.isError,
		retryAcceptInvitation: acceptInvitation,
	};
}
