import { useRef, useEffect } from "react";
import "./AvatarDropdown.css";

interface AvatarDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
}

export const AvatarDropdown = ({
  isOpen,
  onClose,
  onLogout,
  userId,
  triggerRef,
}: AvatarDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div className="avatar-dropdown" ref={dropdownRef}>
      <div className="dropdown-arrow"></div>
      <div className="dropdown-content">
        <button className="dropdown-item logout-item" onClick={onLogout}>
          <svg
            className="dropdown-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M5 5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-2H5V5zm16 7l-4-4v3H9v2h8v3l4-4z" />
          </svg>
          Salir
        </button>
        <a
          href={`https://t.me/QueLeoBot?start=${userId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="dropdown-item telegram-item"
        >
          <svg
            className="dropdown-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
          </svg>
          Vincular con Telegram
        </a>
      </div>
    </div>
  );
};
