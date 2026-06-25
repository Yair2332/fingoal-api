const request = require('supertest');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/transactions', require('../src/routes/transactionRoutes'));
app.use('/api/habits', require('../src/routes/habitRoutes'));
app.use('/api/goals', require('../src/routes/goalRoutes'));

const MOCK_USER_ID = 'mVUP3VPwuuE9VIFMXkH3'; // Thiago Lezcano

describe('🧪 Suite de Pruebas de Integración Total - FinGoal API', () => {
  let tempTransactionId = '';
  let tempHabitId = '';
  let tempGoalId = '';

  // ==================================================
  // 🔹 MÓDULO DE TRANSACCIONES (CRUD Completo)
  // ==================================================
  describe('Módulo de Transacciones', () => {
    it('POST / - Debería crear una transacción', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          userId: MOCK_USER_ID,
          title: "Gasto de Test Automatizado",
          amount: 2500,
          category: "SERVICES",
          type: "EXPENSE"
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      tempTransactionId = res.body.id;
    });

    it('GET /:userId - Debería listar las transacciones del usuario', async () => {
      const res = await request(app).get(`/api/transactions/${MOCK_USER_ID}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('PUT /:id - Debería editar la transacción', async () => {
      const res = await request(app)
        .put(`/api/transactions/${tempTransactionId}`)
        .send({ amount: 3000, title: "Gasto de Test Editado" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.amount).toEqual(3000);
    });

    it('DELETE /:id - Debería eliminar la transacción', async () => {
      const res = await request(app).delete(`/api/transactions/${tempTransactionId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('eliminada con éxito');
    });
  });

  // ==================================================
  // 🔹 MÓDULO DE HÁBITOS (CRUD Completo + Acciones)
  // ==================================================
  describe('Módulo de Hábitos', () => {
    // Nota: Como no creamos un POST público de hábitos en los controladores, 
    // usamos el ID existente de tu BD (NWFSnO3dRG2WjcXNiBkC) para probar el ciclo completo de edición.
    const EXISTING_HABIT_ID = 'NWFSnO3dRG2WjcXNiBkC';

    it('GET /:userId - Debería obtener los hábitos del usuario', async () => {
      const res = await request(app).get(`/api/habits/${MOCK_USER_ID}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('PATCH /:id/complete - Debería marcar un hábito como completado e incrementar racha', async () => {
      const res = await request(app).patch(`/api/habits/${EXISTING_HABIT_ID}/complete`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('streak');
      expect(res.body.completedToday).toBe(true);
    });

    it('PUT /:id - Debería actualizar los datos base del hábito', async () => {
      const res = await request(app)
        .put(`/api/habits/${EXISTING_HABIT_ID}`)
        .send({ title: "Hábito de Test Súper Editado", frequency: "DAILY" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual("Hábito de Test Súper Editado");
    });
  });

  // ==================================================
  // 🔹 MÓDULO DE METAS / WISHLIST (CRUD Completo + Transacciones)
  // ==================================================
  describe('Módulo de Metas de Ahorro', () => {
    const EXISTING_GOAL_ID = 'Qw3NQr0rgJe3fiYxZgvY'; // Tu Notebook Gamer

    it('GET /:userId - Debería listar las metas de ahorro', async () => {
      const res = await request(app).get(`/api/goals/${MOCK_USER_ID}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /contribution - Debería inyectar un aporte usando transacciones atómicas', async () => {
      const res = await request(app)
        .post('/api/goals/contribution')
        .send({
          goalId: EXISTING_GOAL_ID,
          userId: MOCK_USER_ID,
          amount: 1500
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain('Aporte registrado con éxito');
    });

    it('PUT /:id - Debería editar las propiedades de una meta', async () => {
      const res = await request(app)
        .put(`/api/goals/${EXISTING_GOAL_ID}`)
        .send({ targetAmount: 850000, priority: 1 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.targetAmount).toEqual(850000);
    });
  });
});