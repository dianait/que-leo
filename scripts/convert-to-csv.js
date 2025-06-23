import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener la ruta del directorio actual en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer el JSON
const articlesJson = fs.readFileSync('./src/infrastructure/data/articles.json', 'utf8');
const articles = JSON.parse(articlesJson);

// Crear cabecera CSV
let csv = 'id,title,url,created_at\n';

// Convertir cada artículo a una línea CSV
articles.forEach((article, index) => {
  // Usar índice + 1 para asegurar IDs secuenciales
  const id = index + 1;
  
  // Escapar comillas y comas en los campos de texto
  const title = `"${article.title.replace(/"/g, '""')}"`;
  const url = `"${article.url.replace(/"/g, '""')}"`;
  const createdAt = `"${article.created_at}"`;
  
  // Añadir la línea al CSV
  csv += `${id},${title},${url},${createdAt}\n`;
});

// Guardar el CSV
fs.writeFileSync('articles_for_supabase.csv', csv);

// Mostrar preview
console.log('CSV generado con éxito en: articles_for_supabase.csv');
console.log('\nPrimeras 5 líneas:');
console.log(csv.split('\n').slice(0, 6).join('\n'));
