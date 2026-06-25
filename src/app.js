const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Inyección de Rutas
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));

// Manejo básico de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor FinGoal corriendo en http://localhost:${PORT}`);
});