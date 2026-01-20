import React from 'react';
import { Facebook, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black border-t border-slate-900 text-slate-500 py-12">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="md:col-span-1">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                        <Logo className="w-6 h-6 group-hover:scale-110 transition-transform" animate={false} />
                        <h3 className="font-bold text-xl font-display tracking-tight bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all">HiramKo</h3>
                    </Link>
                    <p className="text-sm leading-relaxed mb-6">
                        The rental marketplace for everyone. <br />Rent safely, save money, and earn from what you own.
                    </p>

                    <div className="flex gap-4">
                        <a href="https://facebook.com/hiramko.ph" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                            <Facebook className="w-4 h-4" />
                        </a>
                        <a href="https://instagram.com/hiramko.ph" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-pink-600 hover:text-white transition">
                            <Instagram className="w-4 h-4" />
                        </a>
                        <a href="mailto:support@hiramko.com" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition">
                            <Mail className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Platform</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:text-cyan-400 transition">How it Works</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition">Trust & Safety</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition">Insurance Policy</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Support</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:text-cyan-400 transition">Help Center</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition">Dispute Resolution</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition">Contact Us</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Legal</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:text-cyan-400 transition">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition">Community Guidelines</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 pt-12 text-center text-xs text-slate-700">
                © 2025 Hiramko Inc. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
