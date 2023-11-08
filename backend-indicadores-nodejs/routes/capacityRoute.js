const express = require('express');
const router = express.Router();
const capacityController = require('../controllers/Capacity');

router.post('/create-capacity', capacityController.createCapacity);
router.delete('/capacities', capacityController.deleteAllCapacities);
router.delete('/capacity/cod/:cod', capacityController.deleteCapacityByCod);
router.put('/capacity/cod/:cod', capacityController.updateCapacityByCod);
router.get('/capacities', capacityController.getAllCapacities);
router.get('/capacity/cod/:cod', capacityController.getCapacityByCod);
router.get('/capacities/analista/:analista', capacityController.getCapacitiesByAnalista);

module.exports = router;
