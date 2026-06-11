import { Image, ScrollView, Text, View } from 'react-native';

import { InternalScreenHeader } from '../../../shared/ui/InternalScreenHeader';
import { Card } from '../../../shared/ui/Card';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer';
import { formatCurrency } from '../../../shared/utils/formatAmount';
import { useSettleDebts } from '../hooks/useSettleDebts';
import { SettlementItem, SettlementPerson } from '../types';

function SettlementAvatar({ person, tone }: { person: SettlementPerson; tone: 'success' | 'debt' | 'neutral' }) {
  const ringClassName = tone === 'success' ? 'border-success' : tone === 'debt' ? 'border-debt' : 'border-neutral200';

  if (person.avatarUrl) {
    return <Image accessibilityLabel={person.name} className={`h-12 w-12 rounded-full border-2 ${ringClassName}`} source={{ uri: person.avatarUrl }} />;
  }

  return (
    <View className={`h-12 w-12 items-center justify-center rounded-full border-2 bg-neutral100 ${ringClassName}`}>
      <Text className="text-sm font-semibold text-neutral700">{person.initials}</Text>
    </View>
  );
}

function UserSettlementRow({ item }: { item: Extract<SettlementItem, { type: 'with-user' }> }) {
  const isOwedToYou = item.direction === 'owes-you';

  return (
    <Card className="flex-row items-center gap-3 p-4">
      <SettlementAvatar person={item.person} tone={isOwedToYou ? 'success' : 'debt'} />

      <View className="flex-1 gap-1">
        <Text className="text-xl font-semibold text-neutral900">{isOwedToYou ? `${item.person.name} te debe` : `Tú le debes a ${item.person.name}`}</Text>
        <Text className={isOwedToYou ? 'text-xl font-bold text-success' : 'text-xl font-bold text-debt'}>{formatCurrency(item.amount)}</Text>
      </View>

    </Card>
  );
}

function SettledMembersRow({ item }: { item: Extract<SettlementItem, { type: 'between-members' }> }) {
  return (
    <Card className="flex-row items-center gap-3 bg-neutral100 p-4 opacity-80">
      <View className="flex-row pr-2">
        <View className="z-10">
          <SettlementAvatar person={item.from} tone="neutral" />
        </View>
        <View className="-ml-3">
          <SettlementAvatar person={item.to} tone="neutral" />
        </View>
      </View>

      <View className="flex-1 gap-1">
        <Text className="text-xl text-neutral700">{`${item.from.name} le debe a ${item.to.name}`}</Text>
        <Text className="text-xl font-semibold text-neutral600">{formatCurrency(item.amount)}</Text>
      </View>
    </Card>
  );
}

function SettlementRow({ item }: { item: SettlementItem }) {
  if (item.type === 'between-members') {
    return <SettledMembersRow item={item} />;
  }

  return <UserSettlementRow item={item} />;
}

export function SettleDebtsScreen() {
  const { summary, items } = useSettleDebts();

  return (
    <ScreenContainer>
      <InternalScreenHeader title="Saldos" />

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-6 px-4 pb-28 pt-6">
        <Card className="gap-5 px-5 py-6">
          <Text className="text-sm font-bold uppercase tracking-wider text-neutral700">Resumen de saldos</Text>

          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text className="text-base text-neutral700">Te deben</Text>
              <Text className="text-4xl font-bold text-success">{formatCurrency(summary.owedToYou)}</Text>
            </View>

            <View className="h-16 w-px bg-neutral200" />

            <View className="flex-1 gap-1">
              <Text className="text-base text-neutral700">Debes</Text>
              <Text className="text-4xl font-bold text-debt">{formatCurrency(summary.youOwe)}</Text>
            </View>
          </View>
        </Card>

        <View className="gap-3">
          <Text className="text-2xl font-bold text-neutral900">Quién debe a quién</Text>

          {items.length === 0 ? (
            <Card className="items-center gap-1 px-5 py-8">
              <Text className="text-lg font-semibold text-neutral900">Estás al día</Text>
              <Text className="text-base text-neutral500">No tenés deudas pendientes por saldar.</Text>
            </Card>
          ) : (
            <View className="gap-3">
              {items.map((item) => (
                <SettlementRow key={item.id} item={item} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
