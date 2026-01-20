import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Upload, Camera, CheckCircle, ChevronLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

import { User } from '../types';

interface KYCProps {
    user?: User | null; // Optional or unused now
    onUpdateUser?: (updates: Partial<User>) => void;
}

const KYC: React.FC<KYCProps> = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, refreshProfile } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        // Simulate API call and update DB
        try {
            // Update profile in DB
            const { error } = await supabase
                .from('profiles')
                .update({ is_verified: true })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile(); // Update local state
            setStep(4); // Success step
        } catch (error) {
            console.error('KYC Failed:', error);
            alert('Verification failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">

                <Link to="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                            <Shield className="w-8 h-8 text-cyan-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white font-display mb-2">Identity Verification</h1>
                        <p className="text-slate-400">Complete these steps to unlock full access and waive deposits.</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-between mb-12 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10"></div>
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                            </div>
                        ))}
                    </div>

                    {step < 4 ? (
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Step 1: Personal Info */}
                            <div className={step === 1 ? 'block' : 'hidden'}>
                                <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Full Name</label>
                                        <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="e.g. Juan Dela Cruz" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Date of Birth</label>
                                        <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-300">Address</label>
                                        <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="House No., Street, City" />
                                    </div>
                                </div>
                                <button type="button" onClick={() => setStep(2)} className="w-full mt-8 bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold transition">
                                    Next Step
                                </button>
                            </div>

                            {/* Step 2: ID Upload */}
                            <div className={step === 2 ? 'block' : 'hidden'}>
                                <h2 className="text-xl font-bold text-white mb-6">Upload Government ID</h2>
                                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center hover:border-cyan-500/50 transition cursor-pointer bg-slate-950/50">
                                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                    <p className="text-slate-300 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-500 mt-2">Passport, Driver's License, or UMID (Max 5MB)</p>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition">
                                        Back
                                    </button>
                                    <button type="button" onClick={() => setStep(3)} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold transition">
                                        Next Step
                                    </button>
                                </div>
                            </div>

                            {/* Step 3: Selfie Check */}
                            <div className={step === 3 ? 'block' : 'hidden'}>
                                <h2 className="text-xl font-bold text-white mb-6">Selfie Verification</h2>
                                <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                                    <Camera className="w-16 h-16 text-slate-600" />
                                    <div className="absolute bottom-4 text-sm text-slate-500">Camera Preview</div>
                                </div>
                                <p className="text-sm text-slate-400 mt-4 text-center flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Ensure your face is clearly visible and well-lit.
                                </p>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setStep(2)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition">
                                        Back
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2">
                                        {isSubmitting ? 'Verifying...' : 'Submit Verification'}
                                    </button>
                                </div>
                            </div>

                        </form>
                    ) : (
                        /* Success State */
                        <div className="text-center py-10 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Verification Submitted!</h2>
                            <p className="text-slate-400 max-w-md mx-auto mb-8">
                                We are reviewing your documents. This usually takes 5-10 minutes. You will be notified once approved.
                            </p>
                            <Link to="/dashboard" className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition">
                                Return to Dashboard
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default KYC;
