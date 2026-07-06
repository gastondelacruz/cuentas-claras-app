import { accountSummaryQueryOptions } from "../../features/account/api/accountQueryOptions";
import { groupsListQueryOptions } from "../../features/groups/api/groupQueryOptions";
import {
	personalTransactionsListQueryOptions,
	personalTransactionsSummaryQueryOptions,
} from "../../features/personal-expenses/api/personalTransactionQueryOptions";
import { isEnhancedInitialLoadingEnabled } from "../feature-flags/initialLoadingFlags";
import { useAuthStore } from "../store/authStore";
import { queryClient } from "./queryClient";

export function prefetchInitialAppData() {
	if (!isEnhancedInitialLoadingEnabled()) return;
	const { isAuthenticated, emailVerified } = useAuthStore.getState();
	if (!isAuthenticated || !emailVerified) return;

	void queryClient.prefetchQuery(groupsListQueryOptions());
	void queryClient.prefetchQuery(accountSummaryQueryOptions());
	void queryClient.prefetchQuery(
		personalTransactionsListQueryOptions({ type: "expense", range: "week" }),
	);
	void queryClient.prefetchQuery(
		personalTransactionsSummaryQueryOptions({ range: "week" }),
	);
}
