import { NavigationProp } from "@react-navigation/native";

import { RootStackParamList } from "../types";

declare const navigation: NavigationProp<RootStackParamList>;

navigation.navigate("GroupDetail", { groupId: "group-1" });
navigation.navigate("NewGroup", { groupId: "group-1" });
navigation.navigate("VerifyEmail", { token: "verify-token" });
navigation.navigate("AcceptGroupInvitation", { token: "invite-token" });
navigation.navigate("Calculator", {
	initialAmount: "12.500,25",
	sourceParams: {
		type: "expense",
		transactionId: "transaction-1",
		returnToPersonalExpenses: true,
	},
});
navigation.navigate("PersonalCategoryDetail", {
	type: "expense",
	category: "Comida",
	range: "week",
	expenseKind: "fixed",
	percentage: 35,
});

// @ts-expect-error unknown root routes must fail at compile time.
navigation.navigate("UnknownScreen");
