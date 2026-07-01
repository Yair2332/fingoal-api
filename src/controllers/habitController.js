const db = require('../config/firebase');

// Utilidad para comparar fechas
const isSameDay = (timestamp1, timestamp2) => {
    if (!timestamp1) return false;
    const d1 = new Date(timestamp1);
    const d2 = new Date(timestamp2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
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
            // Determinamos si está completado hoy comparando la fecha, no el booleano
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
        const lastCompleted = data.lastCompletedAt ? new Date(data.lastCompletedAt) : null;
        
        // Verificamos si ya estaba completado hoy
        const wasCompletedToday = isSameDay(lastCompleted, now);

        let newCompletedToday, newStreak;

        if (!wasCompletedToday) {
            // ACTIVAR
            newCompletedToday = true;
            
            // Lógica de racha: Si el último fue ayer, suma. Si fue hace más, reinicia a 1.
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            
            if (lastCompleted && isSameDay(lastCompleted, yesterday)) {
                newStreak = (data.streak || 0) + 1;
            } else {
                newStreak = 1;
            }
        } else {
            // DESACTIVAR
            newCompletedToday = false;
            newStreak = Math.max(0, (data.streak || 0) - 1);
        }

        await habitRef.update({ 
            completedToday: newCompletedToday, 
            streak: newStreak, 
            lastCompletedAt: newCompletedToday ? now.getTime() : 0 
        });

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