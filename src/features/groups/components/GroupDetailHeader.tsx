import { Settings } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { colors } from "../../../shared/theme/colors";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";

type GroupDetailHeaderProps = {
  groupName: string;
  settingsDisabled?: boolean;
  onPressSettings?: () => void;
};

export function GroupDetailHeader({
  groupName,
  settingsDisabled = false,
  onPressSettings,
}: GroupDetailHeaderProps) {
  return (
    <InternalScreenHeader
      title={groupName}
      rightAction={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajustes del grupo"
          accessibilityState={{ disabled: settingsDisabled }}
          disabled={settingsDisabled}
          hitSlop={8}
          onPress={settingsDisabled ? undefined : onPressSettings}
          className="h-10 w-10 items-center justify-center"
        >
          <Settings color={colors.neutral900} />
        </Pressable>
      }
    />
  );
}
