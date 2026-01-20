import React, { useEffect } from 'react';
import { X, Info } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px]">
                <Info className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium flex-1">{message}</span>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
