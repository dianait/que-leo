import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Obtener la ruta del directorio actual en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer el JSON
const articlesJson = fs.readFileSync(
  "./src/infrastructure/data/eferro.json",
  "utf8"
);
const articles = JSON.parse(articlesJson);

// Crear cabecera CSV
let csv = "title,url,language\n";

// Convertir cada artículo a una línea CSV
articles.forEach((article) => {
  // Escapar comillas y comas en los campos de texto
  const title = `"${(article.Name || "").replace(/"/g, '""')}`;
  const url = `"${(article.Url || "").replace(/"/g, '""')}`;
  const language = `"${(article.Language || "").replace(/"/g, '""')}`;

  // Añadir la línea al CSV
  csv += `${title},${url},${language}\n`;
});

// Guardar el CSV
fs.writeFileSync("eferro.csv", csv);

// Mostrar preview
console.log("CSV generado con éxito en: eferro.csv");
console.log("\nPrimeras 5 líneas:");
console.log(csv.split("\n").slice(0, 6).join("\n"));
