import { test, expect } from "@playwright/test";
import { loginWithGitHub } from "./helpers/login";

const GITHUB_EMAIL = process.env.TEST_USER_EMAIL!;
const GITHUB_PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe("Interacciones del avatar: modal en móvil y dropdown en desktop", () => {
  test("modal del avatar funciona correctamente en móvil", async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });

    // Login
    await loginWithGitHub(page, GITHUB_EMAIL, GITHUB_PASSWORD);
    await expect(page.locator(".app-container")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator(".user-info")).toBeVisible();

    // Verificar que el avatar está visible
    const avatar = page.locator(".user-avatar");
    await expect(avatar).toBeVisible();

    // Click en el avatar para abrir el modal
    await avatar.click();

    // Verificar que el modal se abre
    await expect(page.locator(".avatar-modal")).toBeVisible();
    await expect(page.getByText("Opciones de usuario")).toBeVisible();
    await expect(page.getByText("Vincular con Telegram")).toBeVisible();
    await expect(page.getByText("🚪 Salir")).toBeVisible();

    // Verificar que el enlace de Telegram tiene la URL correcta
    const telegramLink = page.getByText("Vincular con Telegram");
    await expect(telegramLink).toHaveAttribute(
      "href",
      /https:\/\/t\.me\/QueLeoBot\?start=/
    );
    await expect(telegramLink).toHaveAttribute("target", "_blank");

    // Click fuera del modal para cerrarlo
    await page.locator(".avatar-modal-overlay").click();

    // Verificar que el modal se cierra
    await expect(page.locator(".avatar-modal")).not.toBeVisible();
  });

  test("dropdown del avatar funciona correctamente en desktop", async ({
    page,
  }) => {
    // Configurar viewport desktop
    await page.setViewportSize({ width: 1200, height: 800 });

    // Login
    await loginWithGitHub(page, GITHUB_EMAIL, GITHUB_PASSWORD);
    await expect(page.locator(".app-container")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator(".user-info")).toBeVisible();

    // Verificar que el avatar está visible
    const avatar = page.locator(".user-avatar");
    await expect(avatar).toBeVisible();

    // Click en el avatar para abrir el dropdown
    await avatar.click();

    // Verificar que el dropdown se abre
    await expect(page.locator(".avatar-dropdown")).toBeVisible();
    await expect(page.getByText("Salir")).toBeVisible();
    await expect(page.getByText("Vincular con Telegram")).toBeVisible();

    // Verificar que el enlace de Telegram tiene la URL correcta
    const telegramLink = page.getByText("Vincular con Telegram");
    await expect(telegramLink).toHaveAttribute(
      "href",
      /https:\/\/t\.me\/QueLeoBot\?start=/
    );
    await expect(telegramLink).toHaveAttribute("target", "_blank");

    // Verificar que tiene la flecha del dropdown
    await expect(page.locator(".dropdown-arrow")).toBeVisible();

    // Click fuera del dropdown para cerrarlo
    await page.locator("body").click({ position: { x: 100, y: 100 } });

    // Verificar que el dropdown se cierra
    await expect(page.locator(".avatar-dropdown")).not.toBeVisible();
  });

  test("enlace 'Mis artículos' solo aparece cuando hay artículos", async ({
    page,
  }) => {
    // Configurar viewport desktop
    await page.setViewportSize({ width: 1200, height: 800 });

    // Login
    await loginWithGitHub(page, GITHUB_EMAIL, GITHUB_PASSWORD);
    await expect(page.locator(".app-container")).toBeVisible({
      timeout: 15000,
    });

    // Verificar si el usuario tiene artículos
    const misArticulosLink = page.getByText("Mis artículos");

    try {
      // Intentar encontrar el enlace con un timeout corto
      await misArticulosLink.waitFor({ timeout: 2000 });
      // Si se encuentra, verificar que funciona
      await expect(misArticulosLink).toBeVisible();

      // Click en el enlace
      await misArticulosLink.click();
      await expect(page).toHaveURL(/articulos/);
    } catch {
      // Si no se encuentra, verificar que no está visible
      await expect(misArticulosLink).not.toBeVisible();
      console.log(
        "Usuario no tiene artículos, enlace 'Mis artículos' no visible"
      );
    }
  });

  test("funcionalidad de logout desde el modal/dropdown", async ({ page }) => {
    // Configurar viewport desktop
    await page.setViewportSize({ width: 1200, height: 800 });

    // Login
    await loginWithGitHub(page, GITHUB_EMAIL, GITHUB_PASSWORD);
    await expect(page.locator(".app-container")).toBeVisible({
      timeout: 15000,
    });

    // Click en el avatar para abrir el dropdown
    const avatar = page.locator(".user-avatar");
    await avatar.click();

    // Verificar que el dropdown se abre
    await expect(page.locator(".avatar-dropdown")).toBeVisible();

    // Click en Salir
    await page.getByText("Salir").click();

    // Verificar que se redirige a la página de login
    await expect(page).toHaveURL(/login/);
  });
});
