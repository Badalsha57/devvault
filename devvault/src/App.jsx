import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  // 1. Token ko state mein rakhein
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 2. Token update karne wala function
  const updateAuth = () => {
    setToken(localStorage.getItem('token'));
  };

  return (
    <Router>
      <Routes>
        {/* Login ko updateAuth function pass karein */}
        <Route path="/login" element={!token ? <Login onLogin={updateAuth} /> : <Navigate to="/" />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Dashboard tabhi dikhega jab token state mein hoga */}
        <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;