const db = require('../config/firebase');

exports.getHabits = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('Habit').where('userId', '==', userId).get();
    
    const now = new Date();
    const todayStr = now.toDateString(); // Formato: "Sat Jun 27 2026"
    
    const habits = [];
    
    // Usamos un array de promesas para poder hacer los updates si es necesario
    const updatePromises = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const lastCompleted = data.lastCompletedAt ? new Date(data.lastCompletedAt) : null;
      
      // Si estaba completado pero la última vez fue un día distinto al de hoy
      if (data.completedToday && lastCompleted && lastCompleted.toDateString() !== todayStr) {
        // Marcamos como falso en la base de datos
        updatePromises.push(
          db.collection('Habit').doc(doc.id).update({ completedToday: false })
        );
        data.completedToday = false; // Actualizamos el objeto local para la respuesta
      }
      
      habits.push({ id: doc.id, ...data });
    });

    // Esperamos a que los reseteos en la DB se guarden
    await Promise.all(updatePromises);
    
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener hábitos: " + error.message });
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

    if (!doc.exists) {
      return res.status(404).json({ error: "Hábito no encontrado" });
    }

    const data = doc.data();
    const now = new Date();
    
    // Normalizamos la fecha de hoy a las 00:00:00 para comparar solo el día
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const lastCompleted = data.lastCompletedAt && data.lastCompletedAt !== 0
        ? new Date(data.lastCompletedAt)
        : null;

    const lastCompletedDate = lastCompleted
      ? new Date(
          lastCompleted.getFullYear(),
          lastCompleted.getMonth(),
          lastCompleted.getDate()
        )
      : null;

    // ===========================
    // MARCAR (Activar)
    // ===========================
    if (!data.completedToday) {
      let newStreak = data.streak || 0;

      if (!lastCompletedDate) {
        // Primera vez que se marca
        newStreak = 1;
      } else {
        const diffDays = (today - lastCompletedDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          // Ayer se completó, incrementamos
          newStreak++;
        } else if (diffDays > 1) {
          // Se perdió la racha, reiniciamos a 1
          newStreak = 1;
        }
        // Si diffDays === 0, ya se marcó hoy, no hacemos nada extra
      }

      await habitRef.update({
        completedToday: true,
        streak: newStreak,
        lastCompletedAt: now.getTime()
      });

      return res.status(200).json({
        completedToday: true,
        streak: newStreak
      });
    }

    // ===========================
    // DESMARCAR (Desactivar)
    // ===========================
    // Si lo desmarcamos hoy, debemos decrementar la racha 
    // siempre y cuando haya sido la racha generada por "hoy".
    let newStreak = data.streak || 0;
    
    if (lastCompletedDate && lastCompletedDate.getTime() === today.getTime()) {
        newStreak = Math.max(0, newStreak - 1);
    }

    await habitRef.update({
      completedToday: false,
      streak: newStreak
      // Opcional: podrías actualizar lastCompletedAt al día anterior aquí si fuera necesario
    });

    return res.status(200).json({
      completedToday: false,
      streak: newStreak
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
};