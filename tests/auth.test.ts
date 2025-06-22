import { SignInWithGitHub } from "../src/application/SignInWithGitHub";
import { SignOut } from "../src/application/SignOut";
import { AuthRepositoryMock } from "./__mocks__/AuthRepositoryMock";

describe("Casos de Uso de Autenticación", () => {
  let authRepository: AuthRepositoryMock;

  beforeEach(() => {
    // Creamos un nuevo mock antes de cada test para asegurar el aislamiento
    authRepository = new AuthRepositoryMock();
  });

  test("El caso de uso SignInWithGitHub debe llamar al repositorio", async () => {
    // Arrange: Preparamos el caso de uso con el repositorio mock
    const signInUseCase = new SignInWithGitHub(authRepository);

    // Act: Ejecutamos el caso de uso
    await signInUseCase.execute();

    // Assert: Verificamos que el método del mock fue llamado exactamente una vez
    expect(authRepository.signInWithGitHubMock).toHaveBeenCalledTimes(1);
  });

  test("El caso de uso SignOut debe llamar al repositorio", async () => {
    // Arrange: Preparamos el caso de uso con el repositorio mock
    const signOutUseCase = new SignOut(authRepository);

    // Act: Ejecutamos el caso de uso
    await signOutUseCase.execute();

    // Assert: Verificamos que el método del mock fue llamado exactamente una vez
    expect(authRepository.signOutMock).toHaveBeenCalledTimes(1);
  });
});
