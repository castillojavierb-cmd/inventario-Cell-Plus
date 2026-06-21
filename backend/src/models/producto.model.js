const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Producto = db.define("Producto", {
  nombre: DataTypes.STRING,
  categoria: DataTypes.STRING,
  cantidad: DataTypes.INTEGER,
  precio: DataTypes.FLOAT
});

module.exports = Producto;