import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import DailyChart from '../components/charts/DailyChart';
import WeeklyChart from '../components/charts/WeeklyChart';
import MonthlyChart from '../components/charts/MonthlyChart';
import ExportButton from '../components/ExportButton';

const getToday = () => new Date().toISOString().split('T')[0];
const getCurrentYear = () => new Date().getFullYear();
const getCurrentMonth = () => new Date().getMonth() + 1;

const DashboardPage = () => {
  const [tab, setTab] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedWeekEnd, setSelectedWeekEnd] = useState(getToday());
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [monthlyStats, setMonthlyStats] = useState(null);

  // Fetch daily summary
  useEffect(() => {
    if (tab === 'daily') {
      fetchDailySummary(selectedDate);
    }
    // eslint-disable-next-line
  }, [tab, selectedDate]);

  // Fetch weekly stats
  useEffect(() => {
    if (tab === 'weekly') {
      fetchWeeklyStats(selectedWeekEnd);
    }
    // eslint-disable-next-line
  }, [tab, selectedWeekEnd]);

  // Fetch monthly stats
  useEffect(() => {
    if (tab === 'monthly') {
      fetchMonthlyStats(selectedYear, selectedMonth);
    }
    // eslint-disable-next-line
  }, [tab, selectedYear, selectedMonth]);

  const fetchDailySummary = async (date) => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/daily-summary', { params: { date } });
      setSummary(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard summary');
      setSummary({
        date,
        vehicleCounts: { Car: 0, Bike: 0, Auto: 0 },
        totalVehicles: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        profit: 0,
        paymentStats: { Paid: { count: 0, amount: 0 }, Unpaid: { count: 0, amount: 0 } }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async (endDate) => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/weekly-stats', { params: { end_date: endDate } });
      setWeeklyStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load weekly stats');
      setWeeklyStats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyStats = async (year, month) => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/monthly-stats', { params: { year, month } });
      setMonthlyStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load monthly stats');
      setMonthlyStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Tab content renderers
  const renderDaily = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-tachometer-alt me-2 text-primary"></i>
          Daily Summary
        </h2>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <label className="me-2 mb-0 fw-bold" htmlFor="dashboard-date">Date:</label>
            <input
              type="date"
              id="dashboard-date"
              className="form-control"
              style={{ width: 170 }}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              max={getToday()}
            />
          </div>
          <ExportButton 
            type="dashboard" 
            filters={{ date: selectedDate }} 
            title="Daily_Summary"
          />
        </div>
      </div>
      {renderSummary(summary)}
      {summary && <DailyChart summary={summary} />}
    </>
  );

  const renderWeekly = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-calendar-week me-2 text-success"></i>
          Weekly Stats
        </h2>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <label className="me-2 mb-0 fw-bold" htmlFor="dashboard-week">Week Ending:</label>
            <input
              type="date"
              id="dashboard-week"
              className="form-control"
              style={{ width: 170 }}
              value={selectedWeekEnd}
              onChange={e => setSelectedWeekEnd(e.target.value)}
              max={getToday()}
            />
          </div>
          <ExportButton 
            type="weekly" 
            filters={{ end_date: selectedWeekEnd }} 
            title="Weekly_Stats"
          />
        </div>
      </div>
      {loading ? renderLoading() : (
        <>
          {renderWeeklyTable()}
          <WeeklyChart weeklyStats={weeklyStats} />
        </>
      )}
    </>
  );

  const renderMonthly = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-calendar-alt me-2 text-warning"></i>
          Monthly Stats
        </h2>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <label className="me-2 mb-0 fw-bold">Month:</label>
            <select
              className="form-select"
              style={{ width: 120 }}
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <label className="me-2 mb-0 fw-bold">Year:</label>
            <input
              type="number"
              className="form-control"
              style={{ width: 100 }}
              value={selectedYear}
              min={2000}
              max={getCurrentYear()}
              onChange={e => setSelectedYear(Number(e.target.value))}
            />
          </div>
          <ExportButton 
            type="monthly" 
            filters={{ year: selectedYear, month: selectedMonth }} 
            title="Monthly_Stats"
          />
        </div>
      </div>
      {loading ? renderLoading() : (
        <>
          {renderMonthlyStats()}
          <MonthlyChart monthlyStats={monthlyStats} />
        </>
      )}
    </>
  );

  const renderLoading = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const renderSummary = (summary) => {
    if (!summary) {
      return (
        <div className="text-center mt-5">
          <h3>No data available</h3>
          <p className="text-muted">Please add some vehicle entries to see dashboard data.</p>
        </div>
      );
    }
    return (
      <>
        {/* Vehicle Count Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-bg-primary mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Cars</h6>
                    <h3 className="mb-0">{summary.vehicleCounts?.Car || 0}</h3>
                  </div>
                  <i className="fas fa-car fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-bg-success mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Bikes</h6>
                    <h3 className="mb-0">{summary.vehicleCounts?.Bike || 0}</h3>
                  </div>
                  <i className="fas fa-motorcycle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-bg-warning mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Autos</h6>
                    <h3 className="mb-0">{summary.vehicleCounts?.Auto || 0}</h3>
                  </div>
                  <i className="fas fa-taxi fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-bg-info mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Total Vehicles</h6>
                    <h3 className="mb-0">{summary.totalVehicles || 0}</h3>
                  </div>
                  <i className="fas fa-vehicle-truck fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title text-muted mb-2">
                  <i className="fas fa-money-bill-wave me-2"></i>
                  Total Amount
                </h6>
                <h4 className="mb-0 text-primary">₹ {(summary.totalAmount || 0).toFixed(2)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title text-muted mb-2">
                  <i className="fas fa-check-circle me-2"></i>
                  Paid Amount
                </h6>
                <h4 className="mb-0 text-success">₹ {(summary.paidAmount || 0).toFixed(2)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title text-muted mb-2">
                  <i className="fas fa-clock me-2"></i>
                  Unpaid Amount
                </h6>
                <h4 className="mb-0 text-danger">₹ {(summary.unpaidAmount || 0).toFixed(2)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-gradient-primary text-white">
              <div className="card-body">
                <h6 className="card-title mb-2">
                  <i className="fas fa-chart-line me-2"></i>
                  Daily Profit
                </h6>
                <h4 className="mb-0">₹ {(summary.profit || 0).toFixed(2)}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Summary */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h6 className="mb-0">
                  <i className="fas fa-chart-pie me-2"></i>
                  Payment Status Summary
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="text-center">
                      <div className="h4 text-success mb-1">{summary.paymentStats?.Paid?.count || 0}</div>
                      <small className="text-muted">Paid Vehicles</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <div className="h4 text-danger mb-1">{summary.paymentStats?.Unpaid?.count || 0}</div>
                      <small className="text-muted">Unpaid Vehicles</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h6 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Quick Actions
                </h6>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-plus me-2"></i>
                    Add New Vehicle
                  </button>
                  <button className="btn btn-outline-success btn-sm">
                    <i className="fas fa-download me-2"></i>
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderWeeklyTable = () => {
    if (!weeklyStats || weeklyStats.length === 0) {
      return (
        <div className="text-center mt-5">
          <h3>No data available</h3>
          <p className="text-muted">No weekly stats found for the selected week.</p>
        </div>
      );
    }
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="fas fa-table me-2"></i>
            Weekly Data Table
          </h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Total Vehicles</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Unpaid Amount</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {weeklyStats.map(day => (
                  <tr key={day.date}>
                    <td>{day.date}</td>
                    <td>{day.totalVehicles}</td>
                    <td>₹ {day.totalAmount.toFixed(2)}</td>
                    <td className="text-success">₹ {day.paidAmount.toFixed(2)}</td>
                    <td className="text-danger">₹ {day.unpaidAmount.toFixed(2)}</td>
                    <td className="fw-bold">₹ {day.profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyStats = () => {
    if (!monthlyStats) {
      return (
        <div className="text-center mt-5">
          <h3>No data available</h3>
          <p className="text-muted">No monthly stats found for the selected month.</p>
        </div>
      );
    }
    return (
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">
                <i className="fas fa-car me-2"></i>
                Cars
              </h6>
              <h3 className="mb-0">{monthlyStats.vehicleTypeBreakdown?.Car || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">
                <i className="fas fa-motorcycle me-2"></i>
                Bikes
              </h6>
              <h3 className="mb-0">{monthlyStats.vehicleTypeBreakdown?.Bike || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">
                <i className="fas fa-taxi me-2"></i>
                Autos
              </h6>
              <h3 className="mb-0">{monthlyStats.vehicleTypeBreakdown?.Auto || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">
                <i className="fas fa-users me-2"></i>
                Total Vehicles
              </h6>
              <h3 className="mb-0">{monthlyStats.totalVehicles}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">
                <i className="fas fa-money-bill-wave me-2"></i>
                Total Amount
              </h6>
              <h3 className="mb-0 text-primary">₹ {monthlyStats.totalAmount.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">
                <i className="fas fa-check-circle me-2"></i>
                Paid Amount
              </h6>
              <h3 className="mb-0 text-success">₹ {monthlyStats.paidAmount.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">
                <i className="fas fa-clock me-2"></i>
                Unpaid Amount
              </h6>
              <h3 className="mb-0 text-danger">₹ {monthlyStats.unpaidAmount.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-gradient-primary text-white">
            <div className="card-body">
              <h6 className="card-title mb-2">
                <i className="fas fa-chart-line me-2"></i>
                Profit
              </h6>
              <h3 className="mb-0">₹ {monthlyStats.profit.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}>
            <i className="fas fa-calendar-day me-2"></i>
            Daily
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'weekly' ? 'active' : ''}`} onClick={() => setTab('weekly')}>
            <i className="fas fa-calendar-week me-2"></i>
            Weekly
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>
            <i className="fas fa-calendar-alt me-2"></i>
            Monthly
          </button>
        </li>
      </ul>
      {/* Tab Content */}
      {loading ? renderLoading() : (
        tab === 'daily' ? renderDaily() :
        tab === 'weekly' ? renderWeekly() :
        renderMonthly()
      )}
    </div>
  );
};

export default DashboardPage; 