const express = require('express');
const router = express.Router();
const userController = require('../controllers/Analista');

router.post('/analistas', userController.createUser);
router.get('/analistas/:userId', userController.getUserById);
router.put('/analistas/:userId', userController.updateUserById);
router.delete('/analistas/:userId', userController.deleteUserById);
router.get('/analistas/:userId/capacity', userController.getUserCapacities);
router.get('/analistas', userController.getAllUsers);

module.exports = router;
