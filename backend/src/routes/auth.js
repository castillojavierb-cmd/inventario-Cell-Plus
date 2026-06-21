const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

// Usuario (solo prueba)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // validar usuario
  if (email !== userDB.email) {
    return res.status(400).json({ error: "Usuario no encontrado" });
  }

  // validar contraseña
  if (!valid) {
    return res.status(400).json({ error: "Contraseña incorrecta" });
  }

  // 🎟️ crear token
  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({
    token,
    user: { email }
  });
});

module.exports = router;