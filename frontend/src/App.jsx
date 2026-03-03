import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/manager/*" element={
                        <ProtectedRoute requiredRole="MANAGER">
                            <ManagerDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/customer/*" element={
                        <ProtectedRoute requiredRole="CUSTOMER">
                            <CustomerDashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
