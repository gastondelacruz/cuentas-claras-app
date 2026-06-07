import { Settings } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { colors } from "../../../shared/theme/colors";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";

type GroupDetailHeaderProps = {
  groupName: string;
  onPressSettings?: () => void;
};

export function GroupDetailHeader({
  groupName,
  onPressSettings,
}: GroupDetailHeaderProps) {
  return (
    <InternalScreenHeader
      title={groupName}
      rightAction={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajustes del grupo"
          hitSlop={8}
          onPress={onPressSettings}
          className="h-10 w-10 items-center justify-center"
        >
          <Settings color={colors.neutral900} />
        </Pressable>
      }
    />
  );
}
