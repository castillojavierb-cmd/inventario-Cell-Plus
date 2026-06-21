const Producto = require("../models/producto.model");

// 🔥 GET
exports.getProductos = async (req, res) => {
  const productos = await Producto.findAll();
  res.json(productos);
};

// 🔥 POST (AQUÍ ESTÁ EL PROBLEMA)
exports.createProducto = async (req, res) => {
  try {
    const { nombre, categoria, cantidad, precio } = req.body;

    const nuevo = await Producto.create({
      nombre,
      categoria,
      cantidad,
      precio
    });

    res.json(nuevo);

  } catch (error) {
    console.error("ERROR AL CREAR:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// 🔥 DELETE
exports.deleteProducto = async (req, res) => {
  const { id } = req.params;

  await Producto.destroy({ where: { id } });

  res.json({ ok: true });
};

// 🔥 UPDATE
exports.updateProducto = async (req, res) => {
  const { id } = req.params;

  await Producto.update(req.body, {
    where: { id }
  });

  res.json({ ok: true });
};
// ❌ ELIMINAR
exports.deleteProducto = async (req, res) => {
  try {
    await Producto.destroy({ where: { id: req.params.id } });
    res.json({ mensaje: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ EDITAR
exports.updateProducto = async (req, res) => {
  try {
    await Producto.update(req.body, {
      where: { id: req.params.id },
    });
    res.json({ mensaje: "Producto actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};