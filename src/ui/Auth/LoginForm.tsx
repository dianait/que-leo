import React, { useState } from "react";
import { useAuth } from "../../domain/AuthContext";
import { AUTH_CONFIG } from "../../domain/config/auth";
import "./Auth.css";

export const LoginForm: React.FC = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithGitHub } = useAuth();

  const handleGitHubLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGitHub(AUTH_CONFIG.REDIRECT_URL);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/header.png" alt="¿Qué leo? Logo" className="header-logo" />
          </div>
          <h2>Menos decisiones, más lectura.</h2>
          <p>
            Tu biblioteca personal de artículos. Inicia sesión para descubrir tu
            próxima gran lectura.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleGitHubLogin}
          className="auth-button github-button"
          disabled={loading}
        >
          <img src="/github.svg" alt="GitHub Logo" className="github-logo" />
          <span>{loading ? "Redirigiendo..." : "Continuar con GitHub"}</span>
        </button>

        <p className="auth-footer">
          Al continuar, aceptas que guardemos tu email y nombre de usuario de
          GitHub.
        </p>
      </div>
    </div>
  );
};
