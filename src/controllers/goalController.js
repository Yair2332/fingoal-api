const db = require('../config/firebase');

// 1. Obtener todas las metas de un usuario 
exports.getGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('Goal').where('userId', '==', userId).get();
    const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una nueva meta de ahorro
exports.createGoal = async (req, res) => {
  try {
    const {
      userId,
      name,
      description,
      targetAmount,
      priority,
      localImagePath
    } = req.body;

    // Validaciones
    if (!userId || !name || targetAmount === undefined) {
      return res.status(400).json({
        error: "userId, name y targetAmount son obligatorios"
      });
    }

    const parsedTargetAmount = Number(targetAmount);
    const parsedPriority = Number(priority) || 1;

    if (isNaN(parsedTargetAmount) || parsedTargetAmount <= 0) {
      return res.status(400).json({
        error: "targetAmount debe ser un número mayor a 0"
      });
    }

    const newGoal = {
      userId,
      name,
      description: description || "",
      targetAmount: parsedTargetAmount,
      currentAmount: 0,
      priority: parsedPriority,
      status: "ACTIVE",
      localImagePath: localImagePath || "",
      createdAt: Date.now().toString()
    };

    const docRef = await db.collection("Goal").add(newGoal);

    res.status(201).json({
      id: docRef.id,
      ...newGoal,
      message: "Meta creada con éxito"
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al crear la meta: " + error.message
    });
  }
};

// 2. Registrar un aporte económico a una meta (Usa transacciones de Firestore) 
exports.addContribution = async (req, res) => {
  try {
    const { goalId, userId, amount } = req.body;

    const parsedAmount = Number(amount);
    if (!goalId || !userId || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Campos requeridos inválidos o monto debe ser mayor a 0" });
    }

    const goalRef = db.collection('Goal').doc(goalId);
    const contributionRef = db.collection('GoalContribution').doc();

    await db.runTransaction(async (transaction) => {
      const goalDoc = await transaction.get(goalRef);
      if (!goalDoc.exists) {
        throw new Error("La meta no existe");
      }

      const currentAmount = Number(goalDoc.data().currentAmount) || 0;
      const targetAmount = Number(goalDoc.data().targetAmount) || 0;
      
      const newCurrentAmount = currentAmount + parsedAmount;
      const isCompleted = newCurrentAmount >= targetAmount;

      transaction.update(goalRef, { 
        currentAmount: newCurrentAmount,
        status: isCompleted ? "COMPLETED" : "ACTIVE"
      });

      transaction.set(contributionRef, {
        goalId,
        userId,
        amount: parsedAmount,
        createdAt: Date.now()
      });
    });

    res.status(201).json({ message: "Aporte registrado con éxito en la meta" });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar el aporte: " + error.message });
  }
};

// 3. Editar una meta de ahorro (Parcial - PATCH) 
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
    
    if (targetAmount !== undefined) {
      const parsedTarget = Number(targetAmount);
      if (isNaN(parsedTarget)) return res.status(400).json({ error: "targetAmount debe ser un número válido" });
      updatedData.targetAmount = parsedTarget;
    }
    
    if (priority !== undefined) {
      const parsedPriority = Number(priority);
      if (isNaN(parsedPriority)) return res.status(400).json({ error: "priority debe ser un número válido" });
      updatedData.priority = parsedPriority;
    }
    
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


exports.withdrawContribution = async (req, res) => {
  try {
    const { goalId, userId, amount } = req.body;
    const parsedAmount = Number(amount);

    if (!goalId || !userId || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const goalRef = db.collection('Goal').doc(goalId);
    
    await db.runTransaction(async (transaction) => {
      const goalDoc = await transaction.get(goalRef);
      if (!goalDoc.exists) throw new Error("La meta no existe");

      const currentAmount = Number(goalDoc.data().currentAmount) || 0;
      
   
      if (currentAmount < parsedAmount) throw new Error("Fondos insuficientes");

      transaction.update(goalRef, { 
        currentAmount: currentAmount - parsedAmount,
        status: "ACTIVE"
      });
    });

    res.status(200).json({ message: "Retiro exitoso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};