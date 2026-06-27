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



// 3. Editar datos base de un hábito (Parcial - PATCH)
exports.updateHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    console.log("DEBUG: Intentando actualizar ID: ", habitId);
    console.log("DEBUG: Datos recibidos en body: ", req.body);
    
    const habitRef = db.collection('Habit').doc(habitId);
    const doc = await habitRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Hábito no encontrado" });
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (frequency !== undefined) updatedData.frequency = frequency;
    if (isActive !== undefined) updatedData.isActive = Object.prototype.toString.call(isActive) === '[object Boolean]' ? isActive : isActive === 'true';

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
    res.status(500).json({ error: "Error al eliminar el hábito: " + error.message });
  }
};

// 5. Crear un nuevo hábito
exports.createHabit = async (req, res) => {
  try {
    const { userId, title, description, frequency } = req.body;

    const newHabit = {
      userId,
      title,
      description,
      frequency,
      isActive: true,
      streak: 0,
      completedToday: false,
      lastCompletedAt: 0,
      createdAt: Date.now()
    };

    const docRef = await db.collection('Habit').add(newHabit);
    
    res.status(201).json({ id: docRef.id, ...newHabit, message: "Hábito creado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el hábito: " + error.message });
  }
};


exports.toggleHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const habitRef = db.collection('Habit').doc(habitId);
    const doc = await habitRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Hábito no encontrado" });

    const habitData = doc.data();
    const isCurrentlyCompleted = habitData.completedToday;

    if (!isCurrentlyCompleted) {
      // --- LÓGICA DE COMPLETAR (MARCAR COMO TRUE) ---
      const now = Date.now();
      const lastCompleted = habitData.lastCompletedAt || 0;
      const unDiaEnMs = 24 * 60 * 60 * 1000;
      const diasDesdeUltimoLog = (now - lastCompleted) / unDiaEnMs;

      let currentStreak = parseInt(habitData.streak, 10) || 0;
      let newStreak = currentStreak;

      // Si pasó menos de un día y ya fue completado, no sumamos racha.
      // Si pasó entre 1 y 2 días, extendemos. Más de 2 días, reiniciamos.
      if (lastCompleted === 0 || diasDesdeUltimoLog > 2) {
        newStreak = 1;
      } else if (diasDesdeUltimoLog >= 1 && diasDesdeUltimoLog <= 2) {
        newStreak = currentStreak + 1;
      }

      await habitRef.update({
        completedToday: true,
        streak: newStreak,
        lastCompletedAt: now
      });
      res.status(200).json({ id: habitId, completedToday: true, streak: newStreak });

    } else {
      // --- LÓGICA DE DESMARCAR (MARCAR COMO FALSE) ---
      // Aquí podrías decidir si quieres revertir la racha o simplemente poner en false
      await habitRef.update({
        completedToday: false
        // Opcional: Podrías revertir lastCompletedAt si guardas el valor anterior
      });
      res.status(200).json({ id: habitId, completedToday: false, streak: habitData.streak });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al alternar el hábito: " + error.message });
  }
};