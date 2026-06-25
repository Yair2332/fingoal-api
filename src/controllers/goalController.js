const db = require('../config/firebase');

// 1. Obtener todas las metas de un usuario
exports.getGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('Goal').where('userId', '==', userId).get();
    
    const goals = [];
    snapshot.forEach(doc => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las metas: " + error.message });
  }
};

// 2. Registrar un aporte económico a una meta (Usa transacciones de Firestore)
exports.addContribution = async (req, res) => {
  try {
    const { goalId, userId, amount } = req.body;

    if (!goalId || !userId || !amount) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const goalRef = db.collection('Goal').doc(goalId);
    const contributionRef = db.collection('GoalContribution').doc();

    await db.runTransaction(async (transaction) => {
      const goalDoc = await transaction.get(goalRef);
      if (!goalDoc.exists) {
        throw new Error("La meta no existe");
      }

      const newCurrentAmount = goalDoc.data().currentAmount + Number(amount);
      const isCompleted = newCurrentAmount >= goalDoc.data().targetAmount;

      transaction.update(goalRef, { 
        currentAmount: newCurrentAmount,
        status: isCompleted ? "COMPLETED" : "ACTIVE"
      });

      transaction.set(contributionRef, {
        goalId,
        userId,
        amount: Number(amount),
        createdAt: Date.now()
      });
    });

    res.status(201).json({ message: "Aporte registrado con éxito en la meta" });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar el aporte: " + error.message });
  }
};

// 3. Editar una meta de ahorro
exports.updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { name, description, targetAmount, priority, status, localImagePath } = req.body;
    
    const goalRef = db.collection('Goal').doc(goalId);
    const doc = await goalRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Meta no encontrada" });
    }

    const updatedData = {};
    if (name !== undefined) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;
    if (targetAmount !== undefined) updatedData.targetAmount = Number(targetAmount);
    if (priority !== undefined) updatedData.priority = Number(priority);
    if (status !== undefined) updatedData.status = status;
    if (localImagePath !== undefined) updatedData.localImagePath = localImagePath;

    await goalRef.update(updatedData);
    res.status(200).json({ id: goalId, ...updatedData, message: "Meta modificada con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la meta: " + error.message });
  }
};

// 4. Eliminar una meta de ahorro
exports.deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const goalRef = db.collection('Goal').doc(goalId);
    const doc = await goalRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Meta no encontrada" });
    }

    await goalRef.delete();
    res.status(200).json({ id: goalId, message: "Meta eliminada con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la meta: " + error.message });
  }
};