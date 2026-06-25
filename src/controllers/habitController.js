const db = require('../config/firebase');

// 1. Obtener hábitos de un usuario
exports.getHabits = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('Habit').where('userId', '==', userId).get();
    
    const habits = [];
    snapshot.forEach(doc => {
      habits.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener hábitos: " + error.message });
  }
};

// 2. Marcar hábito como completado hoy (Actualiza racha)
exports.completeHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const habitRef = db.collection('Habit').doc(habitId);
    const doc = await habitRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Hábito no encontrado" });
    }

    const habitData = doc.data();
    const currentStreak = parseInt(habitData.streak, 10) || 0;
    const newStreak = habitData.completedToday ? currentStreak : (currentStreak + 1);

    await habitRef.update({
      completedToday: true,
      streak: newStreak,
      lastCompletedAt: Date.now()
    });

    res.status(200).json({ id: habitId, completedToday: true, streak: newStreak });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el hábito: " + error.message });
  }
};

// 3. Editar datos base de un hábito
exports.updateHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { title, description, frequency, isActive } = req.body;
    
    const habitRef = db.collection('Habit').doc(habitId);
    const doc = await habitRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Hábito no encontrado" });
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (frequency !== undefined) updatedData.frequency = frequency;
    if (isActive !== undefined) updatedData.isActive = isActive;

    await habitRef.update(updatedData);
    res.status(200).json({ id: habitId, ...updatedData, message: "Hábito modificado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al editar el hábito: " + error.message });
  }
};

// 4. Eliminar un hábito
exports.deleteHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const habitRef = db.collection('Habit').doc(habitId);
    const doc = await habitRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Hábito no encontrado" });
    }

    await habitRef.delete();
    res.status(200).json({ id: habitId, message: "Hábito eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar the hábito: " + error.message });
  }
};