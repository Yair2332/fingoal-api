const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

let db;

try {
  
  const credentialsPath = path.join(__dirname, '../../firebase-credentials.json');
  
  const serviceAccount = require(credentialsPath);
  
  // Inicializa la app de Firebase
  initializeApp({
    credential: cert(serviceAccount)
  });
  
  console.log("🔥 Conexión con Firebase Firestore establecida con éxito.");
} catch (error) {
  console.error("❌ Error al conectar con Firebase:", error);
  process.exit(1); 
}

db = getFirestore();

module.exports = db;