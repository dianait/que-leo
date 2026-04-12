![¿Qué leo? Header](./public/header.png)

> **Descubre qué leer de tu lista de artículos guardados**

![¿Qué leo? App](./screenshots/app.png)

## 🎯 ¿Qué resuelve?

Todos tenemos esa lista interminable de artículos técnicos que guardamos con la intención de "leer después"... pero que nunca leemos. **¿Qué leo?** resuelve ese problema sugiriéndote qué leer de tu colección de forma aleatoria.

### ✨ Características principales

- 🔄 **Selección aleatoria**: Descubre artículos olvidados en tu lista
- 📱 **Integración con Telegram**: Guarda artículos fácilmente desde tu móvil
- 👤 **Autenticación con GitHub**: Login seguro y rápido
- 📊 **Gestión completa**: Añade, elimina y marca artículos como leídos

## 📱 Integración con Telegram

### ¿Cómo funciona?

1. **Vincula tu cuenta**: Haz clic en "Vincular con Telegram" en la app web
2. **Autoriza el bot**: El bot de Telegram te pedirá autorización
3. **Envía enlaces**: Manda cualquier URL al bot y se guardará automáticamente
4. **¡Listo!**: Tus artículos aparecerán en la app web

### 💡 Casos de uso

- 📖 **Lectura móvil**: Encuentras un artículo interesante navegando desde el móvil
- 🚇 **Tiempo muerto**: Guarda artículos durante el trayecto en transporte público
- 💬 **Compartir**: Envía enlaces desde chats de Telegram directamente a tu lista

## 🤝 Contribuir

¡Las Pull Requests son más que bienvenidas! 🎉

Este es un proyecto de aprendizaje personal, pero si encuentras algún bug, tienes sugerencias de mejora o quieres añadir nuevas funcionalidades, ¡no dudes en abrir un issue o enviar una PR!

Todas las contribuciones son valoradas y ayudan a mejorar la experiencia de todos los usuarios.

---

## 🛡️ Supabase/Postgres Best Practices

### Environment Variables

1. **Never commit real secrets**. Usa `.env.example` como plantilla y añade `.env` a `.gitignore`.
2. Variables requeridas:
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`
	- (Opcional para desarrollo local) `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`

### Seguridad

- Activa [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security) en todas las tablas.
- Nunca expongas claves de servicio en el frontend.
- Solo usa la anon key en el navegador.

### Migraciones & Esquema

- Usa la [Supabase CLI](https://supabase.com/docs/guides/cli) para migraciones y desarrollo local.
- Mantén tu esquema en control de versiones (ver carpeta `/supabase` si existe).
- Documenta cualquier cambio SQL manual.

### Conexión & Pooling

- Usa el cliente oficial `@supabase/supabase-js`.
- Para SSR/Node, usa connection pooling (ver docs de Supabase).

### Manejo de errores

- Siempre revisa `.error` en las respuestas de Supabase y maneja los errores de forma amigable.

### Testing

- Usa un proyecto o esquema separado de Supabase para tests.

---

Consulta `.env.example` para la configuración de entorno.

Más información: [Supabase Postgres Best Practices](https://supabase.com/docs/guides/database/database-best-practices).

---

**Desarrollado con ❤️ para resolver el problema universal de la lista infinita de artículos por leer**
