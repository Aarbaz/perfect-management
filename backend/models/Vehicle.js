const { pool } = require('../config/database');

class Vehicle {
  // Create a new vehicle entry
  static async create(vehicleData) {
    try {
      const { vehicle_type, vehicle_number, customer_name, mobile_number, amount, payment_status, entry_date } = vehicleData;
      
      const [result] = await pool.execute(
        'INSERT INTO vehicles (vehicle_type, vehicle_number, customer_name, mobile_number, amount, payment_status, entry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [vehicle_type, vehicle_number, customer_name, mobile_number, amount, payment_status || 'Unpaid', entry_date]
      );
      
      return {
        id: result.insertId,
        ...vehicleData,
        created_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all vehicles with pagination, search, and date range
  static async getAll(limit = 10, offset = 0, filters = {}) {
    try {
      let query = 'SELECT * FROM vehicles WHERE 1=1';
      let params = [];
      if (filters.search) {
        query += ' AND (vehicle_number LIKE ? OR customer_name LIKE ? OR mobile_number LIKE ?)';
        const s = `%${filters.search}%`;
        params.push(s, s, s);
      }
      if (filters.start_date && filters.end_date) {
        query += ' AND entry_date BETWEEN ? AND ?';
        params.push(filters.start_date, filters.end_date);
      } else if (filters.start_date) {
        query += ' AND entry_date >= ?';
        params.push(filters.start_date);
      } else if (filters.end_date) {
        query += ' AND entry_date <= ?';
        params.push(filters.end_date);
      }
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get total count of vehicles
  static async getCount() {
    try {
      const [result] = await pool.execute('SELECT COUNT(*) as total FROM vehicles');
      return result[0].total;
    } catch (error) {
      throw error;
    }
  }

  // Get vehicle by ID
  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM vehicles WHERE id = ?',
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update vehicle
  static async update(id, updateData) {
    try {
      const { vehicle_type, vehicle_number, customer_name, mobile_number, amount, payment_status, entry_date } = updateData;
      
      const [result] = await pool.execute(
        'UPDATE vehicles SET vehicle_type = ?, vehicle_number = ?, customer_name = ?, mobile_number = ?, amount = ?, payment_status = ?, entry_date = ? WHERE id = ?',
        [vehicle_type, vehicle_number, customer_name, mobile_number, amount, payment_status, entry_date, id]
      );
      
      if (result.affectedRows > 0) {
        return await this.getById(id);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Delete vehicle
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM vehicles WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(date = null) {
    try {
      let dateFilter = '';
      let params = [];

      if (date) {
        dateFilter = 'WHERE DATE(entry_date) = ?';
        params.push(date);
      }

      // Get vehicle counts by type
      const [vehicleCounts] = await pool.execute(
        `SELECT vehicle_type, COUNT(*) as count FROM vehicles ${dateFilter} GROUP BY vehicle_type`,
        params
      );

      // Get payment statistics
      const [paymentStats] = await pool.execute(
        `SELECT 
          payment_status,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM vehicles ${dateFilter} 
        GROUP BY payment_status`,
        params
      );

      // Get total statistics
      const [totalStats] = await pool.execute(
        `SELECT 
          COUNT(*) as total_vehicles,
          SUM(amount) as total_amount,
          SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN payment_status = 'Unpaid' THEN amount ELSE 0 END) as unpaid_amount
        FROM vehicles ${dateFilter}`,
        params
      );

      return {
        vehicleCounts,
        paymentStats,
        totalStats: totalStats[0]
      };
    } catch (error) {
      throw error;
    }
  }

  // Get vehicles for export
  static async getForExport(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      let params = [];

      // Apply filters
      if (filters.vehicle_type) {
        whereClause += ' AND vehicle_type = ?';
        params.push(filters.vehicle_type);
      }

      if (filters.payment_status) {
        whereClause += ' AND payment_status = ?';
        params.push(filters.payment_status);
      }

      if (filters.start_date && filters.end_date) {
        whereClause += ' AND entry_date BETWEEN ? AND ?';
        params.push(filters.start_date, filters.end_date);
      }

      const [rows] = await pool.execute(
        `SELECT * FROM vehicles ${whereClause} ORDER BY entry_date DESC`,
        params
      );

      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Vehicle; 