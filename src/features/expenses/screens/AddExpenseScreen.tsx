import { PlaceholderScreen } from "../../../shared/ui/PlaceholderScreen";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";

export function AddExpenseScreen() {
  return (
    <ScreenContainer>
      <AppTopBar />
      <PlaceholderScreen name="AddExpenseScreen" />
    </ScreenContainer>
  );
}
