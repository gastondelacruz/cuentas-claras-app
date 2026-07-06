import { useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import type { RootStackParamList } from "../../../app/navigation/types";
import { useAuthStore } from "../../../shared/store/authStore";
import { useVerifyEmail } from "./useEmailVerification";

type VerifyEmailRoute = RouteProp<RootStackParamList, "VerifyEmail">;
type VerifyEmailNavigation = NativeStackNavigationProp<RootStackParamList>;

export function useVerifyEmailScreen() {
	const route = useRoute<VerifyEmailRoute>();
	const navigation = useNavigation<VerifyEmailNavigation>();
	const verifyMutation = useVerifyEmail();
	const pendingGroupInvitationToken = useAuthStore(
		(state) => state.pendingGroupInvitationToken,
	);
	const token = route.params?.token;

	function navigateAfterVerification() {
		if (pendingGroupInvitationToken) {
			navigation.navigate("AcceptGroupInvitation", {
				token: pendingGroupInvitationToken,
			});
			return;
		}

		navigation.navigate("Main", { screen: "GroupsList" });
	}

	function verifyToken() {
		if (!token || verifyMutation.isPending) return;

		verifyMutation.mutate(token, {
			onSuccess: navigateAfterVerification,
		});
	}

	useEffect(() => {
		if (
			!token ||
			verifyMutation.isPending ||
			verifyMutation.isSuccess ||
			verifyMutation.isError
		)
			return;

		verifyToken();
	}, [
		token,
		verifyMutation.isPending,
		verifyMutation.isSuccess,
		verifyMutation.isError,
	]);

	return {
		hasToken: Boolean(token),
		isPending: verifyMutation.isPending,
		isSuccess: verifyMutation.isSuccess,
		isError: verifyMutation.isError,
		retryVerification: verifyToken,
	};
}
