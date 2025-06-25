const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Report operations
router.get('/filter', reportController.getFilteredReports);
router.get('/export/excel', reportController.exportToExcel);
router.get('/export/pdf', reportController.exportToPDF);

module.exports = router; 