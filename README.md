# ¿Qué leo? 📚

Una aplicación moderna para gestionar y descubrir qué leer de tu lista de artículos guardados.

![¿Qué leo? App](./screenshots/app.png)

## Descripción

Todos tenemos esa lista interminable de artículos técnicos que guardamos con la intención de "leer después"... pero que nunca leemos. Esta aplicación resuelve ese problema sugiriéndote qué leer de tu colección, con una interfaz limpia y fácil de usar inspirada en modernos editores de código.

## Arquitectura

Este proyecto está organizado siguiendo los principios de la Arquitectura Hexagonal (también conocida como Puertos y Adaptadores), con las siguientes capas:

- **Domain**: Entidades y reglas de negocio centrales
- **Application**: Casos de uso de la aplicación
- **Infrastructure**: Implementaciones técnicas y adaptadores
- **UI**: Componentes de interfaz de usuario

Para más detalles sobre la implementación y validación de la arquitectura hexagonal, consulta la [documentación de arquitectura](./docs/HEXAGONAL_ARCHITECTURE.md).

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


### Licencia

MIT License - Siéntete libre de usar este código para tus propios proyectos de aprendizaje.
