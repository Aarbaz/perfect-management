import React, { useState } from 'react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const ExportButton = ({ type, data, filters, title }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format) => {
    setLoading(true);
    try {
      let url = '';
      let params = {};

      switch (type) {
        case 'dashboard':
          url = `/api/dashboard/export/${format}`;
          params = { date: filters.date };
          break;
        case 'weekly':
          url = `/api/dashboard/export-weekly/${format}`;
          params = { end_date: filters.end_date };
          break;
        case 'monthly':
          url = `/api/dashboard/export-monthly/${format}`;
          params = { year: filters.year, month: filters.month };
          break;
        default:
          throw new Error('Invalid export type');
      }

      const response = await api.get(url, { 
        params,
        responseType: 'blob' 
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'application/pdf' 
      });
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${title}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      link.click();
      
      toast.success(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error(`Failed to download ${format.toUpperCase()} report`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="btn-group">
      <button 
        className="btn btn-success btn-sm" 
        onClick={() => handleExport('excel')}
        disabled={loading}
        title="Export to Excel"
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm me-1"></span>
        ) : (
          <i className="fas fa-file-excel me-1"></i>
        )}
        Excel
      </button>
      <button 
        className="btn btn-danger btn-sm" 
        onClick={() => handleExport('pdf')}
        disabled={loading}
        title="Export to PDF"
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm me-1"></span>
        ) : (
          <i className="fas fa-file-pdf me-1"></i>
        )}
        PDF
      </button>
    </div>
  );
};

export default ExportButton; 