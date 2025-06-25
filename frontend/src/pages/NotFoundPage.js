import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="text-center mt-5">
    <h1>404</h1>
    <h3>Page Not Found</h3>
    <Link to="/dashboard" className="btn btn-primary mt-3">Go to Dashboard</Link>
  </div>
);

export default NotFoundPage; 