const Vehicle = require('../models/Vehicle');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { pool } = require('../config/database');

// Get filtered reports
const getFilteredReports = async (req, res) => {
  try {
    const { start_date, end_date, vehicle_type, payment_status } = req.query;
    
    console.log('Filter parameters:', { start_date, end_date, vehicle_type, payment_status });
    
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    
    if (start_date) {
      query += ' AND DATE(entry_date) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND DATE(entry_date) <= ?';
      params.push(end_date);
    }
    
    if (vehicle_type) {
      query += ' AND vehicle_type = ?';
      params.push(vehicle_type);
    }
    
    if (payment_status) {
      query += ' AND payment_status = ?';
      params.push(payment_status);
    }
    
    query += ' ORDER BY entry_date DESC';
    
    console.log('Final query:', query);
    console.log('Query parameters:', params);
    
    const [vehicles] = await pool.execute(query, params);
    
    console.log('Found vehicles:', vehicles.length);
    
    res.json({
      success: true,
      data: { vehicles }
    });
  } catch (error) {
    console.error('Error fetching filtered reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Export to Excel
const exportToExcel = async (req, res) => {
  try {
    const { start_date, end_date, vehicle_type, payment_status } = req.query;
    
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    
    if (start_date) {
      query += ' AND DATE(entry_date) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND DATE(entry_date) <= ?';
      params.push(end_date);
    }
    
    if (vehicle_type) {
      query += ' AND vehicle_type = ?';
      params.push(vehicle_type);
    }
    
    if (payment_status) {
      query += ' AND payment_status = ?';
      params.push(payment_status);
    }
    
    query += ' ORDER BY entry_date DESC';
    
    const [vehicles] = await pool.execute(query, params);
    
    // Create Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehicle Report');
    
    // Add headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Vehicle Type', key: 'vehicle_type', width: 15 },
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Mobile Number', key: 'mobile_number', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Payment Status', key: 'payment_status', width: 15 },
      { header: 'Entry Date', key: 'entry_date', width: 20 }
    ];
    
    // Add data
    vehicles.forEach(vehicle => {
      worksheet.addRow({
        id: vehicle.id,
        vehicle_type: vehicle.vehicle_type,
        customer_name: vehicle.customer_name,
        mobile_number: vehicle.mobile_number,
        amount: parseFloat(vehicle.amount).toFixed(2),
        payment_status: vehicle.payment_status,
        entry_date: new Date(vehicle.entry_date).toLocaleDateString()
      });
    });
    
    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=vehicle_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export Excel file',
      error: error.message
    });
  }
};

// Export to PDF
const exportToPDF = async (req, res) => {
  try {
    const { start_date, end_date, vehicle_type, payment_status } = req.query;
    
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    
    if (start_date) {
      query += ' AND DATE(entry_date) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND DATE(entry_date) <= ?';
      params.push(end_date);
    }
    
    if (vehicle_type) {
      query += ' AND vehicle_type = ?';
      params.push(vehicle_type);
    }
    
    if (payment_status) {
      query += ' AND payment_status = ?';
      params.push(payment_status);
    }
    
    query += ' ORDER BY entry_date DESC';
    
    const [vehicles] = await pool.execute(query, params);
    
    // Create PDF
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=vehicle_report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text('Vehicle Parking Report', { align: 'center' });
    doc.moveDown();
    
    // Add date range
    if (start_date || end_date) {
      let dateText = 'Date Range: ';
      if (start_date && end_date) {
        dateText += `${start_date} to ${end_date}`;
      } else if (start_date) {
        dateText += `From ${start_date}`;
      } else if (end_date) {
        dateText += `Until ${end_date}`;
      }
      doc.fontSize(12).text(dateText, { align: 'center' });
      doc.moveDown();
    }
    
    // Add filters
    let filterText = 'Filters: ';
    const filters = [];
    if (vehicle_type) filters.push(`Vehicle Type: ${vehicle_type}`);
    if (payment_status) filters.push(`Payment Status: ${payment_status}`);
    if (filters.length > 0) {
      filterText += filters.join(', ');
      doc.fontSize(10).text(filterText, { align: 'center' });
      doc.moveDown();
    }
    
    // Add summary
    const totalAmount = vehicles.reduce((sum, v) => sum + parseFloat(v.amount), 0);
    const paidAmount = vehicles.filter(v => v.payment_status === 'Paid').reduce((sum, v) => sum + parseFloat(v.amount), 0);
    const unpaidAmount = vehicles.filter(v => v.payment_status === 'Unpaid').reduce((sum, v) => sum + parseFloat(v.amount), 0);
    
    doc.fontSize(12).text(`Total Records: ${vehicles.length}`, { align: 'left' });
    doc.fontSize(12).text(`Total Amount: INR ${totalAmount.toFixed(2)}`, { align: 'left' });
    doc.fontSize(12).text(`Paid Amount: INR ${paidAmount.toFixed(2)}`, { align: 'left' });
    doc.fontSize(12).text(`Unpaid Amount: INR ${unpaidAmount.toFixed(2)}`, { align: 'left' });
    doc.moveDown();
    
    // Add table headers
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidths = [30, 50, 90, 70, 55, 50, 60]; // ID, Type, Customer, Mobile, Amount, Status, Date
    const headers = ['ID', 'Type', 'Customer', 'Mobile', 'Amount', 'Status', 'Date'];
    let x = tableLeft;
    doc.font('Courier-Bold').fontSize(10);
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
    // Draw a line under the header
    doc.moveTo(tableLeft, tableTop + 14).lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), tableTop + 14).stroke();
    // Add table data
    let yPos = tableTop + 18;
    doc.font('Courier').fontSize(9);
    vehicles.forEach((vehicle, index) => {
      if (yPos > 750) { // New page if needed
        doc.addPage();
        yPos = 50;
        // Redraw headers on new page
        let x2 = tableLeft;
        doc.font('Courier-Bold').fontSize(10);
        headers.forEach((header, i) => {
          doc.text(header, x2, yPos, { width: colWidths[i], align: 'left' });
          x2 += colWidths[i];
        });
        doc.moveTo(tableLeft, yPos + 14).lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), yPos + 14).stroke();
        yPos += 18;
        doc.font('Courier').fontSize(9);
      }
      const rowData = [
        vehicle.id.toString(),
        vehicle.vehicle_type,
        vehicle.customer_name,
        vehicle.mobile_number,
        `INR ${parseFloat(vehicle.amount).toFixed(2)}`,
        vehicle.payment_status,
        new Date(vehicle.entry_date).toISOString().split('T')[0] // YYYY-MM-DD
      ];
      let x3 = tableLeft;
      rowData.forEach((cell, i) => {
        doc.text(cell, x3, yPos, { width: colWidths[i], align: 'left' });
        x3 += colWidths[i];
      });
      yPos += 16;
    });
    
    doc.end();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export PDF file',
      error: error.message
    });
  }
};

module.exports = {
  getFilteredReports,
  exportToExcel,
  exportToPDF
}; 