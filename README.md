# 🚀 FinGoal API

¡Bienvenido a la API de **FinGoal**! Este es el backend del ecosistema FinGoal, una plataforma diseñada para ayudar a los usuarios a gestionar sus transacciones financieras, registrar hábitos y alcanzar sus metas de ahorro. 

Construido con **Node.js**, **Express** y **Firebase Firestore** como base de datos en tiempo real.

---

## 🛠️ Tecnologías Utilizadas

*   **Node.js**: Entorno de ejecución para JavaScript.
*   **Express**: Framework web para la creación de la API REST.
*   **Firebase Admin SDK**: Integración con Firestore Cloud Database.
*   **CORS**: Intercambio de recursos de origen cruzado habilitado.
*   **Dotenv**: Gestión de variables de entorno de forma segura.

---

## 📂 Arquitectura del Proyecto

El proyecto sigue un patrón de arquitectura limpio dividiendo las responsabilidades en rutas, controladores y configuraciones:

```text
├── config/
│   └── firebase.js          # Configuración y conexión a Firestore
├── controllers/
│   ├── authController.js    # Lógica de autenticación (Registro/Login)
│   └── transactionController.js # Lógica de negocio para transacciones
├── routes/
│   ├── authRoutes.js        # Endpoints de autenticación
│   ├── transactionRoutes.js # Endpoints de transacciones
│   ├── habitRoutes.js       # Endpoints de hábitos 
│   └── goalRoutes.js        # Endpoints de metas 
├── .env                     # Variables de entorno 
├── server.js                # Punto de entrada de la aplicación
└── package.json             # Dependencias y scripts del proyecto
---
```
## 🚀 Ejecución Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/fingoal-api.git
cd fingoal-api
```

---

### 2. Instalar las dependencias

```bash
npm install
```

---

### 3. Configurar Firebase

Crear una carpeta llamada `config` (si no existe) y agregar el archivo de credenciales de Firebase (por ejemplo `serviceAccountKey.json`) o configurar las credenciales mediante variables de entorno, según cómo esté implementado `firebase.js`.

Además, crear un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
PORT=3000
```

> **Importante:** Nunca subas el archivo de credenciales de Firebase ni el `.env` al repositorio. Asegúrate de incluirlos en el `.gitignore`.

---

### 4. Ejecutar el servidor

Modo producción:

```bash
npm start
```

Modo desarrollo (requiere `nodemon`):

```bash
npm run dev
```

Si todo está configurado correctamente, la API estará disponible en:

```text
http://localhost:3000
```

---

### 5. Verificar que la API funciona

Puedes probar los endpoints utilizando herramientas como:

- Postman
- Insomnia
- Thunder Client (Visual Studio Code)

Por ejemplo, para registrar un usuario:

```
POST http://localhost:3000/api/auth/register
```

O iniciar sesión:

```
POST http://localhost:3000/api/auth/login
```

---

## 📜 Scripts disponibles

| Comando | Descripción |
|----------|-------------|
| `npm install` | Instala las dependencias del proyecto. |
| `npm start` | Inicia el servidor en modo producción. |
| `npm run dev` | Inicia el servidor en modo desarrollo con recarga automática (nodemon). |
