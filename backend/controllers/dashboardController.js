const Vehicle = require('../models/Vehicle');

// Get daily dashboard summary
const getDailySummary = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    console.log('Dashboard date:', date);
    
    const stats = await Vehicle.getDashboardStats(date);
    console.log('Dashboard stats:', stats);

    // Calculate profit (paid - unpaid)
    const profit = (stats.totalStats.paid_amount || 0) - (stats.totalStats.unpaid_amount || 0);

    // Format vehicle counts
    const vehicleCounts = {
      Car: 0,
      Bike: 0,
      Auto: 0
    };

    stats.vehicleCounts.forEach(item => {
      vehicleCounts[item.vehicle_type] = item.count;
    });

    // Format payment stats
    const paymentStats = {
      Paid: { count: 0, amount: 0 },
      Unpaid: { count: 0, amount: 0 }
    };

    stats.paymentStats.forEach(item => {
      paymentStats[item.payment_status] = {
        count: item.count,
        amount: parseFloat(item.total_amount) || 0
      };
    });

    const summary = {
      date,
      vehicleCounts,
      totalVehicles: stats.totalStats.total_vehicles || 0,
      totalAmount: parseFloat(stats.totalStats.total_amount) || 0,
      paidAmount: parseFloat(stats.totalStats.paid_amount) || 0,
      unpaidAmount: parseFloat(stats.totalStats.unpaid_amount) || 0,
      profit,
      paymentStats
    };

    console.log('Final summary:', summary);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get daily summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get weekly statistics
const getWeeklyStats = async (req, res) => {
  try {
    const endDate = req.query.end_date || new Date().toISOString().split('T')[0];
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // 7 days including end date

    const weeklyStats = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const stats = await Vehicle.getDashboardStats(dateStr);
      const profit = (stats.totalStats.paid_amount || 0) - (stats.totalStats.unpaid_amount || 0);
      
      weeklyStats.push({
        date: dateStr,
        totalVehicles: stats.totalStats.total_vehicles || 0,
        totalAmount: parseFloat(stats.totalStats.total_amount) || 0,
        paidAmount: parseFloat(stats.totalStats.paid_amount) || 0,
        unpaidAmount: parseFloat(stats.totalStats.unpaid_amount) || 0,
        profit
      });
    }

    res.json({
      success: true,
      data: weeklyStats
    });
  } catch (error) {
    console.error('Get weekly stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get monthly statistics
const getMonthlyStats = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const filters = {
      start_date: startDate,
      end_date: endDate
    };
    const vehicles = await Vehicle.getAll(1000, 0, filters); // Get all records for the month

    // Calculate monthly statistics
    const monthlyStats = {
      year,
      month,
      totalVehicles: vehicles.length,
      totalAmount: vehicles.reduce((sum, v) => sum + parseFloat(v.amount), 0),
      paidAmount: vehicles
        .filter(v => v.payment_status === 'Paid')
        .reduce((sum, v) => sum + parseFloat(v.amount), 0),
      unpaidAmount: vehicles
        .filter(v => v.payment_status === 'Unpaid')
        .reduce((sum, v) => sum + parseFloat(v.amount), 0),
      vehicleTypeBreakdown: {
        Car: vehicles.filter(v => v.vehicle_type === 'Car').length,
        Bike: vehicles.filter(v => v.vehicle_type === 'Bike').length,
        Auto: vehicles.filter(v => v.vehicle_type === 'Auto').length
      }
    };

    monthlyStats.profit = monthlyStats.paidAmount - monthlyStats.unpaidAmount;

    res.json({
      success: true,
      data: monthlyStats
    });
  } catch (error) {
    console.error('Get monthly stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Export daily dashboard to Excel
const exportDailyToExcel = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const stats = await Vehicle.getDashboardStats(date);
    
    // Get detailed vehicle data for the date
    const [vehicles] = await Vehicle.pool.execute(
      'SELECT * FROM vehicles WHERE DATE(entry_date) = ? ORDER BY entry_date DESC',
      [date]
    );

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daily Summary');

    // Add summary section
    worksheet.addRow(['Daily Dashboard Summary']);
    worksheet.addRow(['Date', date]);
    worksheet.addRow([]);
    
    const profit = (stats.totalStats.paid_amount || 0) - (stats.totalStats.unpaid_amount || 0);
    
    worksheet.addRow(['Total Vehicles', stats.totalStats.total_vehicles || 0]);
    worksheet.addRow(['Total Amount', `₹${parseFloat(stats.totalStats.total_amount || 0).toFixed(2)}`]);
    worksheet.addRow(['Paid Amount', `₹${parseFloat(stats.totalStats.paid_amount || 0).toFixed(2)}`]);
    worksheet.addRow(['Unpaid Amount', `₹${parseFloat(stats.totalStats.unpaid_amount || 0).toFixed(2)}`]);
    worksheet.addRow(['Profit', `₹${profit.toFixed(2)}`]);
    worksheet.addRow([]);

    // Add vehicle breakdown
    worksheet.addRow(['Vehicle Type Breakdown']);
    stats.vehicleCounts.forEach(item => {
      worksheet.addRow([item.vehicle_type, item.count]);
    });
    worksheet.addRow([]);

    // Add payment breakdown
    worksheet.addRow(['Payment Status Breakdown']);
    stats.paymentStats.forEach(item => {
      worksheet.addRow([item.payment_status, item.count, `₹${parseFloat(item.total_amount || 0).toFixed(2)}`]);
    });
    worksheet.addRow([]);

    // Add detailed vehicle list
    worksheet.addRow(['Detailed Vehicle List']);
    worksheet.addRow(['ID', 'Type', 'Customer', 'Mobile', 'Amount', 'Status', 'Entry Date']);
    
    vehicles.forEach(vehicle => {
      worksheet.addRow([
        vehicle.id,
        vehicle.vehicle_type,
        vehicle.customer_name,
        vehicle.mobile_number,
        `₹${parseFloat(vehicle.amount).toFixed(2)}`,
        vehicle.payment_status,
        new Date(vehicle.entry_date).toLocaleDateString()
      ]);
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true, size: 16 };
    worksheet.getRow(4).font = { bold: true };
    worksheet.getRow(11).font = { bold: true };
    worksheet.getRow(15).font = { bold: true };
    worksheet.getRow(19).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=daily_summary_${date}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export daily to Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export Excel file',
      error: error.message
    });
  }
};

