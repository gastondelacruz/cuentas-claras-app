import { expect, test } from '@playwright/test';

import { installApiMocks, login } from '../fixtures/api';

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
  await login(page);
});

test('records a shared expense from group detail and shows it in recent expenses', async ({ page }) => {
  await page.getByRole('button', { name: /Viaje a Bariloche/ }).click();
  await page.getByRole('button', { name: 'Añadir Gasto' }).click();

  await page.getByLabel('Monto del gasto').fill('25000');
  await page.getByLabel('Descripción del gasto').fill('Hotel');
  await page.getByRole('button', { name: 'Categoría Transporte' }).click();
  await page.getByRole('button', { name: 'Crear gasto' }).click();

  await expect(page.getByRole('button', { name: 'Editar gasto Hotel' })).toBeVisible();
});

test('keeps shared expense participants selectable on web', async ({ page }) => {
  await page.getByRole('button', { name: /Viaje a Bariloche/ }).click();
  await page.getByRole('button', { name: 'Añadir Gasto' }).click();

  const participant = page.getByRole('checkbox', { name: /Grace Hopper, incluido en el gasto/ });
  await expect(participant).toBeVisible();
  await participant.click();
  await expect(page.getByRole('checkbox', { name: /Grace Hopper, excluido del gasto/ })).toBeVisible();
});
