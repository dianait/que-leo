import { test, expect } from "@playwright/test";
import { loginWithGitHub } from "./helpers/login";

const GITHUB_EMAIL = process.env.TEST_USER_EMAIL!;
const GITHUB_PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe("RandomArticle - Modal de compartir (E2E)", () => {
  test("abre modal con opciones y cierra", async ({ page }) => {
    await loginWithGitHub(page, GITHUB_EMAIL, GITHUB_PASSWORD);

    // En la home se muestra la tarjeta aleatoria
    await expect(page.locator(".random-article-card")).toBeVisible();

    // Abrir compartir
    await page.getByRole("button", { name: /Compartir/ }).click();
    await expect(page.locator(".modal-content")).toBeVisible();
    await expect(page.locator(".share-button.bluesky")).toBeVisible();
    await expect(page.locator(".share-button.linkedin")).toBeVisible();

    // Cerrar
    await page.locator(".modal-close").click();
    await expect(page.locator(".modal-content")).toBeHidden();
  });
});
