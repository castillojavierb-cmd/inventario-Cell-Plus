import mysql from "mysql2/promise";

export const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234", // 👈 tu contraseña real
  database: "inventario"
});

console.log("✅ Conectado a MySQL");