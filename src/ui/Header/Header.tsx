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
    // En móvil abre el modal, en desktop abre el dropdown
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
            <div className="header-logo-container">
              <img src="/header.png" alt="¿Qué leo? Logo" className="header-logo" />
            </div>
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
              
              {/* Avatar clickeable con dropdown en desktop y modal en móvil */}
              <div className="avatar-container" style={{ position: 'relative' }}>
                {user.user_metadata.avatar_url ? (
                  <img
                    ref={avatarRef as React.RefObject<HTMLImageElement>}
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.user_name || "Avatar"}
                    className="user-avatar clickable"
                    title={user.user_metadata.user_name || user.email}
                    onClick={handleAvatarClick}
                  />
                ) : (
                  <span 
                    ref={avatarRef as React.RefObject<HTMLSpanElement>}
                    className="user-email clickable"
                    onClick={handleAvatarClick}
                  >
                    {user.user_metadata.user_name || user.email}
                  </span>
                )}
                
                {/* Dropdown para desktop */}
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
