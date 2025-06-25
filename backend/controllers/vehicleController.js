const Vehicle = require('../models/Vehicle');

// Get all vehicles with pagination
const getAllVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const filters = { search };

    const vehicles = await Vehicle.getAll(limit, offset, filters);
    const total = search ? vehicles.length : await Vehicle.getCount();

    res.json({
      success: true,
      data: {
        vehicles,
        total,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.getById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new vehicle
const createVehicle = async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      entry_date: req.body.entry_date || new Date().toISOString().split('T')[0], // Auto-set if not provided
      vehicle_number: req.body.vehicle_number
    };

    const vehicle = await Vehicle.create(vehicleData);
    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully'
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle'
    });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      entry_date: req.body.entry_date || new Date().toISOString().split('T')[0], // Auto-set if not provided
      vehicle_number: req.body.vehicle_number
    };

    const vehicle = await Vehicle.update(req.params.id, vehicleData);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle'
    });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  try {
    const result = await Vehicle.delete(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle'
    });
  }
};

// Get vehicle statistics
const getVehicleStats = async (req, res) => {
  try {
    const date = req.query.date || null;
    const stats = await Vehicle.getDashboardStats(date);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats
}; 