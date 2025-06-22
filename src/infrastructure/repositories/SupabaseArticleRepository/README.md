# Supabase Article Repository

Este repositorio implementa la interfaz `ArticleRepository` usando Supabase como base de datos.

## Configuración

Para usar este repositorio, necesitas configurar las siguientes variables de entorno:

1. Crea un archivo `.env` en la raíz del proyecto
2. Añade las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

## Estructura de la base de datos

La tabla `articles` en Supabase debe tener la siguiente estructura:

```sql
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  dateAdded TIMESTAMP WITH TIME ZONE NOT NULL
);
```

## Uso

```typescript
import { SupabaseArticleRepository } from "./infrastructure/repositories/SupabaseArticleRepository";

const repository = SupabaseArticleRepository.getInstance();
const articles = await repository.getAllArticles();
```

## Características

- ✅ Implementa la interfaz `ArticleRepository`
- ✅ Manejo de errores robusto
- ✅ Configuración centralizada
- ✅ Ordenamiento por fecha de creación (más reciente primero)
- ✅ Tipado completo con TypeScript
- ✅ Patrón singleton para evitar múltiples instancias
