import React from "react";
import { useAuth } from "../../domain/AuthContext";
import "./Header.css";

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>📚 ¿Qué leo?</h1>
          <p>Menos decisiones, más lectura.</p>
        </div>

        {user && (
          <div className="header-right">
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="logout-button"
                title="Cerrar sesión"
              >
                🚪 Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
