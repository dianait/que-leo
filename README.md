# ¿Qué leo? 📚

Una aplicación para gestionar y descubrir qué leer de tu lista de artículos guardados.

![¿Qué leo? App](./screenshots/app.png)

## Descripción

Todos tenemos esa lista interminable de artículos técnicos que guardamos con la intención de "leer después"... pero que nunca leemos.
Esta aplicación resuelve ese problema sugiriéndote qué leer de tu colección.

Este proyecto es una forma de poner en práctica lo aprendido sobre Arquitectura hexagonal gracias al curso de Codely "Arquitecture Hexagonal en el front"

### Licencia

MIT License - Siéntete libre de usar este código para tus propios proyectos de aprendizaje.

## Vinculación con Telegram y guardado desde el móvil

Ahora puedes vincular tu cuenta con Telegram para guardar artículos fácilmente desde tu móvil o cualquier dispositivo donde uses Telegram.

- En la app web, haz clic en el botón "Vincular con Telegram" (debajo de "Dame otro").
- Se abrirá un chat con el bot de Telegram, que te pedirá autorizar la vinculación.
- Una vez vinculado, podrás enviar enlaces al bot y se guardarán automáticamente en tu lista de artículos.
- ¡Ideal para guardar lecturas interesantes que encuentres navegando desde el móvil!

## Extensión de navegador

La carpeta `extension/` contiene el código fuente de una extensión Chrome/Edge/Brave para guardar artículos directamente desde cualquier página web en tu base de datos Supabase.

- Incluye manifest, popup y lógica para capturar la URL y el título de la página.
- Permite guardar el artículo en tu cuenta autenticada.
