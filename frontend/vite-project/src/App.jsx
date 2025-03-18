// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx'; // Ensure the capitalization matches
import EmailVerify from './pages/EmailVerify.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<EmailVerify />} />
    </Routes>
  );
};

export default App;
