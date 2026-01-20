import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Github, Chrome, Eye, EyeOff, Check, X } from 'lucide-react';
import { User } from '../types';
import Logo from '../components/Logo';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
    onLogin?: (user: User) => void;
}

const Login: React.FC<LoginProps> = () => {
    const [searchParams] = useSearchParams();
    const isSignupMode = searchParams.get('mode') === 'signup';
    const navigate = useNavigate();
    const location = useLocation();
    const { signInWithGoogle, loginAsDemo } = useAuth();

    const from = location.state?.from || '/dashboard';

    const [email, setEmail] = useState('');
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

        const cleanEmail = email.trim();

        try {
            if (isSignupMode) {
                if (passwordStrength < 3) {
                    setError("Password is too weak. Please meet more requirements.");
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password,
                    options: {
                        data: {
                            full_name: cleanEmail.split('@')[0], // Default name
                        }
                    }
                });
                if (error) throw error;
                // For Supabase, usually need to confirm email unless disabled in settings
                alert('Sign up successful! Check your email for confirmation link.');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password,
                });
                if (error) throw error;
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
        <div className="min-h-screen h-full bg-slate-950 flex items-center justify-center relative overflow-y-auto overflow-x-hidden px-4 py-10">

            {/* Background Decor */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl relative z-10 my-auto">

                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                        <Logo className="w-10 h-10" />
                        <span className="font-bold text-2xl font-display bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">HiramKo</span>
                    </Link>
                    <h2 className="text-xl font-bold text-white mb-1">{isSignupMode ? 'Create Account' : 'Welcome Back'}</h2>
                    <p className="text-slate-400 text-xs">
                        {isSignupMode ? 'Join the rental revolution today.' : 'Enter your credentials to access.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-start gap-2">
                        <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                            {!isSignupMode && <a href="#" className="text-[10px] text-cyan-400 hover:underline">Forgot?</a>}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Password Strength Indicator (Signup Only) */}
                        {isSignupMode && password.length > 0 && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex gap-1 h-1 mb-2">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div
                                            key={step}
                                            className={`h-full rounded-full flex-1 transition-all duration-300 ${passwordStrength >= step ? getStrengthColor() : 'bg-slate-800'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                    <div className={`flex items-center gap-1.5 text-[10px] ${passwordRequirements.length ? 'text-green-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.length ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                                        Min 8 characters
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] ${passwordRequirements.number ? 'text-green-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.number ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                                        At least 1 number
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] ${passwordRequirements.symbol ? 'text-green-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.symbol ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                                        At least 1 symbol
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] ${passwordRequirements.uppercase ? 'text-green-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.uppercase ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                                        At least 1 uppercase
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 mt-4 text-sm">
                        {isSignupMode ? 'Sign Up' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-slate-800 flex-1"></div>
                    <span className="text-slate-600 text-[10px] uppercase">Or continue with</span>
                    <div className="h-px bg-slate-800 flex-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => signInWithGoogle()}
                        className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition text-xs font-medium"
                    >
                        <Chrome className="w-4 h-4" /> Google
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition text-xs font-medium">
                        <Github className="w-4 h-4" /> GitHub
                    </button>
                </div>

                <button
                    type="button"
                    onClick={async () => {
                        await loginAsDemo();
                        navigate(from, { replace: true });
                    }}
                    className="w-full mt-3 bg-slate-800/50 hover:bg-slate-800 text-cyan-400 border border-slate-700/50 hover:border-cyan-500/50 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                    ✨ Try Demo Mode (Skip Login)
                </button>


                <div className="mt-6 text-center text-xs text-slate-400">
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