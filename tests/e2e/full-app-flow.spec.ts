import { test, expect } from "@playwright/test";
import { loginWithGitHub } from "./helpers/login";

const GITHUB_EMAIL = process.env.TEST_USER_EMAIL!;
const GITHUB_PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe("Flujo completo de la app: login, artículos, compartir y borrar", () => {
  test("flujo integral usuario real", async ({ page }) => {
    // Login real
    await loginWithGitHub(page, GITHUB_EMAIL, GITHUB_PASSWORD);
    await expect(page.locator(".app-container")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator(".user-info")).toBeVisible();
    await expect(page.getByText("Mis artículos")).toBeVisible();

    // Ir a la lista de artículos
    await page.getByText("Mis artículos").click();
    await expect(page).toHaveURL(/articulos/);
    await expect(page.locator(".articles-table-container")).toBeVisible();

    // Añadir un artículo
    await page.getByRole("button", { name: "+ Nuevo" }).click();
    await expect(page.getByText("Añadir nuevo artículo")).toBeVisible();
    const testTitle = `Artículo de prueba ${Date.now()}`;
    const testUrl = `https://ejemplo.com/${Date.now()}`;
    await page.fill("input#title", testTitle);
    await page.fill("input#url", testUrl);
    await page.getByRole("button", { name: /Añadir artículo/ }).click();
    await expect(
      page.getByText("¡Artículo añadido con éxito!", { exact: false })
    ).toBeVisible();
    await page.waitForTimeout(1200); // Espera a que cierre el modal

    // Buscar el artículo en la tabla
    await expect(page.getByText(testTitle)).toBeVisible();

    // Marcar como leído
    const fila = page.locator(`tr:has-text('${testTitle}')`);
    await fila.getByRole("button", { name: /No leído/ }).click();
    // Esperar popup de compartir
    await expect(page.getByText("¡Genial! 🎉")).toBeVisible();
    await expect(
      page.getByText("¿Quieres compartirlo en tus redes?", { exact: false })
    ).toBeVisible();
    // Compartir en LinkedIn (simular click)
    await page.locator(".share-button.linkedin").click();
    // Cerrar modal de compartir
    await page.locator(".modal-close").click();

    // Borrar el artículo
    await fila.getByRole("button", { name: /Borrar/ }).click();
    await expect(
      page.getByText("¿Borrar artículo?", { exact: false })
    ).toBeVisible();
    await page.getByRole("button", { name: /Borrar definitivamente/ }).click();
    // Esperar toast de éxito
    await expect(
      page.getByText("Artículo borrado correctamente", { exact: false })
    ).toBeVisible();
    // Verificar que ya no está en la tabla
    await expect(page.getByText(testTitle)).not.toBeVisible();
  });
});
