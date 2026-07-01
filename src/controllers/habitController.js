const db = require('../config/firebase');

// UTILIDAD CORREGIDA: Compara solo año, mes y día, ignorando la hora/timezone.
const isSameDay = (timestamp1, timestamp2) => {
    if (!timestamp1 || timestamp1 === 0) return false;
    const d1 = new Date(timestamp1);
    const d2 = new Date(timestamp2);
    return d1.toDateString() === d2.toDateString();
};

// 1. Obtener hábitos (con estado calculado al vuelo)
exports.getHabits = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('Habit').where('userId', '==', userId).get();
        const now = new Date();
        const habits = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            // El servidor recalcula el estado basado en el tiempo actual al momento de la petición
            const completedToday = isSameDay(data.lastCompletedAt, now);
            habits.push({ id: doc.id, ...data, completedToday });
        });

        res.status(200).json(habits);
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
};

// 2. Toggle Hábito (Lógica robusta)
exports.toggleHabit = async (req, res) => {
    try {
        const { habitId } = req.params;
        const habitRef = db.collection("Habit").doc(habitId);
        const doc = await habitRef.get();

        if (!doc.exists) return res.status(404).json({ error: "No encontrado" });

        const data = doc.data();
        const now = new Date();
        
        // Verificamos si estaba completado según la fecha actual
        const wasCompletedToday = isSameDay(data.lastCompletedAt, now);

        let newCompletedToday, newStreak;

        if (!wasCompletedToday) {
            // ACTIVAR
            newCompletedToday = true;
            
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            
            // Si el último completado fue ayer, incrementamos racha
            if (data.lastCompletedAt && isSameDay(data.lastCompletedAt, yesterday)) {
                newStreak = (data.streak || 0) + 1;
            } else {
                // Si fue hace más de un día, reiniciamos racha a 1
                newStreak = 1;
            }
        } else {
            // DESACTIVAR
            newCompletedToday = false;
            newStreak = Math.max(0, (data.streak || 0) - 1);
        }

        // Si desactivamos, lastCompletedAt va a 0 para asegurar que isSameDay siempre de false
        const updatePayload = { 
            completedToday: newCompletedToday, 
            streak: newStreak, 
            lastCompletedAt: newCompletedToday ? now.getTime() : 0 
        };

        await habitRef.update(updatePayload);
        res.status(200).json({ completedToday: newCompletedToday, streak: newStreak });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Crear hábito
exports.createHabit = async (req, res) => {
    try {
        const { userId, title, description, frequency } = req.body;
        const newHabit = {
            userId, title, description, frequency,
            isActive: true, streak: 0, lastCompletedAt: 0,
            createdAt: Date.now()
        };
        const docRef = await db.collection('Habit').add(newHabit);
        res.status(201).json({ id: docRef.id, ...newHabit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Update (Patch básico)
exports.updateHabit = async (req, res) => {
    try {
        const { habitId } = req.params;
        const { title, description, frequency, isActive } = req.body;
        await db.collection('Habit').doc(habitId).update({ title, description, frequency, isActive });
        res.status(200).json({ message: "Éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Delete
exports.deleteHabit = async (req, res) => {
    try {
        await db.collection('Habit').doc(req.params.habitId).delete();
        res.status(200).json({ message: "Eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};