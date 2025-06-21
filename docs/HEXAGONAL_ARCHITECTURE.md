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
   - Excluida de las reglas de arquitectura hexagonal
   - Organizada libremente según las necesidades de la interfaz de usuario

## Validación con ESLint

El proyecto incluye el plugin `eslint-plugin-hexagonal-architecture` para validar las dependencias entre capas. La configuración se encuentra en el archivo `eslint.config.js`.

### Estado actual

La regla está **activada** y configurada para validar las dependencias entre las capas `domain`, `application` e `infrastructure`. La carpeta `ui` está excluida de la validación.

### Configuración actual

La configuración actual en `eslint.config.js` es la siguiente:

```javascript
'hexagonal-architecture/enforce': ['error', {
  sourceRoots: ['src'],
  layers: [
    { name: 'domain', isRoot: true },
    { name: 'application', dependsOn: ['domain'] },
    { name: 'infrastructure', dependsOn: ['domain', 'application'] }
  ],
  ignorePatterns: [
    'src/App.tsx',
    'src/main.tsx',
    'src/vite-env.d.ts',
    'src/ui/**',
    '**/*.test.tsx',
    '**/tests/**'
  ]
}],
```

Esta configuración significa que:

- La carpeta `domain` puede ser importada por cualquier otra capa
- La carpeta `application` solo puede importar desde `domain`
- La carpeta `infrastructure` puede importar desde `domain` y `application`
- La carpeta `ui` está completamente excluida de las reglas de arquitectura
- Los archivos de pruebas y configuración también están excluidos

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

## Integración con el proceso de desarrollo

### Validación automática al hacer commits

Las reglas de arquitectura hexagonal se validan automáticamente al realizar commits gracias a la integración con Husky y lint-staged. Cada vez que intentas hacer un commit:

1. ESLint se ejecuta en los archivos modificados
2. Las reglas de arquitectura hexagonal se verifican
3. Si hay violaciones, el commit se bloquea hasta que se resuelvan
4. Los tests relacionados con los archivos modificados también se ejecutan

Esta integración asegura que la arquitectura se mantenga correcta a lo largo del tiempo.

### Archivos excluidos de las reglas

Los siguientes archivos están excluidos de las reglas de arquitectura hexagonal:

1. **Archivos de configuración**: Todos los archivos `.config.*`
2. **Archivos de prueba**: Todos los archivos `.test.tsx` y la carpeta `tests/`
3. **Carpeta UI**: Toda la carpeta `src/ui/` y sus subdirectorios
4. **Archivos específicos**: `src/App.tsx`, `src/main.tsx` y `src/vite-env.d.ts`

Estos archivos se pueden organizar libremente sin restricciones de arquitectura.
