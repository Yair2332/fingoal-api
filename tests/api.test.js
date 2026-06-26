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

describe('🧪 Suite de Pruebas de Integración Total Actualizada - FinGoal API', () => {
  let tempTransactionId = '';
  const EXISTING_HABIT_ID = 'NWFSnO3dRG2WjcXNiBkC';
  const EXISTING_GOAL_ID = 'Qw3NQr0rgJe3fiYxZgvY';

  // ==================================================
  // 🔹 MÓDULO DE TRANSACCIONES
  // ==================================================
  describe('Módulo de Transacciones', () => {
    it('POST / - Debería crear una transacción correctamente', async () => {
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

    it('POST / - Debería fallar (400) si el amount no es un número válido (Auditoría Anti-NaN)', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          userId: MOCK_USER_ID,
          title: "Gasto Corrupto",
          amount: "esto_no_es_un_numero",
          category: "SERVICES",
          type: "EXPENSE"
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('GET /:userId - Debería listar las transacciones del usuario', async () => {
      const res = await request(app).get(`/api/transactions/${MOCK_USER_ID}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('PATCH /:id - Debería editar parcialmente la transacción (Antes era PUT)', async () => {
      const res = await request(app)
        .patch(`/api/transactions/${tempTransactionId}`)
        .send({ amount: 3000, title: "Gasto de Test Editado" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.amount).toEqual(3000);
    });

    it('PATCH /:id - Debería fallar (400) si se edita con un amount inválido', async () => {
      const res = await request(app)
        .patch(`/api/transactions/${tempTransactionId}`)
        .send({ amount: "invalido" });
      expect(res.statusCode).toEqual(400);
    });

    it('DELETE /:id - Debería eliminar la transacción', async () => {
      const res = await request(app).delete(`/api/transactions/${tempTransactionId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('eliminada con éxito');
    });
  });

  // ==================================================
  // 🔹 MÓDULO DE HÁBITOS
  // ==================================================
  describe('Módulo de Hábitos', () => {
    it('GET /:userId - Debería obtener los hábitos del usuario', async () => {
      const res = await request(app).get(`/api/habits/${MOCK_USER_ID}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('PATCH /:id/complete - Debería procesar la racha basándose en la lógica de tiempo transcurrido', async () => {
      const res = await request(app).patch(`/api/habits/${EXISTING_HABIT_ID}/complete`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('streak');
      expect(res.body.completedToday).toBe(true);
    });

    it('PATCH /:id - Debería actualizar parcialmente los datos base del hábito (Antes era PUT)', async () => {
      const res = await request(app)
        .patch(`/api/habits/${EXISTING_HABIT_ID}`)
        .send({ title: "Hábito de Test Súper Editado" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual("Hábito de Test Súper Editado");
    });
  });

  // ==================================================
  // 🔹 MÓDULO DE METAS / WISHLIST
  // ==================================================
  describe('Módulo de Metas de Ahorro', () => {
    it('GET /:userId - Debería listar las metas de ahorro', async () => {
      const res = await request(app).get(`/api/goals/${MOCK_USER_ID}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /contribution - Debería procesar un aporte mediante transacciones Firestore', async () => {
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

    it('POST /contribution - Debería rechazar un aporte inválido o negativo (400)', async () => {
      const res = await request(app)
        .post('/api/goals/contribution')
        .send({
          goalId: EXISTING_GOAL_ID,
          userId: MOCK_USER_ID,
          amount: -500
        });
      expect(res.statusCode).toEqual(400);
    });

    it('PATCH /:id - Debería actualizar las propiedades de una meta (Antes era PUT)', async () => {
      const res = await request(app)
        .patch(`/api/goals/${EXISTING_GOAL_ID}`)
        .send({ targetAmount: 850000 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.targetAmount).toEqual(850000);
    });

    it('PATCH /:id - Debería denegar actualizaciones con tipos de datos corruptos', async () => {
      const res = await request(app)
        .patch(`/api/goals/${EXISTING_GOAL_ID}`)
        .send({ priority: "no_numerico" });
      expect(res.statusCode).toEqual(400);
    });
  });
});