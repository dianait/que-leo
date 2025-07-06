import { useAuth } from "../../domain/AuthContext";
import "./Header.css";
import { Link } from "react-router-dom";
import { AvatarModal } from "./AvatarModal";
import { useState } from "react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAvatarModalOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleAvatarClick = () => {
    setIsAvatarModalOpen(true);
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false);
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
              <Link to="/articulos" className="header-link-nav">
                Mis artículos
              </Link>
              {user.user_metadata.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.user_name || "Avatar"}
                  className="user-avatar clickable"
                  title={user.user_metadata.user_name || user.email}
                  onClick={handleAvatarClick}
                />
              ) : (
                <span 
                  className="user-email clickable"
                  onClick={handleAvatarClick}
                >
                  {user.user_metadata.user_name || user.email}
                </span>
              )}
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
