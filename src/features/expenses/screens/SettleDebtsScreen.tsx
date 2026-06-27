import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { RootStackParamList } from '../../../app/navigation/types';
import { InternalScreenHeader } from '../../../shared/ui/InternalScreenHeader';
import { Card } from '../../../shared/ui/Card';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer';
import { formatCurrency } from '../../../shared/utils/formatAmount';
import { useSettleDebts } from '../hooks/useSettleDebts';
import { useRecordSettlement } from '../hooks/useRecordSettlement';
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

type UserSettlementRowProps = {
  item: Extract<SettlementItem, { type: 'with-user' }>;
  onSettle: () => void;
  isSettling: boolean;
};

function UserSettlementRow({ item, onSettle, isSettling }: UserSettlementRowProps) {
  const isOwedToYou = item.direction === 'owes-you';

  return (
    <Card className="flex-row items-center gap-3 p-4">
      <SettlementAvatar person={item.person} tone={isOwedToYou ? 'success' : 'debt'} />

      <View className="flex-1 gap-1">
        <Text className="text-xl font-semibold text-neutral900">{isOwedToYou ? `${item.person.name} te debe` : `Tú le debes a ${item.person.name}`}</Text>
        <Text className={isOwedToYou ? 'text-xl font-bold text-success' : 'text-xl font-bold text-debt'}>{formatCurrency(item.amount)}</Text>
      </View>

      <Pressable
        accessibilityLabel={`Saldar deuda con ${item.person.name}`}
        accessibilityRole="button"
        disabled={isSettling}
        onPress={onSettle}
        className="rounded-lg bg-primary px-3 py-2"
      >
        <Text className="text-sm font-semibold text-white">{isSettling ? '...' : 'Saldar'}</Text>
      </Pressable>
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

type SettlementRowProps = {
  item: SettlementItem;
  onSettle: (item: Extract<SettlementItem, { type: 'with-user' }>) => void;
  settlingId: string | null;
};

function SettlementRow({ item, onSettle, settlingId }: SettlementRowProps) {
  if (item.type === 'between-members') {
    return <SettledMembersRow item={item} />;
  }

  return (
    <UserSettlementRow
      item={item}
      onSettle={() => onSettle(item)}
      isSettling={settlingId === item.id}
    />
  );
}

type SettleDebtsRoute = RouteProp<RootStackParamList, 'SettleDebts'>;

export function SettleDebtsScreen() {
  const route = useRoute<SettleDebtsRoute>();
  const groupId = route.params.groupId;
  const { summary, items, currentUserId } = useSettleDebts(groupId);
  const { mutate: recordSettlement, isPending } = useRecordSettlement(groupId);
  const [settlingId, setSettlingId] = React.useState<string | null>(null);

  function handleSettle(item: Extract<SettlementItem, { type: 'with-user' }>) {
    if (!currentUserId) return;

    const fromMemberId = item.direction === 'owes-you' ? item.person.id : currentUserId;
    const toMemberId = item.direction === 'owes-you' ? currentUserId : item.person.id;

    setSettlingId(item.id);
    recordSettlement(
      { fromMemberId, toMemberId, amount: item.amount, currency: 'ARS', paidAt: new Date().toISOString() },
      { onSettled: () => setSettlingId(null) },
    );
  }

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
                <SettlementRow
                  key={item.id}
                  item={item}
                  onSettle={handleSettle}
                  settlingId={isPending ? settlingId : null}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
