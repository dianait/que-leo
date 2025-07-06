import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { User } from "@supabase/supabase-js";

import { AvatarModal } from "../src/ui/Header/AvatarModal";

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

const defaultProps = {
  isOpen: false,
  onClose: jest.fn(),
  onLogout: jest.fn(),
  userId: mockUser.id,
};

describe("AvatarModal", () => {
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

    fireEvent.click(screen.getByRole("button", { name: "✕" }));

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

  test("el enlace de Telegram tiene la URL correcta", () => {
    render(<AvatarModal {...defaultProps} isOpen={true} />);

    const telegramLink = screen.getByText("📲 Vincular con Telegram");
    expect(telegramLink).toHaveAttribute(
      "href",
      expect.stringContaining("123-test-user")
    );
    expect(telegramLink).toHaveAttribute("target", "_blank");
    expect(telegramLink).toHaveAttribute("rel", "noopener noreferrer");
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
