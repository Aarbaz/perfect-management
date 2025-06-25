const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Dashboard statistics
router.get('/daily-summary', dashboardController.getDailySummary);
router.get('/weekly-stats', dashboardController.getWeeklyStats);
router.get('/monthly-stats', dashboardController.getMonthlyStats);

// Export operations
router.get('/export/excel', dashboardController.exportDailyToExcel);
router.get('/export/pdf', dashboardController.exportDailyToPDF);

module.exports = router; 