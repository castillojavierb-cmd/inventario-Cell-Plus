const express = require("express");
const router = express.Router();
const controller = require("../controllers/movimiento.controller");

router.post("/", controller.registrarMovimiento);

module.exports = router;