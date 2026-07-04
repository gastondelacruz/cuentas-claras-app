import { expect, test } from '@playwright/test';

import { installApiMocks, login, register } from '../fixtures/api';

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
});

test('validates login input before calling the API', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await expect(page.getByText('Ingresá un email válido')).toBeVisible();
  await expect(page.getByText('La contraseña debe tener al menos 8 caracteres')).toBeVisible();
});

test('logs in and loads the authenticated group dashboard', async ({ page }) => {
  await login(page);

  await expect(page.getByText('Viaje a Bariloche')).toBeVisible();
  await expect(page.getByText('Balance Neto Total')).toBeVisible();
});

test('validates registration input before calling the API', async ({ page }) => {
  await page.goto('/');

  await page.getByText('Registrarse').first().click();
  await page.getByRole('button', { name: 'Registrarse' }).click();

  await expect(page.getByText('El nombre debe tener al menos 2 caracteres')).toBeVisible();
  await expect(page.getByText('Ingresá un email válido')).toBeVisible();
  await expect(page.getByText('La contraseña debe tener al menos 8 caracteres')).toBeVisible();
});

test('registers a new user and enters the app', async ({ page }) => {
  await register(page);

  await expect(page.getByText('Viaje a Bariloche')).toBeVisible();
});
