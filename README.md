# ¿Qué leo? 📚

Una aplicación moderna para gestionar y descubrir qué leer de tu lista de artículos guardados.

![¿Qué leo? App](./screenshots/app.png)

## Descripción

Todos tenemos esa lista interminable de artículos técnicos que guardamos con la intención de "leer después"... pero que nunca leemos. Esta aplicación resuelve ese problema sugiriéndote qué leer de tu colección, con una interfaz limpia y fácil de usar inspirada en modernos editores de código.

## Interfaz

La aplicación cuenta con:

- 🔀 **Sidebar desplegable** con la lista completa de artículos
- 🎲 **Sugerencias aleatorias** para descubrir contenido olvidado
- 📱 **Diseño responsive** que funciona en todos los dispositivos
- 🔗 **Acceso rápido** a los enlaces o búsqueda en Google

## Características futuras

- 📝 Resúmenes de artículos
- 🏷️ Sistema de tags
- ✅ Marcar como leído
- 🔍 Búsqueda y filtros
- 📊 Estadísticas de lectura
- 🌙 Modo oscuro

## Arquitectura

Este proyecto está construido siguiendo los principios de **Arquitectura Hexagonal** (también conocida como Ports & Adapters), aplicando principios **SOLID** para crear un código mantenible y testeable.

### Estructura del proyecto

```
src/
├── domain/           # Entidades y reglas de negocio
│   └── Article.ts
├── application/      # Casos de uso
│   ├── GetAllArticles.ts
│   └── GetRandomArticle.ts
├── infrastructure/   # Adaptadores externos (UI, persistencia, etc.)
│   └── repositories/
│       └── JSONArticleRepository.ts
├── ui/               # Componentes de la interfaz
│   ├── ListOfArticles.tsx
│   └── RandomArticle.tsx
└── data/             # Datos de ejemplo
    └── articles.json
```

### Capas de la arquitectura

- **Domain**: Contiene las entidades de negocio y reglas puras, sin dependencias externas
- **Application**: Casos de uso que orquestan la lógica de negocio
- **Infrastructure**: Adaptadores que conectan con el mundo exterior (repositorios, APIs, bases de datos)
- **UI**: Componentes React que forman la interfaz de usuario

## Stack tecnológico

- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Jest** - Testing framework
- **Testing Library** - Utilidades para testing de componentes

## Ejecución del proyecto

```bash
# Instalación
npm install

# Desarrollo
npm run dev

# Tests
npm test

# Build
npm run build
```

## Estado del proyecto

🚧 **En desarrollo activo** - Este proyecto se está desarrollando como práctica de Arquitectura Hexagonal y principios SOLID.

### MVP actual
- [x] Entidad Article definida
- [x] Caso de uso GetRandomArticle
- [x] UI básica para mostrar lista de artículos
- [x] Botón para obtener artículo aleatorio
- [ ] Persistencia en LocalStorage

### Contribuir
Este es un proyecto de aprendizaje personal, pero si tienes sugerencias o mejoras, ¡son bienvenidas!

### Licencia
MIT License - Siéntete libre de usar este código para tus propios proyectos de aprendizaje.

