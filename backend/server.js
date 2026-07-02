import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { verificarToken } from "./src/middleware/auth.js";
import { db } from "./src/config/db.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS);

const app = express();

app.use(cors({
  origin: "https://inventario-cell-plus.netlify.app",
  credentials: true
}));

app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});
console.log("BREVO_USER:", process.env.BREVO_USER);
console.log("BREVO_PASS:", process.env.BREVO_PASS ? "EXISTE" : "NO EXISTE");
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("SMTP listo para enviar correos");
  }
});

/* =========================
   🔐 REGISTRO
========================= */
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [existe] = await db.execute(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (existe.length > 0) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    // 🔐 ENCRIPTAR PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO usuarios (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    res.json({ message: "Usuario creado" });

  } catch (error) {
    console.error("ERROR REGISTER:", error);
    res.status(500).json({ message: "Error servidor" });
  }
});

/* =========================
   🔐 LOGIN
========================= */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario no existe" });
    }

    const user = rows[0];

    // 🔐 COMPARAR HASH
    const passwordCorrecta = await bcrypt.compare(password, user.password);

    if (!passwordCorrecta) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 🔑 CREAR TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("TOKEN CREADO:", token);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error("ERROR LOGIN:", error);
    res.status(500).json({ message: "Error servidor" });
  }
});

/* =========================
  Recuperacion de contraseña
========================= */

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {

    // Buscar usuario
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Correo no registrado"
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await db.execute(
      "INSERT INTO password_resets (email, token) VALUES (?, ?)",
      [email, token]
    );

    const resetLink =
      `https://TU-SITIO-NETLIFY.netlify.app/reset-password/${token}`;

    await transporter.sendMail({
      from: '"Inventario Cell Plus" <cellplus.soporte1@gmail.com>',
      to: email,
      subject: "Recuperación de contraseña",
      html: `
    <h2>Recuperación de contraseña</h2>

    <p>Haz clic en el siguiente enlace:</p>

    <a href="${resetLink}">
      Restablecer contraseña
    </a>
  `
    });

    console.log("TOKEN GENERADO:", token);

    // Aquí luego enviarás el correo

    res.json({
      message: "Correo de recuperación enviado"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error del servidor"
    });
  }
});

/* =========================
   Restablecer Contraseña
========================= */

app.post("/api/reset-password", async (req, res) => {

  const { token, password } = req.body;

  try {

    const [rows] = await db.execute(
      "SELECT * FROM password_resets WHERE token = ?",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Token inválido"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.execute(
      "UPDATE usuarios SET password = ? WHERE email = ?",
      [hash, rows[0].email]
    );

    await db.execute(
      "DELETE FROM password_resets WHERE token = ?",
      [token]
    );

    res.json({
      message: "Contraseña actualizada"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error servidor"
    });
  }
});

/* =========================
   📦 PRODUCTOS
========================= */

// 🔹 GET productos por usuario
app.get("/api/productos", verificarToken, async (req, res) => {

  const usuario_id = req.user.id;

  try {

    const [rows] = await db.execute(
      "SELECT * FROM productos WHERE usuario_id = ?",
      [usuario_id]
    );

    res.json(rows);

  } catch (error) {
    console.error("ERROR GET PRODUCTOS:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔹 CREAR producto
app.post("/api/productos", verificarToken, async (req, res) => {
  let { nombre, categoria, cantidad, precio, usuario_id } = req.body;

  try {
    if (!nombre || !categoria || cantidad == null || precio == null || !usuario_id) {
      return res.status(400).json({ message: "Campos incompletos" });
    }

    cantidad = parseInt(cantidad);
    precio = parseFloat(precio);

    if (isNaN(cantidad) || isNaN(precio)) {
      return res.status(400).json({ message: "Cantidad o precio inválido" });
    }

    const [result] = await db.execute(
      "INSERT INTO productos (nombre, categoria, cantidad, precio, usuario_id) VALUES (?, ?, ?, ?, ?)",
      [nombre, categoria, cantidad, precio, usuario_id]
    );

    res.json({
      id: result.insertId,
      nombre,
      categoria,
      cantidad,
      precio,
      usuario_id
    });

  } catch (error) {
    console.error("ERROR POST PRODUCTO:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔹 ACTUALIZAR producto
app.put("/api/productos/:id", verificarToken, async (req, res) => {
  const { id } = req.params;
  let { nombre, categoria, cantidad, precio } = req.body;

  try {
    if (!nombre || !categoria) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    cantidad = parseInt(cantidad);
    precio = parseFloat(precio);

    const [result] = await db.execute(
      "UPDATE productos SET nombre=?, categoria=?, cantidad=?, precio=? WHERE id=?",
      [nombre, categoria, cantidad, precio, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto actualizado" });

  } catch (error) {
    console.error("ERROR UPDATE:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔹 ELIMINAR producto
app.delete("/api/productos/:id", verificarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      "DELETE FROM productos WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado" });

  } catch (error) {
    console.error("ERROR DELETE:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔹 ELIMINAR productos por categoría
app.delete("/api/productos/categoria/:nombre", verificarToken, async (req, res) => {
  const { nombre } = req.params;
  const usuario_id = req.user.id;

  try {
    const [result] = await db.execute(
      "DELETE FROM productos WHERE LOWER(TRIM(categoria)) = LOWER(TRIM(?)) AND usuario_id = ?",
      [nombre, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encontraron productos en esa categoría" });
    }

    res.json({ message: `Productos de la categoría "${nombre}" eliminados correctamente` });
  } catch (error) {
    console.error("ERROR DELETE PRODUCTOS POR CATEGORIA:", error);
    res.status(500).json({ message: error.message });
  }
});


/* =========================
   💰 MOVIMIENTOS (VENTAS)
========================= */

// 🔹 GET ventas por usuario
app.get("/api/movimientos", verificarToken, async (req, res) => {
  const usuario_id = req.user.id;

  try {
    if (!usuario_id) {
      return res.json([]);
    }

    const [rows] = await db.execute(
      `SELECT 
    m.id,
    m.cantidad,
    m.tipo,
    m.fecha,
    p.nombre AS producto,
    p.precio
   FROM movimientos m
   LEFT JOIN productos p ON m.producto_id = p.id
   WHERE m.usuario_id = ?`,
      [usuario_id]
    );

    res.json(rows);

  } catch (error) {
    console.error("ERROR GET MOVIMIENTOS:", error);
    res.status(500).json({ message: "Error servidor" });
  }
});

// 🔹 CREAR venta
app.post("/api/movimientos", verificarToken, async (req, res) => {
  const { producto_id, cantidad, tipo } = req.body;

  const usuario_id = req.user.id;

  try {
    if (!producto_id || !usuario_id || !cantidad) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // 🔍 Obtener producto para precio
    const [producto] = await db.execute(
      "SELECT * FROM productos WHERE id = ?",
      [producto_id]
    );

    if (producto.length === 0) {
      return res.status(404).json({ message: "Producto no existe" });
    }


    // 💰 Guardar movimiento
    await db.execute(
      `INSERT INTO movimientos 
      (producto_id, usuario_id, cantidad, tipo, fecha, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [producto_id, usuario_id, cantidad, tipo]
    );

    // 📉 Descontar stock
    await db.execute(
      "UPDATE productos SET cantidad = cantidad - ? WHERE id = ?",
      [cantidad, producto_id]
    );

    res.json({ message: "Venta registrada correctamente" });

  } catch (error) {
    console.error("ERROR GUARDAR VENTA:", error);
    res.status(500).json({ message: error.message });
  }
});


/* =========================
   🚀 SERVIDOR
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});