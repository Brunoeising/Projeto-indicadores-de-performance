const router = require("express").Router();
const logController = require("../controllers/LogController") 

router.use("/logs", logController.getExecutionLogs); // Adicionando a rota dos logs


module.exports = router;