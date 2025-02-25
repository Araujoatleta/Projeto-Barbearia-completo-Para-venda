import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Appointments from './pages/Appointments';
import Services from './pages/Services';
import Products from './pages/Products';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminBarbers from './pages/Admin/Barbers';
import AdminServices from './pages/Admin/Services';
import AdminPromotions from './pages/Admin/Promotions';
import AdminReports from './pages/Admin/Reports';
import AdminChat from './pages/Admin/Chat';
import AdminAppointments from './pages/Admin/Appointments';
import AdminLoyalty from './pages/Admin/LoyaltySettings';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/barbers" element={<AdminBarbers />} />
                      <Route path="/services" element={<AdminServices />} />
                      <Route path="/chat" element={<AdminChat />} />
                      <Route path="/promotions" element={<AdminPromotions />} />
                      <Route path="/reports" element={<AdminReports />} />
                      <Route path="/appointments" element={<AdminAppointments />} />
                      <Route path="/loyalty" element={<AdminLoyalty />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Client Routes */}
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/appointments"
                      element={
                        <ProtectedRoute>
                          <Appointments />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/services" element={<Services />} />
                    <Route path="/products" element={<Products />} />
                    <Route
                      path="/chat"
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;