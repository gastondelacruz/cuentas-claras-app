import { expect, test } from '@playwright/test';

import { installApiMocks, login } from '../fixtures/api';

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
  await login(page);
  await page.getByText('Gastos').click();
});

test('shows personal expenses, switches to income, and applies range filters', async ({ page }) => {
  await expect(page.getByText('Gastos Recientes')).toBeVisible();
  await expect(page.getByText('Comida')).toBeVisible();

  await page.getByRole('tab', { name: 'Ver ingresos personales' }).click();
  await expect(page.getByText('Ingresos Recientes')).toBeVisible();

  await page.getByRole('button', { name: 'Filtro Mes' }).click();
  await expect(page.getByText(/jul|jun|ago/i)).toBeVisible();
});

test('creates an expense personal transaction', async ({ page }) => {
  await page.getByRole('button', { name: 'Añadir transacción personal' }).click();
  await page.getByLabel('Monto de la transacción personal').fill('12000');
  await page.getByLabel('Descripción').fill('Taxi');
  await page.getByRole('button', { name: 'Categoría Alimentación' }).click();
  await page.getByRole('button', { name: 'Añadir transacción' }).click();

  await expect(page.getByText('Alimentación').first()).toBeVisible();
  await expect(page.getByText('- 12.000 $')).toBeVisible();
});

test('creates an income personal transaction', async ({ page }) => {
  await page.getByRole('tab', { name: 'Ver ingresos personales' }).click();
  await page.getByRole('button', { name: 'Añadir transacción personal' }).click();
  await page.getByRole('tab', { name: 'Añadir ingreso personal' }).click();
  await page.getByLabel('Monto de la transacción personal').fill('90000');
  await page.getByLabel('Descripción').fill('Freelance');
  await page.getByRole('button', { name: 'Categoría Salario' }).click();
  await page.getByRole('button', { name: 'Añadir ingreso' }).click();

  await expect(page.getByText('Salario').first()).toBeVisible();
  await expect(page.getByText('+ 90.000 $')).toBeVisible();
});
