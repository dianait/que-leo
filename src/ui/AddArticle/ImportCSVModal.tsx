import { useState, useContext } from "react";
import Modal from "../utils/Modal";
import { ArticleRepositoryContext } from "../../domain/ArticleRepositoryContext";
import { useAuth } from "../../domain/AuthContext";

export function ImportCSVModal({
  onImportSuccess,
}: {
  onImportSuccess?: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState("");

  const repository = useContext(ArticleRepositoryContext);
  const { user } = useAuth();

  const openModal = () => {
    setIsModalOpen(true);
    setCsvText("");
    setImportSuccess(false);
    setImportError("");
  };
  const closeModal = () => setIsModalOpen(false);

  const handleImport = async () => {
    if (!repository || !user) return;
    setImporting(true);
    setImportSuccess(false);
    setImportError("");
    try {
      // Parsear CSV simple: title,url\n...
      const lines = csvText.trim().split(/\r?\n/);
      const rows = lines.map((line) => line.split(","));
      // Si hay cabecera, saltarla
      const dataRows = rows[0][0].toLowerCase().includes("title")
        ? rows.slice(1)
        : rows;
      let count = 0;
      for (const [title, url] of dataRows) {
        if (title && url) {
          await repository.addArticle(title.trim(), url.trim(), user.id);
          count++;
        }
      }
      setImportSuccess(true);
      if (onImportSuccess) onImportSuccess();
      setTimeout(() => setIsModalOpen(false), 1200);
    } catch (e) {
      setImportError("Error al importar artículos. Revisa el formato del CSV.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <button className="app-button import-csv-button" onClick={openModal}>
        Importar CSV
      </button>
      <Modal open={isModalOpen} onClose={closeModal}>
        <h2>Importar artículos desde CSV</h2>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={"title,url\nMi artículo,https://ejemplo.com"}
          rows={8}
          style={{ width: "100%", marginBottom: 12 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="app-button"
            onClick={handleImport}
            disabled={importing || !csvText}
          >
            {importing ? "Importando..." : "Importar"}
          </button>
          <button
            className="app-button"
            onClick={closeModal}
            disabled={importing}
          >
            Cancelar
          </button>
        </div>
        {importSuccess && (
          <div className="success-message">¡Artículos importados!</div>
        )}
        {importError && <div className="error-message">{importError}</div>}
      </Modal>
    </>
  );
}
