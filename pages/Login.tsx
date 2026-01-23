import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Chrome, Eye, EyeOff, Check, X, Phone } from 'lucide-react';
import { User } from '../types';
import Logo from '../components/Logo';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface LoginProps {
    onLogin?: (user: User) => void;
}

const Login: React.FC<LoginProps> = () => {
    const [searchParams] = useSearchParams();
    const isSignupMode = searchParams.get('mode') === 'signup';
    const navigate = useNavigate();
    const location = useLocation();
    const { signInWithGoogle, loginAsDemo } = useAuth();
    const { showNotification } = useNotification();

    const from = location.state?.from || '/dashboard';

    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Password Validation State
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        number: false,
        symbol: false,
        uppercase: false
    });

    useEffect(() => {
        const reqs = {
            length: password.length >= 8,
            number: /\d/.test(password),
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            uppercase: /[A-Z]/.test(password),
        };
        setPasswordRequirements(reqs);
        const strength = Object.values(reqs).filter(Boolean).length;
        setPasswordStrength(strength);
    }, [password]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignupMode) {
                if (passwordStrength < 3) {
                    setError("Password is too weak. Please meet more requirements.");
                    setLoading(false);
                    return;
                }

                if (loginMethod === 'email') {
                    const cleanEmail = email.trim();
                    const { error } = await supabase.auth.signUp({
                        email: cleanEmail,
                        password,
                        options: {
                            data: {
                                full_name: cleanEmail.split('@')[0],
                            }
                        }
                    });
                    if (error) throw error;
                    showNotification({
                        title: 'Success!',
                        message: 'Account created successfully. Please check your email for a confirmation link.',
                        type: 'success'
                    });
                } else {
                    // Phone signup logic (simplified for UI)
                    const { error } = await supabase.auth.signUp({
                        phone: phoneNumber,
                        password,
                    });
                    if (error) throw error;
                    showNotification({
                        title: 'Verify Phone',
                        message: 'Sign up successful! Please check your messages for a verification code.',
                        type: 'success'
                    });
                }
            } else {
                if (loginMethod === 'email') {
                    const { error } = await supabase.auth.signInWithPassword({
                        email: email.trim(),
                        password,
                    });
                    if (error) throw error;
                } else {
                    const { error } = await supabase.auth.signInWithPassword({
                        phone: phoneNumber,
                        password,
                    });
                    if (error) throw error;
                }
                navigate(from, { replace: true });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength === 2) return 'bg-yellow-500';
        if (passwordStrength === 3) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <div className="min-h-screen h-full bg-slate-950 flex items-center justify-center relative overflow-y-auto overflow-x-hidden px-4 py-12">

            {/* Background Decor */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative z-10 my-auto">

                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                        <Logo className="w-12 h-12" />
                        <span className="font-bold text-3xl font-display bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">HiramKo</span>
                    </Link>
                    <h2 className="text-2xl font-bold text-white mb-2">{isSignupMode ? 'Create Account' : 'Welcome Back'}</h2>
                    <p className="text-slate-400 text-sm">
                        {isSignupMode ? 'Join our community and rent anything.' : 'Great to see you again!'}
                    </p>
                </div>

                {/* Login Method Toggle */}
                <div className="flex bg-slate-950 p-1 rounded-2xl mb-8 border border-slate-800">
                    <button
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${loginMethod === 'email' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Mail className="w-4 h-4" /> Email
                    </button>
                    <button
                        onClick={() => setLoginMethod('phone')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${loginMethod === 'phone' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Phone className="w-4 h-4" /> Phone
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-start gap-3">
                        <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {loginMethod === 'email' ? (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+63 9XX XXX XXXX"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex justify-between items-center pr-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                            {!isSignupMode && <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors">Forgot?</a>}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Password Strength Indicator (Signup Only) */}
                        {isSignupMode && password.length > 0 && (
                            <div className="pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex gap-1.5 h-1.5 mb-3">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div
                                            key={step}
                                            className={`h-full rounded-full flex-1 transition-all duration-500 ${passwordStrength >= step ? getStrengthColor() : 'bg-slate-800'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                    <div className={`flex items-center gap-2 text-[10px] font-bold ${passwordRequirements.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.length ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                                        8+ Characters
                                    </div>
                                    <div className={`flex items-center gap-2 text-[10px] font-bold ${passwordRequirements.number ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.number ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                                        Includes Number
                                    </div>
                                    <div className={`flex items-center gap-2 text-[10px] font-bold ${passwordRequirements.symbol ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.symbol ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                                        At least 1 Symbol
                                    </div>
                                    <div className={`flex items-center gap-2 text-[10px] font-bold ${passwordRequirements.uppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.uppercase ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                                        Uppercase Letter
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-2 px-6 text-base mt-2">
                        {loading ? 'Processing...' : (isSignupMode ? 'Create Account' : 'Sign In')} <ArrowRight className="w-5 h-5" />
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4">
                    <div className="flex-1 border-t border-slate-800/60 font-display"></div>
                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">OR</span>
                    <div className="flex-1 border-t border-slate-800/60 font-display"></div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        type="button"
                        onClick={() => signInWithGoogle()}
                        className="flex items-center justify-center gap-3 bg-white text-slate-900 py-3.5 rounded-2xl font-bold hover:bg-slate-100 transition shadow-lg active:scale-95 text-sm"
                    >
                        <Chrome className="w-5 h-5" /> Continue with Google
                    </button>

                    <button
                        type="button"
                        onClick={async () => {
                            await loginAsDemo();
                            navigate(from, { replace: true });
                        }}
                        className="w-full mt-3 bg-slate-800/40 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/30 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                    >
                        ✨ Try Demo Mode (Skip Login)
                    </button>
                </div>


                <div className="mt-8 text-center text-xs text-slate-400">
                    {isSignupMode ? 'Already have an account?' : "Don't have an account?"} {' '}
                    <Link
                        to={isSignupMode ? '/login' : '/login?mode=signup'}
                        className="text-cyan-400 font-bold hover:underline"
                    >
                        {isSignupMode ? 'Sign In' : 'Sign Up'}
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Login;
