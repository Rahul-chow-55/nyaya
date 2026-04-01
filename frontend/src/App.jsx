import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleSetAuth = (userData) => {
    if (userData === null) {
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      setUser(null);
    } else {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  if (loading) return <div>Loading Application...</div>;

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login setAuth={handleSetAuth} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} setAuth={handleSetAuth} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
