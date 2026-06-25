require('dotenv').config();
const express = require('express');
const cors = require('cors');

const db = require('./config/firebase');

const app = express();

app.use(cors());
app.use(express.json());

// Manejo básico de rutas no encontradas (Próximamente inyectaremos las rutas acá)
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor FinGoal corriendo en http://localhost:${PORT}`);
});