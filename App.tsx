import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import ItemDetails from './pages/ItemDetails';
import PostItem from './pages/PostItem';

import Login from './pages/Login';
import Messages from './pages/Messages';
import Dashboard from './pages/Dashboard';
import KYC from './pages/KYC';
import DepositPage from './pages/DepositPage';
import EditItem from './pages/EditItem';
import AdminDashboard from './pages/AdminDashboard';

import Checkout from './pages/Checkout';
import ChatBox from './components/ChatBox';
import { User } from './types';
import { Facebook, Instagram, Mail, MessageCircle } from 'lucide-react';
import Logo from './components/Logo';


import Toast from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { Navigate } from 'react-router-dom';

const App: React.FC = () => {
  // Auth State controlled by Context
  const { user, signOut, refreshProfile } = useAuth();

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Force redirect to Hero/Home page on refresh/load
    if (window.location.hash !== '#/') {
      window.location.hash = '#/';
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  const handleLogin = () => {
    // No-op: Auth state is handled by Supabase subscription
  };

  const handleLogout = async () => {
    await signOut();
  };

  const updateUser = async (updates: Partial<User>) => {
    // In a real app, we would update the DB here.
    // For now, we rely on profile refreshing.
    // TODO: Implement updateProfile in AuthContext
    await refreshProfile();
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">

        <Toast
          message={toastMessage}
          isVisible={isToastVisible}
          onClose={() => setIsToastVisible(false)}
        />
        <Navbar user={user} onShowToast={showToast} onToggleChat={() => setIsChatOpen(!isChatOpen)} />
        {user && (
          <>
            <ChatBox currentUser={user} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

          </>
        )}
        {/* <div className="p-10 text-center">
            <h1>App Structure Restored - Imports Valid</h1>
            <p>If you see this, hooks and imports are fine.</p>
        </div> */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search user={user} onShowToast={showToast} />} />
            <Route path="/item/:id" element={<ItemDetails user={user} onShowToast={showToast} onToggleChat={() => setIsChatOpen(!isChatOpen)} />} />
            <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/item/:id/edit" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
            <Route path="/post" element={<ProtectedRoute><PostItem onShowToast={showToast} /></ProtectedRoute>} />

            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/messages" element={<ProtectedRoute><Messages user={user} /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={user} onLogin={handleLogin} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard user={user} onLogin={handleLogin} /></ProtectedRoute>} />

            <Route path="/kyc" element={<ProtectedRoute><KYC user={user} /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><DepositPage user={user} onLogin={handleLogin} onLogout={handleLogout} onUpdateUser={updateUser} /></ProtectedRoute>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;