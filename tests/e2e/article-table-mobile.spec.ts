import { test, expect } from "@playwright/test";
import { loginWithGitHub } from "./helpers/login";

const GITHUB_EMAIL = process.env.TEST_USER_EMAIL!;
const GITHUB_PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe("Tabla de artículos en móvil", () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12

  test("muestra título + acciones, oculta idioma y autores, y tres filtros visibles", async ({ page }) => {
    await loginWithGitHub(page, GITHUB_EMAIL, GITHUB_PASSWORD);
    await page.getByText("Mis artículos").click();
    await expect(page).toHaveURL(/articulos/);

    // Filtros visibles (tres)
    await expect(page.getByRole("button", { name: /📚 Todos/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /📄 No leídos/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /✅ Leídos/ })).toBeVisible();

    // Cabeceras: Idioma y Autores no visibles
    await expect(page.getByText(/Idioma/i)).toBeHidden();
    await expect(page.getByText(/Autores/i)).toBeHidden();

    // Acciones visibles
    await expect(page.getByText(/Acciones/i)).toBeVisible();

    // Botón nuevo oculto en móvil
    const newButtons = page.locator(".new-button");
    await expect(newButtons).toHaveCount(0);

    // Botones solo icono: el texto de .btn-text no debe ser visible
    const btnTexts = page.locator(".btn-text");
    await expect(btnTexts.first()).toBeHidden();
  });
});


