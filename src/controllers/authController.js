const db = require('../config/firebase');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
// Registrar Usuario
exports.register = async (req, res) => {
    try {
        // 1. Primero extraemos los datos
        const { email, password } = req.body;

        // 2. Luego validamos que los campos existan
        if (!email || !password) {
            return res.status(400).json({ error: "Email y password requeridos" });
        }

        // 3. Ahora verificamos si ya existe el email en la base de datos
        const userSnapshot = await db.collection('User').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        // 4. Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = {
            email,
            password: hashedPassword,
            createdAt: Date.now()
        };

        const docRef = await db.collection("User").add(newUser);

        res.status(201).json({ 
            id: docRef.id, 
            email: newUser.email, 
            message: "Usuario registrado con éxito" 
        });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar: " + error.message });
    }
};

// Login Usuario
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const snapshot = await db.collection('User').where('email', '==', email).get();
        if (snapshot.empty) return res.status(401).json({ error: "Credenciales inválidas" });

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Verificar contraseña
        const match = await bcrypt.compare(password, userData.password);
        if (!match) return res.status(401).json({ error: "Credenciales inválidas" });

        // Retornamos el ID al loguear exitosamente
        res.status(200).json({ 
            id: userDoc.id, 
            email: userData.email, 
            message: "Login exitoso" 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};