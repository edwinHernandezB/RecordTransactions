# Record Transactions con Expo

## Aplicación principal

Este proyecto Expo es la aplicación principal de Record Transactions. La versión web
anterior se retiró; la interfaz nativa y la lógica de negocio viven aquí. Las pantallas
y componentes están en `src/`, y las reglas compartidas de movimientos y saldos en
`src/finance.js`.

La versión Expo incluye:

- Registro de gastos e ingresos, categorías personalizadas y abonos a cuentas.
- Iconos por categoría en selectores, resúmenes e historial; las categorías nuevas
  reciben automáticamente un icono relacionado con su nombre o uno genérico.
- Cuentas de ahorro con edición de nombre/saldo, objetivos y retiros validados.
- Resumen del periodo, principales gastos, avisos de presupuesto y avance de límites.
- Historial con búsqueda y filtros por fechas y tipo; edición y eliminación de movimientos. Los filtros abren en el mes actual, permiten navegar por meses y elegir rangos personalizados con el calendario.
- Reglas recurrentes semanales, mensuales o anuales, con generación automática al
  abrir la app o volver a ella.
- Exportación e importación JSON de movimientos, categorías, cuentas y recurrencias.
- Persistencia local con AsyncStorage y navegación nativa por pestañas.

Para trasladar datos anteriores, importa en Copias de seguridad un archivo JSON que
hayas exportado previamente. La importación solicita confirmación antes de reemplazar
movimientos y cuentas; las categorías se combinan con las que ya existen.
La exportación web descarga el archivo directamente. En Android, la primera
exportación solicita elegir una carpeta y las siguientes guardan allí directamente.
La interfaz aplica safe area en los bordes superior e inferior para evitar que el
contenido se solape con las barras del sistema en Android con diseño edge-to-edge.

## React web y React Native: diferencias

React es la biblioteca para componentes, estado y composición. React Native utiliza
React, pero dibuja controles nativos en lugar de HTML:

| React web anterior | React Native |
| --- | --- |
| `div`, `button`, `input`, `select` | `View`, `Pressable`, `TextInput`, controles nativos |
| CSS y hojas `.css` | `StyleSheet.create` y propiedades de estilo en JavaScript |
| DOM y eventos web | Árbol nativo y eventos táctiles |
| `localStorage` | AsyncStorage para preferencias y datos pequeños; SQLite para datos relacionales o de mayor volumen |
| React Router / URL | Navegación móvil, habitualmente Expo Router o React Navigation |
| Capacitor empaqueta una web dentro de una vista web | React Native renderiza componentes nativos; Expo gestiona módulos nativos y herramientas |

La lógica de negocio y los modelos de datos pueden reutilizarse si no dependen del
DOM, CSS, almacenamiento web o APIs exclusivas del navegador. La interfaz de la
versión web sí debe reescribirse con componentes nativos.

## Qué hace Expo

Expo es un conjunto de herramientas y servicios construido sobre React Native.
El paquete `expo` proporciona el entorno de desarrollo, configuración, Metro y
compatibilidad entre módulos nativos. `npx expo install paquete` selecciona una
versión compatible con el SDK del proyecto.

- **Expo Go:** permite probar durante el desarrollo con el QR de `npx expo start`;
  no requiere compilar una app propia para comenzar.
- **Development build:** una app de desarrollo propia para probar módulos nativos
  que no estén incluidos en Expo Go.
- **EAS Build:** servicio opcional en la nube para producir APK/AAB o IPA.
- **Prebuild:** genera los proyectos nativos Android/iOS a partir de la
  configuración Expo. No hace falta mantenerlos manualmente al usar el flujo
  administrado; Android e iOS se pueden regenerar.

## Instalación y comandos

Requisitos: Node.js LTS, npm, un teléfono con Expo Go o un emulador Android. Para
compilar Android localmente también se necesita Android Studio/Android SDK y un JDK
compatible con la versión de React Native.

Desde la carpeta del proyecto Expo, instala las dependencias y arranca el servidor:

```powershell
cd record-transactions-expo
npm install
npx expo start
```

Escanea el QR con Expo Go. Para arrancar en un emulador Android ya iniciado:

```powershell
npm run android
```

Comprobaciones de configuración y empaquetado JavaScript para Android:

```powershell
npx expo-doctor
npx expo export --platform android
```

Compilación nativa local de depuración (genera `android/` ignorado por Git):

```powershell
npx expo prebuild --platform android
cd android
.\gradlew.bat assembleDebug
```

El APK se genera en `android\app\build\outputs\apk\debug\app-debug.apk`.
También se puede iniciar la compilación y despliegue al emulador con
`npx expo run:android`.

Para distribuir sin mantener la compilación local, instalar EAS CLI, iniciar
sesión y configurar el proyecto:

```powershell
npm install --global eas-cli
eas login
eas build:configure
eas build --platform android
```

EAS Build requiere cuenta Expo y conexión a Internet.

## Alcance de la migración

La versión web no se modifica y puede seguir utilizándose mientras se valida la app
nativa. Expo no puede leer automáticamente el `localStorage` del contenedor
Capacitor, por lo que el traslado de datos se realiza mediante el archivo JSON de
copia de seguridad. Antes de sustituir la versión web, importa una copia real en un
dispositivo de prueba y comprueba movimientos, saldos, categorías, límites y reglas
recurrentes.

La pantalla de categorías muestra el gasto o ingreso por categoría y sus límites con
barras de progreso nativas. La navegación usa pestañas nativas; la interfaz no usa
HTML, CSS web ni React Router.
