import {
  CreateTelegramLink,
  generateLinkCode,
} from "../src/application/CreateTelegramLink";
import { AuthRepositoryMock } from "./__mocks__/AuthRepositoryMock";

describe("CreateTelegramLink", () => {
  test("guarda el código para el usuario y devuelve el enlace del bot", async () => {
    const repository = new AuthRepositoryMock();
    const useCase = new CreateTelegramLink(repository, () => "codigo-de-prueba");

    const url = await useCase.execute();

    expect(repository.saveTelegramLinkCodeMock).toHaveBeenCalledWith("codigo-de-prueba");
    expect(url).toBe("https://t.me/queleo_bot?start=codigo-de-prueba");
  });

  test("genera códigos aleatorios válidos para el /start de Telegram", () => {
    const a = generateLinkCode();
    const b = generateLinkCode();

    expect(a).toMatch(/^[A-Za-z0-9_-]{24}$/);
    expect(a).not.toBe(b);
  });
});
