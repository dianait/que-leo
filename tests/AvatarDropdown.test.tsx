import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { User } from "@supabase/supabase-js";

import { AvatarDropdown } from "../src/ui/Header/AvatarDropdown";

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

// Crear un elemento DOM mock para el triggerRef
const mockElement = document.createElement("div");

const defaultProps = {
  isOpen: false,
  onClose: jest.fn(),
  onLogout: jest.fn(),
  userId: mockUser.id,
  triggerRef: { current: mockElement },
};

describe("AvatarDropdown", () => {
  test("no se renderiza cuando isOpen es false", () => {
    render(<AvatarDropdown {...defaultProps} />);

    expect(screen.queryByText("Salir")).not.toBeInTheDocument();
    expect(screen.queryByText("Vincular con Telegram")).not.toBeInTheDocument();
  });

  test("se renderiza cuando isOpen es true", () => {
    render(<AvatarDropdown {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Salir")).toBeInTheDocument();
    expect(screen.getByText("Vincular con Telegram")).toBeInTheDocument();
  });

  test("llama a onLogout cuando se hace click en Salir", () => {
    const onLogout = jest.fn();
    render(
      <AvatarDropdown {...defaultProps} isOpen={true} onLogout={onLogout} />
    );

    fireEvent.click(screen.getByText("Salir"));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test("el enlace de Telegram tiene la URL correcta", () => {
    render(<AvatarDropdown {...defaultProps} isOpen={true} />);

    const telegramLink = screen.getByText("Vincular con Telegram");
    expect(telegramLink).toHaveAttribute(
      "href",
      "https://t.me/QueLeoBot?start=123-test-user"
    );
    expect(telegramLink).toHaveAttribute("target", "_blank");
    expect(telegramLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("tiene la clase CSS correcta para el dropdown", () => {
    render(<AvatarDropdown {...defaultProps} isOpen={true} />);

    const dropdown = screen.getByText("Salir").closest(".avatar-dropdown");
    expect(dropdown).toBeInTheDocument();
  });

  test("tiene la flecha del dropdown", () => {
    render(<AvatarDropdown {...defaultProps} isOpen={true} />);

    const arrow = document.querySelector(".dropdown-arrow");
    expect(arrow).toBeInTheDocument();
  });

  test("los elementos tienen las clases CSS correctas", () => {
    render(<AvatarDropdown {...defaultProps} isOpen={true} />);

    const logoutButton = screen.getByText("Salir");
    const telegramLink = screen.getByText("Vincular con Telegram");

    expect(logoutButton).toHaveClass("dropdown-item", "logout-item");
    expect(telegramLink).toHaveClass("dropdown-item", "telegram-item");
  });
});
