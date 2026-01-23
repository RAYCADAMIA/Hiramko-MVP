import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type NotificationType = 'error' | 'success' | 'warning' | 'info';

interface NotificationOptions {
    title?: string;
    message: string;
    type?: NotificationType;
    confirmText?: string;
    onConfirm?: () => void;
}

interface NotificationContextType {
    showNotification: (options: NotificationOptions) => void;
    hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<NotificationOptions | null>(null);

    const showNotification = (opts: NotificationOptions) => {
        setOptions(opts);
        setIsOpen(true);
    };

    const hideNotification = () => {
        setIsOpen(false);
        // Delay clearing options to allow exit animation
        setTimeout(() => setOptions(null), 300);
    };

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            {isOpen && options && (
                <SystemNotification
                    options={options}
                    onClose={hideNotification}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

const SystemNotification: React.FC<{ options: NotificationOptions; onClose: () => void }> = ({ options, onClose }) => {
    const { title, message, type = 'info', confirmText = 'Understood', onConfirm } = options;

    const config = {
        error: {
            icon: AlertCircle,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            accent: 'bg-red-500',
            glow: 'shadow-red-500/20'
        },
        success: {
            icon: CheckCircle,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            accent: 'bg-emerald-500',
            glow: 'shadow-emerald-500/20'
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            accent: 'bg-amber-500',
            glow: 'shadow-amber-500/20'
        },
        info: {
            icon: Info,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            accent: 'bg-cyan-500',
            glow: 'shadow-cyan-500/20'
        }
    }[type];

    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/40 animate-in fade-in duration-300">
            <div className={`relative w-full max-w-sm bg-slate-900 border ${config.border} rounded-[2rem] p-8 shadow-2xl ${config.glow} animate-in zoom-in-95 duration-300`}>
                <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 ${config.bg} rounded-2xl flex items-center justify-center relative overflow-hidden group`}>
                        <div className={`absolute inset-0 ${config.accent} opacity-20 blur-xl`}></div>
                        <Icon className={`w-8 h-8 ${config.color} relative z-10`} />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white font-display">
                        {title || type.toUpperCase()}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose();
                        }}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all active:scale-95 ${config.accent} text-white shadow-lg ${config.glow} hover:opacity-90`}
                    >
                        {confirmText}
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
