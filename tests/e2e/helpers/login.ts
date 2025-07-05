import { Page } from "@playwright/test";

export async function loginWithGitHub(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("/");
  await page.getByText(/Continuar con GitHub/).click();

  // Espera a la página de GitHub
  await page.waitForURL(/github.com\/login/);

  // Completa el formulario de GitHub
  await page.fill('input[name="login"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('input[name="commit"]');

  // Espera a que aparezca el botón de Authorize si es necesario
  const authorizeButton = page.locator('button[name="authorize"]');
  if (await authorizeButton.isVisible({ timeout: 4000 }).catch(() => false)) {
    await authorizeButton.click();
  }

  // Espera a volver a la app autenticada
  await page.waitForURL(/localhost:5173/, { timeout: 20000 });
}
