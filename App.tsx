import React, { useState } from 'react';
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
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { Navigate } from 'react-router-dom';

const App: React.FC = () => {
  // Auth State controlled by Context
  const { user, signOut } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogin = () => {
    // No-op: Auth state is handled by Supabase subscription
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
        <Navbar user={user} onToggleChat={() => setIsChatOpen(!isChatOpen)} />
        {user && (
          <ChatBox currentUser={user} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        )}

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search user={user} />} />
            <Route path="/item/:id" element={<ItemDetails user={user} onToggleChat={() => setIsChatOpen(!isChatOpen)} />} />
            <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/item/:id/edit" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
            <Route path="/post" element={<ProtectedRoute><PostItem /></ProtectedRoute>} />

            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/messages" element={<ProtectedRoute><Messages user={user} /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={user} onLogin={handleLogin} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard user={user} onLogin={handleLogin} /></ProtectedRoute>} />

            <Route path="/kyc" element={<ProtectedRoute><KYC user={user} /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;