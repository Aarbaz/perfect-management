import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const ReportsPage = () => {
  const [filters, setFilters] = useState({ 
    start_date: '', 
    end_date: '', 
    vehicle_type: '',
    payment_status: ''
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/api/reports/filter', { params: filters });
      setRecords(res.data.data.vehicles);
      toast.success(`Found ${res.data.data.vehicles.length} records`);
    } catch (err) {
      toast.error('Failed to fetch records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type) => {
    if (records.length === 0) {
      toast.warning('No records to export. Please filter data first.');
      return;
    }

    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.vehicle_type) params.append('vehicle_type', filters.vehicle_type);
      if (filters.payment_status) params.append('payment_status', filters.payment_status);

      const url = `/api/reports/export/${type}?${params.toString()}`;
      const response = await api.get(url, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { 
        type: type === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'application/pdf' 
      });
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `vehicle_report_${new Date().toISOString().split('T')[0]}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      link.click();
      
      toast.success(`${type.toUpperCase()} report downloaded successfully!`);
    } catch (err) {
      toast.error(`Failed to download ${type.toUpperCase()} report`);
    }
  };

  const clearFilters = () => {
    setFilters({ start_date: '', end_date: '', vehicle_type: '', payment_status: '' });
    setRecords([]);
  };

  const getTotalAmount = () => {
    return records.reduce((sum, record) => sum + parseFloat(record.amount), 0);
  };

  const getPaidAmount = () => {
    return records
      .filter(record => record.payment_status === 'Paid')
      .reduce((sum, record) => sum + parseFloat(record.amount), 0);
  };

  const getUnpaidAmount = () => {
    return records
      .filter(record => record.payment_status === 'Unpaid')
      .reduce((sum, record) => sum + parseFloat(record.amount), 0);
  };

  // Filtered and paginated records
  const filteredRecords = records.filter(record =>
    record.vehicle_number?.toLowerCase().includes(search.toLowerCase()) ||
    record.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    record.mobile_number?.toLowerCase().includes(search.toLowerCase())
  );
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  useEffect(() => {
    setTotalPages(Math.ceil(filteredRecords.length / rowsPerPage) || 1);
    setCurrentPage(1);
  }, [search, rowsPerPage, records]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-chart-bar me-2 text-primary"></i>
          Reports & Analytics
        </h2>
        <div className="d-flex align-items-center gap-3">
          <input
            type="text"
            className="form-control"
            style={{ width: 220 }}
            placeholder="Search by vehicle number, name, mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: 100 }}
            value={rowsPerPage}
            onChange={e => setRowsPerPage(Number(e.target.value))}
          >
            {[5, 10, 20, 30, 40].map(n => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
        </div>
        <div className="btn-group">
          <button 
            className="btn btn-success" 
            onClick={() => handleDownload('excel')}
            disabled={records.length === 0}
          >
            <i className="fas fa-file-excel me-2"></i>
            Export Excel
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => handleDownload('pdf')}
            disabled={records.length === 0}
          >
            <i className="fas fa-file-pdf me-2"></i>
            Export PDF
          </button>
        </div>
      </div>

      {/* Filter Form */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="fas fa-filter me-2"></i>
            Filter Records
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleFilter}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="start_date" 
                  value={filters.start_date} 
                  onChange={handleChange} 
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">End Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="end_date" 
                  value={filters.end_date} 
                  onChange={handleChange} 
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Vehicle Type</label>
                <select 
                  className="form-select" 
                  name="vehicle_type" 
                  value={filters.vehicle_type} 
                  onChange={handleChange}
                >
                  <option value="">All Types</option>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Auto">Auto</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Payment Status</label>
                <select 
                  className="form-select" 
                  name="payment_status" 
                  value={filters.payment_status} 
                  onChange={handleChange}
                >
                  <option value="">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <div className="d-grid gap-2 w-100">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search me-2"></i>
                        Filter
                      </>
                    )}
                  </button>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                    <i className="fas fa-times me-1"></i>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Summary Cards */}
      {records.length > 0 && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="card-title text-muted">Total Records</h6>
                <h3 className="text-primary mb-0">{records.length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="card-title text-muted">Total Amount</h6>
                <h3 className="text-info mb-0">₹ {getTotalAmount().toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="card-title text-muted">Paid Amount</h6>
                <h3 className="text-success mb-0">₹ {getPaidAmount().toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h6 className="card-title text-muted">Unpaid Amount</h6>
                <h3 className="text-danger mb-0">₹ {getUnpaidAmount().toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      {paginatedRecords.length > 0 && (
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
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.vehicle_type}</td>
                  <td>{record.vehicle_number}</td>
                  <td>{record.customer_name}</td>
                  <td>{record.mobile_number}</td>
                  <td>₹ {parseFloat(record.amount).toFixed(2)}</td>
                  <td>{record.payment_status}</td>
                  <td>{new Date(record.entry_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </div>
  );
};

export default ReportsPage; 