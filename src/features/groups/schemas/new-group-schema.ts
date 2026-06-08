import { z } from 'zod';

const groupNamePattern = /^[\p{L}\p{N} ]+$/u;

export const inviteMembersRequiredMessage = 'Agregá al menos un miembro antes de guardar el grupo';

export const newGroupFormSchema = z.object({
  groupName: z
    .string()
    .trim()
    .min(1, 'Ingresá un nombre para el grupo')
    .regex(groupNamePattern, 'Usá solo letras, números y espacios'),
});

export const inviteEmailSchema = z
  .string()
  .trim()
  .min(1, 'Ingresá un correo electrónico')
  .email('Ingresá un correo electrónico válido')
  .transform((value) => value.toLowerCase());

export const invitedEmailsSchema = z.array(inviteEmailSchema).min(1, inviteMembersRequiredMessage);

export type NewGroupFormValues = z.infer<typeof newGroupFormSchema>;
