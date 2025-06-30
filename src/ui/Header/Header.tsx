import { useAuth } from "../../domain/AuthContext";
import "./Header.css";
// import { Link } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
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
            {/* <nav className="header-nav">
              <Link to="/articulos" className="header-link">
                Mis artículos
              </Link>
            </nav> */}
            <div className="user-info">
              {user.user_metadata.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.user_name || "Avatar"}
                  className="user-avatar"
                  title={user.user_metadata.user_name || user.email}
                />
              ) : (
                <span className="user-email">
                  {user.user_metadata.user_name || user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
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
