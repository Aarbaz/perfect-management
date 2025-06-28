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
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
            <label className="me-2 mb-0 fw-bold">Year:</label>
            <select
              className="form-select"
              style={{ width: 100 }}
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {[...Array(5)].map((_, i) => {
                const year = getCurrentYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
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
    <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const renderSummary = (summary) => {
    if (!summary) return renderLoading();

    return (
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Total Vehicles</h6>
                  <h3 className="mb-0">{summary.totalVehicles}</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-car fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Paid Amount</h6>
                  <h3 className="mb-0">{summary.paidAmount}</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-check-circle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Unpaid Amount</h6>
                  <h3 className="mb-0">{summary.unpaidAmount}</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-exclamation-circle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Profit</h6>
                  <h3 className="mb-0">{summary.profit}</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-coins fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyTable = () => {
    if (!weeklyStats || weeklyStats.length === 0) return renderLoading();
    return (
      <div className="table-responsive mb-4">
        <table className="table table-bordered table-striped">
          <thead>
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
            {weeklyStats.map((stat) => (
              <tr key={stat.date}>
                <td>{stat.date}</td>
                <td>{stat.totalVehicles}</td>
                <td>{stat.totalAmount}</td>
                <td>{stat.paidAmount}</td>
                <td>{stat.unpaidAmount}</td>
                <td>{stat.profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMonthlyStats = () => {
    if (!monthlyStats) return renderLoading();
    return (
      <div className="table-responsive mb-4">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Vehicle Type</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(monthlyStats.vehicleTypeBreakdown || {}).map(([type, count]) => (
              <tr key={type}>
                <td>{type}</td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3">
          <strong>Total Vehicles:</strong> {monthlyStats.totalVehicles}<br />
          <strong>Total Amount:</strong> {monthlyStats.totalAmount}<br />
          <strong>Paid Amount:</strong> {monthlyStats.paidAmount}<br />
          <strong>Unpaid Amount:</strong> {monthlyStats.unpaidAmount}<br />
          <strong>Profit:</strong> {monthlyStats.profit}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'daily' ? 'active' : ''}`}
              onClick={() => setTab('daily')}
            >
              Daily
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'weekly' ? 'active' : ''}`}
              onClick={() => setTab('weekly')}
            >
              Weekly
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'monthly' ? 'active' : ''}`}
              onClick={() => setTab('monthly')}
            >
              Monthly
            </button>
          </li>
        </ul>
      </div>
      {tab === 'daily' && renderDaily()}
      {tab === 'weekly' && renderWeekly()}
      {tab === 'monthly' && renderMonthly()}
    </div>
  );
};

export default DashboardPage; 