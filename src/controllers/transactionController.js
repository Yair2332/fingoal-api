const db = require('../config/firebase');

// 1. Obtener transacciones de un usuario
exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('Transaction').where('userId', '==', userId).get();
    
    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener transacciones: " + error.message });
  }
};

// 2. Crear una nueva transacción
exports.createTransaction = async (req, res) => {
  try {
    const { userId, title, description, amount, category, type } = req.body;
    
    const parsedAmount = Number(amount);
    if (!userId || !title || isNaN(parsedAmount) || !category || !type) {
      return res.status(400).json({ error: "Faltan campos obligatorios o el monto es inválido" });
    }

    const newTransaction = {
      userId,
      title,
      description: description || "",
      amount: parsedAmount,
      category,
      type,
      createdAt: Date.now()
    };

    const docRef = await db.collection('Transaction').add(newTransaction);
    res.status(201).json({ id: docRef.id, ...newTransaction });
  } catch (error) {
    res.status(500).json({ error: "Error al crear transacción: " + error.message });
  }
};

// 3. Actualizar una transacción existente (Parcial - PATCH)
exports.updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { title, description, amount, category, type } = req.body;
    
    const txRef = db.collection('Transaction').doc(transactionId);
    const doc = await txRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount)) return res.status(400).json({ error: "El monto debe ser numérico" });
      updatedData.amount = parsedAmount;
    }
    
    if (category !== undefined) updatedData.category = category;
    if (type !== undefined) updatedData.type = type;

    await txRef.update(updatedData);
    res.status(200).json({ id: transactionId, ...updatedData, message: "Transacción actualizada con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la transacción: " + error.message });
  }
};

// 4. Eliminar una transacción
exports.deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const txRef = db.collection('Transaction').doc(transactionId);
    const doc = await txRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }

    await txRef.delete();
    res.status(200).json({ id: transactionId, message: "Transacción eliminada con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la transacción: " + error.message });
  }
};