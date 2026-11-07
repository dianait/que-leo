import "@testing-library/jest-dom";
import React from "react";
import {
  render as rtlRender,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { User } from "@supabase/supabase-js";

import { AvatarModal } from "../src/ui/Header/AvatarModal";
import { AuthContext, type AuthContextType } from "../src/domain/AuthContext";
import { createMockAuthContext } from "./setup";

const render = (
  ui: React.ReactElement,
  auth: Partial<AuthContextType> = {}
) =>
  rtlRender(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={createMockAuthContext(auth)}>
        {children}
      </AuthContext.Provider>
    ),
  });

const LINK_URL = "https://t.me/queleo_bot?start=codigo-de-prueba";

const mockTab = () => {
  const tab = { opener: {}, location: { href: "" }, close: jest.fn() };
  jest.spyOn(window, "open").mockReturnValue(tab as unknown as Window);
  return tab;
};

const mockUser = {
  id: "123-test-user",
  email: "test@example.com",
  user_metadata: {
    user_name: "Test User",
    avatar_url: "https://example.com/avatar.jpg",
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: "2023-01-01T00:00:00Z",
} as User;
void mockUser;

const defaultProps = {
  isOpen: false,
  onClose: jest.fn(),
  onLogout: jest.fn(),
};

describe("AvatarModal", () => {
  afterEach(() => jest.restoreAllMocks());

  test("no se renderiza cuando isOpen es false", () => {
    render(<AvatarModal {...defaultProps} />);

    expect(screen.queryByText("Opciones de usuario")).not.toBeInTheDocument();
  });

  test("se renderiza cuando isOpen es true", () => {
    render(<AvatarModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Opciones de usuario")).toBeInTheDocument();
  });

  test("muestra las opciones de salir y vincular con Telegram", () => {
    render(<AvatarModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("🚪 Salir")).toBeInTheDocument();
    expect(screen.getByText("📲 Vincular con Telegram")).toBeInTheDocument();
  });

  test("llama a onLogout cuando se hace click en Salir", () => {
    const onLogout = jest.fn();
    render(<AvatarModal {...defaultProps} isOpen={true} onLogout={onLogout} />);

    fireEvent.click(screen.getByText("🚪 Salir"));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test("llama a onClose cuando se hace click en el botón de cerrar", () => {
    const onClose = jest.fn();
    render(<AvatarModal {...defaultProps} isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("llama a onClose cuando se hace click fuera del modal", () => {
    const onClose = jest.fn();
    render(<AvatarModal {...defaultProps} isOpen={true} onClose={onClose} />);

    // Click en el overlay (fuera del modal)
    const overlay = screen.getByTestId("modal-overlay");
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("Vincular con Telegram abre el bot con un código de un solo uso", async () => {
    const tab = mockTab();
    const createTelegramLink = jest.fn().mockResolvedValue(LINK_URL);
    render(<AvatarModal {...defaultProps} isOpen={true} />, { createTelegramLink });

    fireEvent.click(screen.getByText("📲 Vincular con Telegram"));

    await waitFor(() => expect(tab.location.href).toBe(LINK_URL));
    expect(createTelegramLink).toHaveBeenCalledTimes(1);
    expect(tab.opener).toBeNull();
  });

  test("si no se puede crear el enlace, cierra la pestaña y avisa", async () => {
    const tab = mockTab();
    jest.spyOn(console, "error").mockImplementation(() => {});
    const createTelegramLink = jest.fn().mockRejectedValue(new Error("sin red"));
    render(<AvatarModal {...defaultProps} isOpen={true} />, { createTelegramLink });

    fireEvent.click(screen.getByText("📲 Vincular con Telegram"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo crear el enlace"
    );
    expect(tab.close).toHaveBeenCalled();
  });
  test("no llama a onClose cuando se hace click dentro del modal", () => {
    const onClose = jest.fn();
    render(<AvatarModal {...defaultProps} isOpen={true} onClose={onClose} />);

    // Click dentro del modal
    const modalContent = screen.getByTestId("modal-content");
    fireEvent.click(modalContent);

    expect(onClose).not.toHaveBeenCalled();
  });
});
