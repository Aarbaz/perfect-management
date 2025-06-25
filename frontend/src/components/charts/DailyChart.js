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
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DailyChart = ({ summary }) => {
  if (!summary) return null;

  // Vehicle type chart data
  const vehicleData = {
    labels: ['Cars', 'Bikes', 'Autos'],
    datasets: [
      {
        label: 'Vehicle Count',
        data: [
          summary.vehicleCounts?.Car || 0,
          summary.vehicleCounts?.Bike || 0,
          summary.vehicleCounts?.Auto || 0,
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
        borderWidth: 1,
      },
    ],
  };

  // Payment status chart data
  const paymentData = {
    labels: ['Paid', 'Unpaid'],
    datasets: [
      {
        data: [
          summary.paymentStats?.Paid?.count || 0,
          summary.paymentStats?.Unpaid?.count || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const vehicleOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Vehicle Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const paymentOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Payment Status Distribution',
      },
    },
  };

  return (
    <div className="row g-4">
      <div className="col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <Bar data={vehicleData} options={vehicleOptions} />
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <Doughnut data={paymentData} options={paymentOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChart; 