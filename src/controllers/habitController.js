const db = require('../config/firebase');


const isSameDay = (timestamp1, timestamp2) => {
    const d1 = new Date(timestamp1);
    const d2 = new Date(timestamp2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

exports.getHabits = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('Habit').where('userId', '==', userId).get();
        const now = new Date();
        const habits = [];
        const updatePromises = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            // Reseteo automático si detectamos que es un nuevo día
            if (data.completedToday && data.lastCompletedAt && !isSameDay(data.lastCompletedAt, now)) {
                updatePromises.push(db.collection('Habit').doc(doc.id).update({ completedToday: false }));
                data.completedToday = false; 
            }
            habits.push({ id: doc.id, ...data });
        });

        await Promise.all(updatePromises);
        res.status(200).json(habits);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener: " + error.message });
    }
};



// 3. Editar datos base de un hábito (Parcial - PATCH)
exports.updateHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    // --- CORRECCIÓN AQUÍ ---
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
    if (isActive !== undefined) {
        updatedData.isActive = typeof isActive === 'boolean' ? isActive : (isActive === 'true');
    }

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
        const habitRef = db.collection("Habit").doc(habitId);
        const doc = await habitRef.get();

        if (!doc.exists) return res.status(404).json({ error: "No encontrado" });

        const data = doc.data();
        const now = new Date();
        const lastCompleted = data.lastCompletedAt ? new Date(data.lastCompletedAt) : null;

        // --- LAZY RESET: Limpiar antes de procesar ---
        if (data.completedToday && lastCompleted && !isSameDay(lastCompleted, now)) {
            await habitRef.update({ completedToday: false, streak: data.streak }); 
            data.completedToday = false;
        }

        // --- LÓGICA DE TOGGLE ---
        if (!data.completedToday) {
            // ACTIVAR
            let newStreak = data.streak || 0;
            if (!lastCompleted || !isSameDay(lastCompleted, now)) {
                // Si el último registro fue ayer, incrementamos; si fue hace más, reiniciamos
                const diffDays = (now - lastCompleted) / (1000 * 60 * 60 * 24);
                newStreak = (lastCompleted && diffDays < 2) ? newStreak + 1 : 1;
            }

            await habitRef.update({ completedToday: true, streak: newStreak, lastCompletedAt: now.getTime() });
            return res.status(200).json({ completedToday: true, streak: newStreak });
        } else {
            // DESACTIVAR
            let newStreak = data.streak > 0 ? data.streak - 1 : 0;
            await habitRef.update({ completedToday: false, streak: newStreak });
            return res.status(200).json({ completedToday: false, streak: newStreak });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};