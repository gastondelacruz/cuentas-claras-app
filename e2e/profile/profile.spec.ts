import { expect, test } from '@playwright/test';

import { installApiMocks, login } from '../fixtures/api';

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
  await login(page);
});

test('shows profile data and logs out', async ({ page }) => {
  await page.getByText('Perfil').click();

  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await expect(page.getByText('ada@example.com')).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByText('Iniciar Sesión').first()).toBeVisible();
});
