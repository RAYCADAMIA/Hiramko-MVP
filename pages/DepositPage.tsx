import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CreditCard, Wallet, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface DepositPageProps {
    user: User | null;
    onLogin: (user: User) => void;
    onLogout: () => void;
    onUpdateUser: (updates: Partial<User>) => void;
}

const DepositPage: React.FC = () => {
    const { user, refreshProfile, onLogout } = useAuth() as any;
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [amount, setAmount] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !user) return;

        setIsProcessing(true);

        try {
            await api.topUpEscrow(user.id, parseFloat(amount));
            setIsSuccess(true);
            await refreshProfile();

            // Navigate back after a delay
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (err) {
            console.error("Deposit failed:", err);
            showNotification({
                title: 'Deposit Failed',
                message: 'We were unable to process your deposit at this time. Please check your payment details and try again.',
                type: 'error'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 selection:bg-cyan-500/30">
            <Navbar user={user} onLogout={onLogout} />

            <main className="flex-grow container mx-auto px-4 py-8 pt-24 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                                    <Shield className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white font-display">Escrow Deposit</h1>
                                    <p className="text-slate-400 text-sm">Secure your rental transactions</p>
                                </div>
                            </div>

                            {isSuccess ? (
                                <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Deposit Successful!</h3>
                                    <p className="text-slate-400">₱{amount} has been added to your escrow balance.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleDeposit} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                            Amount to Deposit (PHP)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition font-mono text-lg"
                                                required
                                                min="100"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Minimum deposit amount is ₱100.00</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                            Payment Method
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button type="button" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 transition">
                                                <Wallet className="w-6 h-6" />
                                                <span className="text-xs font-bold">GCash / Maya</span>
                                            </button>
                                            <button type="button" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-300 transition">
                                                <CreditCard className="w-6 h-6" />
                                                <span className="text-xs font-bold">Card</span>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isProcessing || !amount}
                                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DepositPage;
