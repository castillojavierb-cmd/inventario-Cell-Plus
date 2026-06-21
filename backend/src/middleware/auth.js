import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔴 No hay token
    if (!authHeader) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // 🔑 Formato: Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // 🔐 Verificar token
    console.log("TOKEN RECIBIDO:", token);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Guardar usuario en request
    req.user = decoded;

    next();

  } catch (error) {
    console.error("ERROR AUTH:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};