const express = require("express");
const router = express.Router();
const controller = require("../controllers/producto.controller");
router.delete("/:id", controller.deleteProducto);
router.put("/:id", controller.updateProducto);


// ✅ GET
router.get("/", controller.getProductos);

// ✅ POST
router.post("/", controller.createProducto);

module.exports = router;