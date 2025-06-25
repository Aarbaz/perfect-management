import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const DataEntryPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_type: 'Car',
    vehicle_number: '',
    customer_name: '',
    mobile_number: '',
    amount: '',
    payment_status: 'Paid',
    entry_date: new Date().toISOString().split('T')[0] // Default to today
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, rowsPerPage, search]);

  const fetchVehicles = async () => {
    try {
      let url = `/api/vehicles?page=${currentPage}&limit=${rowsPerPage}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await api.get(url);
      setVehicles(res.data.data.vehicles);
      setTotalPages(Math.ceil(res.data.data.total / rowsPerPage));
    } catch (err) {
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/vehicles/${editingId}`, formData);
        toast.success('Vehicle updated successfully');
        setEditingId(null);
      } else {
        await api.post('/api/vehicles', formData);
        toast.success('Vehicle added successfully');
      }
      setFormData({
        vehicle_type: 'Car',
        vehicle_number: '',
        customer_name: '',
        mobile_number: '',
        amount: '',
        payment_status: 'Paid',
        entry_date: new Date().toISOString().split('T')[0]
      });
      fetchVehicles();
    } catch (err) {
      toast.error(editingId ? 'Failed to update vehicle' : 'Failed to add vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setFormData({
      vehicle_type: vehicle.vehicle_type,
      vehicle_number: vehicle.vehicle_number,
      customer_name: vehicle.customer_name,
      mobile_number: vehicle.mobile_number,
      amount: vehicle.amount,
      payment_status: vehicle.payment_status,
      entry_date: vehicle.entry_date ? vehicle.entry_date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete(`/api/vehicles/${id}`);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (err) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      vehicle_type: 'Car',
      vehicle_number: '',
      customer_name: '',
      mobile_number: '',
      amount: '',
      payment_status: 'Paid',
      entry_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-plus-circle me-2 text-primary"></i>
          Data Entry
        </h2>
        <div className="d-flex align-items-center gap-3">
          <input
            type="text"
            className="form-control"
            style={{ width: 220 }}
            placeholder="Search by vehicle number, name, mobile..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          <select
            className="form-select"
            style={{ width: 100 }}
            value={rowsPerPage}
            onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            {[5, 10, 20, 30, 40].map(n => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className={`fas fa-${editingId ? 'edit' : 'plus'} me-2`}></i>
            {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-2">
              <div className="col-md-3">
                <label className="form-label">Vehicle Type</label>
                <select 
                  className="form-select" 
                  name="vehicle_type" 
                  value={formData.vehicle_type} 
                  onChange={handleChange}
                  required
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Auto">Auto</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Vehicle Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="vehicle_number" 
                  value={formData.vehicle_number} 
                  onChange={handleChange}
                  required
                  minLength={4}
                  maxLength={20}
                  pattern="[A-Za-z0-9-]+"
                  placeholder="e.g. GJ01AB1234"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Customer Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="customer_name" 
                  value={formData.customer_name} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Mobile Number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  name="mobile_number" 
                  value={formData.mobile_number} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row g-3 mb-2">
              <div className="col-md-3">
                <label className="form-label">Amount</label>
                <input 
                  type="number" 
                  className="form-control" 
                  name="amount" 
                  value={formData.amount} 
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Payment Status</label>
                <select 
                  className="form-select" 
                  name="payment_status" 
                  value={formData.payment_status} 
                  onChange={handleChange}
                  required
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="entry_date" 
                  value={formData.entry_date} 
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">
                  <i className={`fas fa-${editingId ? 'save' : 'plus'} me-2`}></i>
                  {editingId ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </div>
            {editingId && (
              <div className="row">
                <div className="col-md-12">
                  <button type="button" className="btn btn-secondary mt-2" onClick={handleCancel}>
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="card shadow-sm">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="fas fa-table me-2"></i>
            Vehicle Records ({vehicles.length})
          </h6>
        </div>
        <div className="card-body">
          {vehicles.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No vehicles found</h5>
              <p className="text-muted">Add your first vehicle entry above.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Number</th>
                      <th>Customer</th>
                      <th>Mobile</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map(vehicle => (
                      <tr key={vehicle.id}>
                        <td>{vehicle.id}</td>
                        <td>
                          <span className={`badge bg-${
                            vehicle.vehicle_type === 'Car' ? 'primary' : 
                            vehicle.vehicle_type === 'Bike' ? 'success' : 'warning'
                          }`}>
                            {vehicle.vehicle_type}
                          </span>
                        </td>
                        <td>{vehicle.vehicle_number}</td>
                        <td>{vehicle.customer_name}</td>
                        <td>{vehicle.mobile_number}</td>
                        <td className="fw-bold">₹ {parseFloat(vehicle.amount).toFixed(2)}</td>
                        <td>
                          <span className={`badge bg-${
                            vehicle.payment_status === 'Paid' ? 'success' : 'danger'
                          }`}>
                            {vehicle.payment_status}
                          </span>
                        </td>
                        <td>{new Date(vehicle.entry_date).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary" 
                              onClick={() => handleEdit(vehicle)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger" 
                              onClick={() => handleDelete(vehicle.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataEntryPage; 