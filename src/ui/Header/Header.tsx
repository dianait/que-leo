import { useAuth } from "../../domain/AuthContext";
import "./Header.css";
import { Link } from "react-router-dom";
import { AvatarModal } from "./AvatarModal";
import { AvatarDropdown } from "./AvatarDropdown";
import { useUserArticles } from "./useUserArticles";
import { useState, useRef } from "react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { hasArticles } = useUserArticles();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLElement>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAvatarModalOpen(false);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleAvatarClick = () => {
    // On mobile open modal; on desktop toggle dropdown
    if (window.innerWidth <= 900) {
      setIsAvatarModalOpen(true);
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="header-title-link">
            <h1 className="header-logo-container">
              <img src="/header.png" alt="¿Qué leo? Logo" className="header-logo" />
            </h1>
          </Link>
          <p>Menos decisiones, más lectura.</p>
        </div>

        {user && (
          <div className="header-right">
            <div className="user-info">
              {hasArticles && (
                <Link to="/articulos" className="header-link-nav header-link-my-articles" aria-label="Mis artículos">
                  Mis artículos
                </Link>
              )}
              
              {/* Clickable avatar: dropdown on desktop, modal on mobile */}
              <div className="avatar-container" style={{ position: 'relative' }}>
                {user.user_metadata.avatar_url ? (
                  <button
                    ref={avatarRef as React.RefObject<HTMLButtonElement>}
                    className="avatar-button"
                    onClick={handleAvatarClick}
                    aria-label={`Menú de usuario: ${user.user_metadata.user_name || user.email}`}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                  >
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="user-avatar"
                      title={user.user_metadata.user_name || user.email}
                    />
                  </button>
                ) : (
                  <button
                    ref={avatarRef as React.RefObject<HTMLButtonElement>}
                    className="user-email-button"
                    onClick={handleAvatarClick}
                    aria-label={`Menú de usuario: ${user.user_metadata.user_name || user.email}`}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                  >
                    {user.user_metadata.user_name || user.email}
                  </button>
                )}
                
                {/* Desktop dropdown */}
                <AvatarDropdown
                  isOpen={isDropdownOpen}
                  onClose={closeDropdown}
                  onLogout={handleLogout}
                  userId={user.id || ""}
                  triggerRef={avatarRef}
                />
              </div>
            </div>
          </div>
        )}
        
        <AvatarModal
          isOpen={isAvatarModalOpen}
          onClose={closeAvatarModal}
          onLogout={handleLogout}
          userId={user?.id || ""}
        />
      </div>
    </header>
  );
};