// Export daily dashboard to PDF
const exportDailyToPDF = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const stats = await Vehicle.getDashboardStats(date);
    
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=daily_summary_${date}.pdf`);
    
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text('Daily Dashboard Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${date}`, { align: 'center' });
    doc.moveDown();
    
    const profit = (stats.totalStats.paid_amount || 0) - (stats.totalStats.unpaid_amount || 0);
    
    // Add summary
    doc.fontSize(14).text('Summary:', { underline: true });
    doc.fontSize(12).text(`Total Vehicles: ${stats.totalStats.total_vehicles || 0}`);
    doc.fontSize(12).text(`Total Amount: ₹${parseFloat(stats.totalStats.total_amount || 0).toFixed(2)}`);
    doc.fontSize(12).text(`Paid Amount: ₹${parseFloat(stats.totalStats.paid_amount || 0).toFixed(2)}`);
    doc.fontSize(12).text(`Unpaid Amount: ₹${parseFloat(stats.totalStats.unpaid_amount || 0).toFixed(2)}`);
    doc.fontSize(12).text(`Profit: ₹${profit.toFixed(2)}`);
    doc.moveDown();
    
    // Add vehicle breakdown
    doc.fontSize(14).text('Vehicle Type Breakdown:', { underline: true });
    stats.vehicleCounts.forEach(item => {
      doc.fontSize(12).text(`${item.vehicle_type}: ${item.count}`);
    });
    doc.moveDown();
    
    // Add payment breakdown
    doc.fontSize(14).text('Payment Status Breakdown:', { underline: true });
    stats.paymentStats.forEach(item => {
      doc.fontSize(12).text(`${item.payment_status}: ${item.count} vehicles (₹${parseFloat(item.total_amount || 0).toFixed(2)})`);
    });
    
    doc.end();
  } catch (error) {
    console.error('Export daily to PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export PDF file',
      error: error.message
    });
  }
};

module.exports = {
  getDailySummary,
  getWeeklyStats,
  getMonthlyStats,
  exportDailyToExcel,
  exportDailyToPDF
}; 