const { pool } = require('./config/database');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const [result] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    
    // Check if vehicles table exists
    const [tables] = await pool.execute('SHOW TABLES LIKE "vehicles"');
    console.log('✅ Vehicles table exists:', tables.length > 0);
    
    // Check total count of vehicles
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM vehicles');
    console.log('✅ Total vehicles in database:', countResult[0].total);
    
    // Check sample data
    const [sampleData] = await pool.execute('SELECT * FROM vehicles LIMIT 5');
    console.log('✅ Sample data:', sampleData);
    
    // Check all dates in the database
    const [allDates] = await pool.execute('SELECT DISTINCT DATE(entry_date) as date FROM vehicles ORDER BY date');
    console.log('✅ All dates in database:', allDates);
    
    // Test dashboard query for the date that exists in database
    const existingDate = allDates[0]?.date;
    console.log('Testing dashboard query for date:', existingDate);
    
    if (existingDate) {
      const [vehicleCounts] = await pool.execute(
        'SELECT vehicle_type, COUNT(*) as count FROM vehicles WHERE DATE(entry_date) = ? GROUP BY vehicle_type',
        [existingDate]
      );
      console.log('✅ Vehicle counts for', existingDate, ':', vehicleCounts);
      
      const [paymentStats] = await pool.execute(
        `SELECT 
          payment_status,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM vehicles WHERE DATE(entry_date) = ? 
        GROUP BY payment_status`,
        [existingDate]
      );
      console.log('✅ Payment stats for', existingDate, ':', paymentStats);
      
      const [totalStats] = await pool.execute(
        `SELECT 
          COUNT(*) as total_vehicles,
          SUM(amount) as total_amount,
          SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN payment_status = 'Unpaid' THEN amount ELSE 0 END) as unpaid_amount
        FROM vehicles WHERE DATE(entry_date) = ?`,
        [existingDate]
      );
      console.log('✅ Total stats for', existingDate, ':', totalStats[0]);
    }
    
    // Test filter query
    console.log('Testing filter query...');
    const [filteredData] = await pool.execute(
      'SELECT * FROM vehicles WHERE vehicle_type = ? AND payment_status = ? ORDER BY entry_date DESC',
      ['Bike', 'Paid']
    );
    console.log('✅ Filtered data (Bike, Paid):', filteredData.length, 'records');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 