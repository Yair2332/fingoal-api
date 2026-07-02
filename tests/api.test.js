const request = require('supertest');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/transactions', require('../src/routes/transactionRoutes'));
app.use('/api/habits', require('../src/routes/habitRoutes'));
app.use('/api/goals', require('../src/routes/goalRoutes'));

const MOCK_USER_ID = '3BS6MNoTgJf9KCAnYzzQ';
const EXISTING_HABIT_ID = 'hAhAG4ljv5bsWHbvq4zS';
const EXISTING_GOAL_ID = 'HOojBMrf6Zq3ebKQCn9k';

describe('🧪 Suite de Pruebas de Integración - FinGoal API', () => {
  let tempTransactionId = '';

  describe('Módulo de Transacciones', () => {
    it('POST / - Debería crear una transacción', async () => {
      const res = await request(app).post('/api/transactions').send({
        userId: MOCK_USER_ID, title: "Test", amount: 100, category: "FOOD", type: "EXPENSE"
      });
      expect(res.statusCode).toEqual(201);
      tempTransactionId = res.body.id;
    });

    it('DELETE /:id - Debería eliminar la transacción', async () => {
      const res = await request(app).delete(`/api/transactions/${tempTransactionId}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('Módulo de Hábitos', () => {
    it('PATCH /:id - Debería actualizar datos base', async () => {
      const res = await request(app)
        .patch(`/api/habits/${EXISTING_HABIT_ID}`) // Ruta que existe en habitRoutes
        .send({ title: "Hábito Editado" });
      expect(res.statusCode).toEqual(200);
    });

    it('PATCH /:id/toggle - Debería alternar racha', async () => {
      const res = await request(app).patch(`/api/habits/${EXISTING_HABIT_ID}/toggle`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('Módulo de Metas de Ahorro', () => {
    it('POST /contribution - Debería procesar un aporte', async () => {
      const res = await request(app).post('/api/goals/contribution').send({
        goalId: EXISTING_GOAL_ID, userId: MOCK_USER_ID, amount: 100
      });
      // Si recibes 500, es error interno de Firestore (revisa consola del servidor)
      expect(res.statusCode).toBe(201);
    });

    // IMPORTANTE: Verifica si en goalRoutes tienes router.patch('/:goalId', ...)
    it('PATCH /:id - Debería actualizar meta', async () => {
      const res = await request(app)
        .patch(`/api/goals/${EXISTING_GOAL_ID}`)
        .send({ targetAmount: 850000 });
      expect(res.statusCode).toEqual(200);
    });
  });
});
