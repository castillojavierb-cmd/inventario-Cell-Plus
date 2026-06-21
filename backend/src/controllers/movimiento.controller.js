const Movimiento = require("../models/movimiento.model");
const Producto = require("../models/producto.model");

exports.registrarMovimiento = async (req, res) => {
  try {
    const { productoId, tipo, cantidad } = req.body;

    const producto = await Producto.findByPk(productoId);

    if (!producto) {
      return res.status(404).json({ error: "Producto no existe" });
    }

    // Lógica de inventario
    if (tipo === "entrada") {
      producto.cantidad += cantidad;
    } else if (tipo === "salida") {
      if (producto.cantidad < cantidad) {
        return res.status(400).json({ error: "Stock insuficiente" });
      }
      producto.cantidad -= cantidad;
    }

    await producto.save();

    const movimiento = await Movimiento.create({
      tipo,
      cantidad,
      ProductoId: productoId
    });

    res.json(movimiento);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};