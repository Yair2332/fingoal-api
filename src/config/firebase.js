const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

let db;

try {
  let serviceAccount;

  // Si existe la variable en la nube (Railway), la parseamos directamente
  if (process.env.FIREBASE_CREDENTIALS_JSON && process.env.FIREBASE_CREDENTIALS_JSON.trim() !== "") {
    console.log("☁️ Cargando credenciales desde la variable de entorno (Producción)...");
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
  } else {
    
    console.log("💻 Cargando credenciales locales (Desarrollo)...");
    const credentialsPath = path.join(__dirname, '../../firebase-credentials.json');
    serviceAccount = require(credentialsPath);
  }
  
  // Inicialización única y limpia
  initializeApp({
    credential: cert(serviceAccount)
  });
  
  console.log("🔥 Conexión con Firebase Firestore establecida con éxito.");
} catch (error) {
  console.error("❌ Error al conectar con Firebase:", error.message || error);
  process.exit(1); 
}

db = getFirestore();

module.exports = db;