const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Producto = require("./producto.model");

// Creamos la tabla Movimiento
const Movimiento = db.define("Movimiento", {
  tipo: {
    type: DataTypes.ENUM("entrada", "salida"),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Relación: un producto tiene muchos movimientos
Producto.hasMany(Movimiento);

// Cada movimiento pertenece a un producto
Movimiento.belongsTo(Producto);

module.exports = Movimiento;