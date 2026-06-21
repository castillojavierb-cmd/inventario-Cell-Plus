require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", require("./routes/auth"));
app.use("/api/productos", require("./routes/producto.routes"));
app.use("/api/movimientos", require("./routes/movimiento.routes"));

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});