import {
  groupBalancesSchema,
  groupDetailSchema,
} from '../groupSchema';

const validGroup = {
  id: 'g1',
  name: 'Viaje a Mendoza',
  type: 'trip',
  currency: 'ARS',
  description: 'Vacaciones de invierno',
  members: [
    { id: 'm1', displayName: 'Vos', isCurrentUser: true },
  ],
};

describe('groupDetailSchema', () => {
  it('validates a complete group detail DTO', () => {
    expect(() => groupDetailSchema.parse(validGroup)).not.toThrow();
  });

  it('defaults empty members array when members is missing', () => {
    const minimal = { id: 'g2' };
    const parsed = groupDetailSchema.parse(minimal);
    expect(parsed.members).toEqual([]);
  });

  it('accepts an unknown group type as optional', () => {
    const withoutType = { id: 'g2', name: 'Test' };
    expect(() => groupDetailSchema.parse(withoutType)).not.toThrow();
  });

  it('rejects an invalid group type when provided', () => {
    const invalid = { ...validGroup, type: 'invalid' };
    expect(() => groupDetailSchema.parse(invalid)).toThrow();
  });
});

describe('groupBalancesSchema', () => {
  it('validates a balances envelope with real backend shape', () => {
    const data = {
      balances: [
        { memberId: 'm1', displayName: 'Vos', balance: -50, currency: 'ARS' },
      ],
    };

    const parsed = groupBalancesSchema.parse(data);

    expect(parsed.balances).toHaveLength(1);
    expect(parsed.balances[0]).toMatchObject({ memberId: 'm1', balance: -50 });
  });

  it('rejects balances without required memberId', () => {
    const data = { balances: [{ displayName: 'Vos', balance: 0, currency: 'ARS' }] };
    expect(() => groupBalancesSchema.parse(data)).toThrow();
  });
});
