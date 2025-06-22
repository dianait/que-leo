import React, { useState } from "react";
import { useAuth } from "../../domain/AuthContext";
import "./Auth.css";

export const LoginForm: React.FC = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithGitHub } = useAuth();

  const handleGitHubLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGitHub();
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Bienvenido a "¿Qué leo?"</h2>
        <p className="auth-subtitle">
          Inicia sesión para guardar y gestionar tus artículos.
        </p>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleGitHubLogin}
          className="auth-button github-button"
          disabled={loading}
        >
          {loading ? "Redirigiendo..." : "🐙 Entrar con GitHub"}
        </button>

        <p className="auth-footer">
          Tu próximo gran artículo está a solo un clic de distancia.
        </p>
      </div>
    </div>
  );
};
