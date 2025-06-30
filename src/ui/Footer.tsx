import "./Footer.css";

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span className="footer-title">¿Qué leo?</span>
        <a
          href="https://github.com/dianait/que-leo"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          GitHub
        </a>
        <span className="footer-madeby">
          Hecho con <span className="footer-heart">♥</span> por Dianait
        </span>
      </div>
    </footer>
  );
}
