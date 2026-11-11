# Temperature converter

➡️ **[Open the demo](https://microsoftedge.github.io/Demos/temperature-converter/)** ⬅️

A Progressive Web App (PWA) that converts temperatures.  To start learning to use and develop PWAs, start with this sample.

## Widget para Windows 11

Esta versión incluye un widget PWA para el panel que se abre con `Windows + W`.
El widget se define en `manifest.json`, usa una plantilla Adaptive Card en
`widgets/temperature-template.json` y se actualiza desde `sw.js`.

Para instalarlo en el panel de Widgets:

1. Publica esta carpeta en una dirección HTTPS pública. El widget no se registra
   desde un archivo local ni desde `localhost` mediante PWABuilder.
2. Abre la dirección en Microsoft Edge e instala la aplicación como PWA.
3. En Windows 11, abre el panel con `Windows + W`.
4. Pulsa `+` o **Agregar widgets**, busca **Conversor de temperatura** y agrégalo.

Para realizar pruebas locales también se requiere tener habilitado el modo para
desarrolladores de Windows y el entorno de ejecución de Windows App SDK.

## Microsoft Store y PWABuilder

La PWA incluye iconos PNG de 96 a 512 píxeles, captura promocional de 1280 × 720,
captura del widget de 300 × 304 y metadatos de Store. La dirección permanente es:

`https://leyliperea.github.io/temperature-converter-widget/`

For instructions, see [Temperature convertor sample](https://learn.microsoft.com/microsoft-edge/progressive-web-apps/samples/temperature-converter).


<!-- ====================================================================== -->
## See also

* [Progressive Web Apps (PWAs) documentation](https://learn.microsoft.com/microsoft-edge/progressive-web-apps/landing/)
