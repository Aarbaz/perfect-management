import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MonthlyChart = ({ monthlyStats }) => {
  if (!monthlyStats) return null;

  // Vehicle type breakdown
  const vehicleTypeData = {
    labels: ['Cars', 'Bikes', 'Autos'],
    datasets: [
      {
        data: [
          monthlyStats.vehicleTypeBreakdown?.Car || 0,
          monthlyStats.vehicleTypeBreakdown?.Bike || 0,
          monthlyStats.vehicleTypeBreakdown?.Auto || 0,
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 205, 86, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Financial summary
  const financialData = {
    labels: ['Paid Amount', 'Unpaid Amount', 'Profit'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [
          monthlyStats.paidAmount,
          monthlyStats.unpaidAmount,
          monthlyStats.profit,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Vehicle Type Distribution',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Financial Summary',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (₹)',
        },
      },
    },
  };

  return (
    <div className="row g-4">
      <div className="col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <Pie data={vehicleTypeData} options={pieOptions} />
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <Bar data={financialData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyChart; 