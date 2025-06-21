# Arquitectura Hexagonal en este proyecto

Este proyecto utiliza la arquitectura hexagonal (también conocida como arquitectura de puertos y adaptadores) para organizar su código de manera que las reglas de negocio estén aisladas de las dependencias externas.

## Estructura de capas

La arquitectura hexagonal define cuatro capas principales:

1. **Domain (dominio)**: Contiene las entidades y reglas de negocio fundamentales.
   - Ubicación: `/src/domain/`
   - Puede ser importada por cualquier otra capa.
   - No debe depender de ninguna otra capa.

2. **Application (aplicación)**: Contiene los casos de uso de la aplicación.
   - Ubicación: `/src/application/`
   - Puede importar solamente de `domain`
   - Define lo que la aplicación puede hacer.

3. **Infrastructure (infraestructura)**: Contiene implementaciones técnicas y adaptadores.
   - Ubicación: `/src/infrastructure/`
   - Puede importar de `domain` y `application`
   - Implementa las interfaces definidas en el dominio.

4. **UI (interfaz de usuario)**: Contiene los componentes visuales.
   - Ubicación: `/src/ui/`
   - Puede importar de cualquier otra capa.

## Validación con ESLint

El proyecto incluye el plugin `eslint-plugin-hexagonal-architecture` para validar las dependencias entre capas. La configuración se encuentra en el archivo `eslint.config.js`.

### Estado actual

Actualmente, la regla está **desactivada** por defecto para evitar errores inmediatos debido a la estructura actual del proyecto.

### Cómo habilitar la validación

Para habilitar la validación de arquitectura hexagonal, edita el archivo `eslint.config.js` y modifica esta línea:

```javascript
'hexagonal-architecture/enforce': 'off',
```

Por esta configuración:

```javascript
'hexagonal-architecture/enforce': ['error', {
  sourceRoots: ['src'],
  layers: [
    { name: 'domain', isRoot: true },
    { name: 'application', dependsOn: ['domain'] },
    { name: 'infrastructure', dependsOn: ['domain', 'application'] },
    { name: 'ui', dependsOn: ['domain', 'application', 'infrastructure'] }
  ],
  ignorePatterns: [
    'src/App.tsx',
    'src/main.tsx',
    'src/vite-env.d.ts',
    '**/*.test.tsx',
    '**/tests/**'
  ]
}],
```

### Resolver violaciones de arquitectura

Cuando encuentres un error como este:

```
This import is violating the Hexagonal Architecture dependency rule (application can't import infrastructure)
```

Significa que estás intentando importar desde una capa que no debería ser accesible según las reglas de arquitectura hexagonal. Para resolver este problema:

1. **Identifica la dependencia** que viola la regla
2. **Mueve la definición** a la capa adecuada, o
3. **Define una interfaz** en la capa correcta e implementa esa interfaz en la capa donde actualmente está el código

## Ejemplo: Corrección de dependencia incorrecta

Antes (incorrecto):
```typescript
// En application/GetAllArticles.ts
import { JsonArticleRepository } from "../infrastructure/repositories/JSONArticleRepository";
```

Después (correcto):
```typescript
// En application/GetAllArticles.ts
import type { ArticleRepository } from "../domain/ArticleRepository";
```

## Recursos adicionales

- [Plugin de ESLint para Arquitectura Hexagonal](https://www.npmjs.com/package/eslint-plugin-hexagonal-architecture)
- [Más sobre Arquitectura Hexagonal](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))
