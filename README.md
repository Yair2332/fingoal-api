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
