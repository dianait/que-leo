import { test, expect } from "@playwright/test";

test.describe("Extracción automática de metadatos", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación
    await page.goto("http://localhost:5173/");

    // Esperar a que la aplicación cargue
    await page.waitForSelector('button:has-text("+ Nuevo")');
  });

  test("debería extraer metadatos automáticamente al añadir artículo con URL", async ({
    page,
  }) => {
    // Interceptar la llamada al endpoint de metadatos
    await page.route("**/api/extract-metadata*", async (route) => {
      const url = route.request().url();
      const testUrl = "https://www.mozilla.org";

      if (url.includes(encodeURIComponent(testUrl))) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              title: "Mozilla - Internet for people, not profit (US)",
              description: "Mozilla es una organización sin fines de lucro",
              language: "en",
              authors: ["Mozilla Team"],
              topics: ["technology", "privacy"],
              featuredimage:
                "https://www.mozilla.org/media/img/m24/og.3a69dffad83e.png",
            },
            url: testUrl,
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Interceptar la llamada a Supabase para verificar que se envían los metadatos
    let supabaseCallData: any = null;
    await page.route("**/rest/v1/articles2*", async (route) => {
      if (route.request().method() === "POST") {
        const postData = route.request().postData();
        if (postData) {
          supabaseCallData = JSON.parse(postData);
        }
      }
      await route.continue();
    });

    // Hacer clic en el botón "Nuevo"
    await page.click('button:has-text("+ Nuevo")');

    // Esperar a que aparezca el modal
    await page.waitForSelector("form.add-article-form");

    // Ingresar URL
    await page.fill('input[type="url"]', "https://www.mozilla.org");

    // Enviar formulario
    await page.click('button:has-text("Añadir artículo 📚")');

    // Esperar a que se complete la operación
    await page.waitForSelector(".success-message", { timeout: 10000 });

    // Verificar que se mostró el mensaje de éxito
    await expect(page.locator(".success-message")).toContainText(
      "¡Artículo añadido con éxito!"
    );

    // Verificar que se llamó al endpoint de metadatos
    // (esto se verifica implícitamente por el mock de la ruta)

    // Verificar que se enviaron los metadatos a Supabase
    expect(supabaseCallData).toBeTruthy();
    expect(supabaseCallData[0]).toMatchObject({
      title: "Mozilla - Internet for people, not profit (US)",
      url: "https://www.mozilla.org",
      language: "en",
      authors: ["Mozilla Team"],
      topics: ["technology", "privacy"],
      featured_image:
        "https://www.mozilla.org/media/img/m24/og.3a69dffad83e.png",
    });
  });

  test("debería usar título del usuario si está disponible", async ({
    page,
  }) => {
    // Interceptar la llamada al endpoint de metadatos
    await page.route("**/api/extract-metadata*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            title: "Título Extraído Automáticamente",
            description: null,
            language: "es",
            authors: ["Autor Test"],
            topics: ["tecnología"],
            featuredimage: null,
          },
          url: "https://example.com",
        }),
      });
    });

    // Interceptar la llamada a Supabase
    let supabaseCallData: any = null;
    await page.route("**/rest/v1/articles2*", async (route) => {
      if (route.request().method() === "POST") {
        const postData = route.request().postData();
        if (postData) {
          supabaseCallData = JSON.parse(postData);
        }
      }
      await route.continue();
    });

    // Hacer clic en el botón "Nuevo"
    await page.click('button:has-text("+ Nuevo")');

    // Esperar a que aparezca el modal
    await page.waitForSelector("form.add-article-form");

    // Ingresar URL y título personalizado
    await page.fill('input[type="url"]', "https://example.com");
    await page.fill(
      'input[placeholder*="Se extraerá automáticamente"]',
      "Mi Título Personalizado"
    );

    // Enviar formulario
    await page.click('button:has-text("Añadir artículo 📚")');

    // Esperar a que se complete la operación
    await page.waitForSelector(".success-message", { timeout: 10000 });

    // Verificar que se envió el título del usuario, no el extraído
    expect(supabaseCallData).toBeTruthy();
    expect(supabaseCallData[0].title).toBe("Mi Título Personalizado");
    expect(supabaseCallData[0].language).toBe("es");
    expect(supabaseCallData[0].authors).toEqual(["Autor Test"]);
  });

  test("debería continuar sin metadatos si falla la extracción", async ({
    page,
  }) => {
    // Interceptar la llamada al endpoint de metadatos para que falle
    await page.route("**/api/extract-metadata*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Internal Server Error",
        }),
      });
    });

    // Interceptar la llamada a Supabase
    let supabaseCallData: any = null;
    await page.route("**/rest/v1/articles2*", async (route) => {
      if (route.request().method() === "POST") {
        const postData = route.request().postData();
        if (postData) {
          supabaseCallData = JSON.parse(postData);
        }
      }
      await route.continue();
    });

    // Hacer clic en el botón "Nuevo"
    await page.click('button:has-text("+ Nuevo")');

    // Esperar a que aparezca el modal
    await page.waitForSelector("form.add-article-form");

    // Ingresar URL y título
    await page.fill('input[type="url"]', "https://example.com");
    await page.fill(
      'input[placeholder*="Se extraerá automáticamente"]',
      "Título de Respaldo"
    );

    // Enviar formulario
    await page.click('button:has-text("Añadir artículo 📚")');

    // Esperar a que se complete la operación
    await page.waitForSelector(".success-message", { timeout: 10000 });

    // Verificar que se envió el artículo sin metadatos
    expect(supabaseCallData).toBeTruthy();
    expect(supabaseCallData[0].title).toBe("Título de Respaldo");
    expect(supabaseCallData[0].language).toBeNull();
    expect(supabaseCallData[0].authors).toBeNull();
    expect(supabaseCallData[0].topics).toBeNull();
    expect(supabaseCallData[0].featured_image).toBeNull();
  });

  test("debería agregar https:// automáticamente si la URL no tiene protocolo", async ({
    page,
  }) => {
    // Interceptar la llamada al endpoint de metadatos
    await page.route("**/api/extract-metadata*", async (route) => {
      const url = route.request().url();

      // Verificar que se agregó https://
      expect(url).toContain(encodeURIComponent("https://example.com"));

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            title: "Test Article",
            description: null,
            language: "en",
            authors: [],
            topics: [],
            featuredimage: null,
          },
          url: "https://example.com",
        }),
      });
    });

    // Hacer clic en el botón "Nuevo"
    await page.click('button:has-text("+ Nuevo")');

    // Esperar a que aparezca el modal
    await page.waitForSelector("form.add-article-form");

    // Ingresar URL sin protocolo
    await page.fill('input[type="url"]', "example.com");

    // Enviar formulario
    await page.click('button:has-text("Añadir artículo 📚")');

    // Esperar a que se complete la operación
    await page.waitForSelector(".success-message", { timeout: 10000 });

    // Verificar que se mostró el mensaje de éxito
    await expect(page.locator(".success-message")).toContainText(
      "¡Artículo añadido con éxito!"
    );
  });
});
