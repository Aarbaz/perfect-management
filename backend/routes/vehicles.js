const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { validateVehicleEntry } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Vehicle CRUD operations
router.get('/', vehicleController.getAllVehicles);
router.get('/stats', vehicleController.getVehicleStats);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', validateVehicleEntry, vehicleController.createVehicle);
router.put('/:id', validateVehicleEntry, vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router; 