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

    const data = doc.data();
    const now = new Date();
    // Normalizamos a medianoche para comparar solo fechas
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastCompleted = data.lastCompletedAt ? new Date(data.lastCompletedAt) : null;
    const lastCompletedDate = lastCompleted ? new Date(lastCompleted.getFullYear(), lastCompleted.getMonth(), lastCompleted.getDate()) : null;

    if (!data.completedToday) {
      // --- LÓGICA DE MARCAR ---
      let newStreak = data.streak || 0;
      
      if (!lastCompletedDate) {
        newStreak = 1;
      } else {
        const diffDays = (today - lastCompletedDate) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          newStreak += 1; // Ayer lo completó, racha suma
        } else if (diffDays > 1) {
          newStreak = 1; // Pasaron más de 24h desde el último día, se rompió
        }
        // Si diffDays === 0, ya fue completado hoy, no hacemos nada extra
      }

      await habitRef.update({ completedToday: true, streak: newStreak, lastCompletedAt: now.getTime() });
      res.status(200).json({ completedToday: true, streak: newStreak });
    } else {
      // --- LÓGICA DE DESMARCAR ---
      // Si desmarca hoy, deberíamos volver al estado anterior (o dejarlo en 0 streak si fue el único día)
      await habitRef.update({ completedToday: false });
      res.status(200).json({ completedToday: false, streak: data.streak });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};