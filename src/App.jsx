import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SupabaseProvider, useAuth } from './contexts/SupabaseContext';
import DummyLogin from './components/auth/DummyLogin';
import CustomerFlow from './components/customer/CustomerFlow';
import AdminDashboard from './components/admin/AdminDashboard';
import TailorDashboard from './components/tailor/TailorDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppContent = () => {
  const { user, userRole, loading, login } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (!user) {
    return <DummyLogin onLogin={login} />;
  }

  const getDashboardComponent = () => {
    switch (userRole) {
      case 'customer':
        return <CustomerFlow />;
      case 'admin':
        return <AdminDashboard />;
      case 'tailor':
        return <TailorDashboard />;
      default:
        return <CustomerFlow />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={getDashboardComponent()} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <SupabaseProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </SupabaseProvider>
  );
}

export default App;