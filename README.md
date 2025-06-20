# ¿Qué leo? 📚

Una aplicación para ayudarte a decidir qué leer de tu lista de artículos guardados.

## ¿Por qué existe este proyecto?

Todos tenemos esa lista interminable de artículos técnicos que guardamos con la intención de "leer después"... pero que nunca leemos. Esta aplicación resuelve ese problema sugiriéndote qué leer de tu colección.

## Características actuales

- ✅ Lista de artículos guardados
- ✅ Visualización de título, URL y fecha
- 🔄 Sugerencia de artículo aleatorio (en desarrollo)

## Características futuras

- 📝 Resúmenes de artículos
- 🏷️ Sistema de tags
- ✅ Marcar como leído
- 🔍 Búsqueda y filtros
- 📊 Estadísticas de lectura

## Arquitectura

Este proyecto está construido siguiendo los principios de **Arquitectura Hexagonal** (también conocida como Ports & Adapters), aplicando principios **SOLID** para crear un código mantenible y testeable.

### Estructura del proyecto

```
src/
├── domain/           # Entidades y reglas de negocio
│   └── Article.ts
├── application/      # Casos de uso
│   └── GetRandomArticle.ts
├── infrastructure/   # Adaptadores externos (UI, persistencia, etc.)
│   └── components/
└── architecture/     # Configuración de la arquitectura
```

### Capas de la arquitectura

- **Domain**: Contiene las entidades de negocio y reglas puras, sin dependencias externas
- **Application**: Casos de uso que orquestan la lógica de negocio
- **Infrastructure**: Adaptadores que conectan con el mundo exterior (React UI, APIs, bases de datos)

## Stack tecnológico

- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **SWC** - Compilador rápido para TypeScript

## Instalación y ejecución

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn

### Pasos

1. Clona el repositorio
```bash
git clone https://github.com/dianait/article-reader
cd article-reader
```

2. Instala las dependencias
```bash
npm install
```

3. Ejecuta el proyecto en modo desarrollo
```bash
npm run dev
```

4. Abre tu navegador en `http://localhost:5173`

## Scripts disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## Estado del proyecto

🚧 **En desarrollo activo** - Este proyecto se está desarrollando como práctica de Arquitectura Hexagonal y principios SOLID.

### MVP actual
- [x] Entidad Article definida
- [x] Caso de uso GetRandomArticle
- [x] UI básica para mostrar lista de artículos
- [ ] Botón para obtener artículo aleatorio
- [ ] Persistencia en LocalStorage

### Contribuir
Este es un proyecto de aprendizaje personal, pero si tienes sugerencias o mejoras, ¡son bienvenidas!

### Licencia
MIT License - Siéntete libre de usar este código para tus propios proyectos de aprendizaje.

Nota: Este proyecto forma parte de mi aprendizaje de Arquitectura Hexagonal y principios SOLID. El objetivo es crear software mantenible y bien estructurado, no solo que funcione.
