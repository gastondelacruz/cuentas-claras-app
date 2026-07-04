import { expect, test } from '@playwright/test';

import { installApiMocks, login } from '../fixtures/api';

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
  await login(page);
});

test('lists groups, filters balances, and opens group detail', async ({ page }) => {
  await expect(page.getByText('Viaje a Bariloche')).toBeVisible();

  await page.getByRole('button', { name: 'Me deben' }).click();
  await expect(page.getByText('Viaje a Bariloche')).toBeVisible();

  await page.getByRole('button', { name: /Viaje a Bariloche/ }).click();
  await expect(page.getByText('Gastos Recientes')).toBeVisible();
  await expect(page.getByText('Cena compartida')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Añadir Gasto' })).toBeVisible();
});

test('creates a group with an invited member', async ({ page }) => {
  await page.getByRole('button', { name: 'Crear nuevo grupo' }).click();
  await page.getByLabel('Nombre del grupo').fill('Escapada a Mendoza');
  await page.getByRole('button', { name: 'Tipo de grupo Viaje' }).click();
  await page.getByLabel('Correo del invitado').fill('grace@example.com');
  await page.getByRole('button', { name: 'Invitar miembro' }).click();
  await expect(page.getByText('grace@example.com')).toBeVisible();

  await page.getByRole('button', { name: 'Guardar grupo' }).click();

  await expect(page.getByText('Escapada a Mendoza')).toBeVisible();
});
