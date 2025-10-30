import { test, expect } from "@playwright/test";
import { loginWithGitHub } from "./helpers/login";

const GITHUB_EMAIL = process.env.TEST_USER_EMAIL!;
const GITHUB_PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe("Filtro de lectura en Artículos (E2E)", () => {
  test("cambia entre Todos / No leídos / Leídos", async ({ page }) => {
    await loginWithGitHub(page, GITHUB_EMAIL, GITHUB_PASSWORD);

    await expect(page.getByText("Mis artículos")).toBeVisible();
    await page.getByText("Mis artículos").click();
    await expect(page).toHaveURL(/articulos/);
    await expect(page.locator(".articles-table-container")).toBeVisible();

    // Asegurar que están los botones
    const todosBtn = page.getByRole("button", { name: /📚 Todos/ });
    const unreadBtn = page.getByRole("button", { name: /📄 No leídos/ });
    const readBtn = page.getByRole("button", { name: /✅ Leídos/ });
    await expect(todosBtn).toBeVisible();
    await expect(unreadBtn).toBeVisible();
    await expect(readBtn).toBeVisible();

    // Cambiar a no leídos
    await unreadBtn.click();
    // Ver que al menos hay filas y contienen "No leído" o que el filtro cambió el estado del botón activo
    await expect(unreadBtn).toHaveClass(/active|success/);

    // Cambiar a leídos
    await readBtn.click();
    await expect(readBtn).toHaveClass(/active|success/);

    // Volver a todos
    await todosBtn.click();
    await expect(todosBtn).toHaveClass(/active|success/);
  });
});
