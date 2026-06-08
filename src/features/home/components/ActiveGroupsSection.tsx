import { ArrowRight, LayoutGrid } from "lucide-react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import type { HomeGroup } from "../types";
import { colors } from "../../../shared/theme/colors";
import { Avatar } from "../../../shared/ui/Avatar";
import { Card } from "../../../shared/ui/Card";

const activeGroupCardClassName = "h-72 w-64";

type ActiveGroupsSectionProps = {
  groups: HomeGroup[];
  onGroupPress: (groupId: string) => void;
  onViewAllPress: () => void;
};

export function ActiveGroupsSection({
  groups,
  onGroupPress,
  onViewAllPress,
}: ActiveGroupsSectionProps) {
  return (
    <View className="gap-3">
      <Text className="text-lg font-bold text-neutral900">Grupos activos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4 pr-6"
      >
        {groups.map((group) => (
          <Pressable
            key={group.id}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${group.name}`}
            onPress={() => onGroupPress(group.id)}
          >
            <Card className={activeGroupCardClassName} variant="groupPreview">
              <Image
                accessibilityLabel={group.name}
                className="h-32 w-full bg-neutral200"
                source={{ uri: group.coverUrl }}
              />
              <View className="flex-1 justify-between gap-3 p-4">
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-primary">
                    {group.category}
                  </Text>
                  <Text className="text-lg font-bold text-neutral900">
                    {group.name}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    {group.members.map((member, index) => (
                      <Avatar
                        key={member.id}
                        name={member.name}
                        initials={member.initials}
                        sourceUrl={member.avatarUrl ?? undefined}
                        overlap={index > 0}
                      />
                    ))}
                    {group.extraMembersCount > 0 ? (
                      <View className="-ml-3 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-neutral900">
                        <Text className="text-xs font-bold text-white">
                          +{group.extraMembersCount}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-sm font-semibold text-neutral500">
                    {group.activeDebtsLabel}
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver todos los grupos"
          onPress={onViewAllPress}
        >
          <Card className={activeGroupCardClassName} variant="groupPreview">
            <View className="h-32 items-center justify-center bg-primaryBg">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
                <LayoutGrid color={colors.primary} size={26} />
              </View>
            </View>

            <View className="flex-1 justify-between gap-3 p-4">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-primary">
                  Todos tus grupos
                </Text>
                <Text className="text-lg font-bold text-neutral900">
                  Ver lista completa
                </Text>
                <Text className="text-sm leading-5 text-neutral500">
                  Entrá al listado para revisar balances, filtros y detalles.
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>
      </ScrollView>
    </View>
  );
}
