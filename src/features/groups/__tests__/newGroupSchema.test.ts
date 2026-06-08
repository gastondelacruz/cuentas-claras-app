import { inviteEmailSchema, invitedEmailsSchema, newGroupFormSchema } from '../schemas/new-group-schema';

describe('newGroupFormSchema', () => {
  it('accepts letters, numbers, and spaces in the group name', () => {
    const result = newGroupFormSchema.safeParse({ groupName: 'Trip 2026' });

    expect(result.success).toBe(true);
  });

  it('rejects special characters in the group name', () => {
    const result = newGroupFormSchema.safeParse({ groupName: 'Trip! 2026' });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.groupName).toContain('Usá solo letras, números y espacios');
  });

  it('returns Spanish messages for missing group names', () => {
    const result = newGroupFormSchema.safeParse({ groupName: '   ' });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.groupName).toContain('Ingresá un nombre para el grupo');
  });
});

describe('inviteEmailSchema', () => {
  it('normalizes valid emails', () => {
    const result = inviteEmailSchema.safeParse(' Friend@Example.com ');

    expect(result.success).toBe(true);
    expect(result.data).toBe('friend@example.com');
  });

  it('rejects invalid emails', () => {
    const result = inviteEmailSchema.safeParse('not-an-email');

    expect(result.success).toBe(false);
    expect(result.error?.flatten().formErrors).toContain('Ingresá un correo electrónico válido');
  });

  it('returns a Spanish message when the email is empty', () => {
    const result = inviteEmailSchema.safeParse('   ');

    expect(result.success).toBe(false);
    expect(result.error?.flatten().formErrors).toContain('Ingresá un correo electrónico');
  });
});

describe('invitedEmailsSchema', () => {
  it('requires at least one invited email', () => {
    const result = invitedEmailsSchema.safeParse([]);

    expect(result.success).toBe(false);
    expect(result.error?.flatten().formErrors).toContain('Agregá al menos un miembro antes de guardar el grupo');
  });
});
