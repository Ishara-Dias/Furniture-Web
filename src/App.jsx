import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import DesignEditor from './pages/DesignEditor';
import HelpGuide from './pages/HelpGuide';
import Home from './pages/Home';
import Login from './pages/Login';
import MyAccount from './pages/MyAccount';
import MyDesigns from './pages/MyDesigns';
import NotFound from './pages/NotFound';
import Register from './pages/Register';

function App() {
  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem('current_user') !== null;
  };

  // Protect routes - redirect to login if not logged in
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Conditionally render the Navbar */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/register" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>
        
        <main className="h-full">
          <Routes>
            {/* Redirect root to login page */}
            <Route path="/" element={
              isLoggedIn() ? <Home /> : <Navigate to="/login" replace />
            } />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/new-design" element={
              <ProtectedRoute>
                <DesignEditor />
              </ProtectedRoute>
            } />
            <Route path="/edit-design/:id" element={
              <ProtectedRoute>
                <DesignEditor />
              </ProtectedRoute>
            } />
            <Route path="/my-designs" element={
              <ProtectedRoute>
                <MyDesigns />
              </ProtectedRoute>
            } />
            <Route path="/my-account" element={
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <HelpGuide />
              </ProtectedRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;