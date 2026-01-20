import React, { useState, useEffect } from 'react';
import { User, Rental, RentalStatus, EscrowStatus, Item, LogisticsType } from '../types';
import { api } from '../services/api';
import { Shield, AlertTriangle, XCircle, CheckCircle, Truck, Package, Search } from 'lucide-react';
import { MOCK_ITEMS, MOCK_RENTALS } from '../constants';
import Login from './Login';

interface AdminDashboardProps {
    user: User | null;
    onLogin: (user: User) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogin }) => {
    const [activeTab, setActiveTab] = useState<'disputes' | 'riders' | 'moderation'>('disputes');

    if (!user || user.email !== 'admin@hiramko.com') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-20">
                <div className="text-center space-y-4">
                    <Shield className="w-16 h-16 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-white">Access Denied</h1>
                    <p className="text-slate-400">You must be an administrator to view this page.</p>
                    {!user && <Login onLogin={onLogin} />}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                        <Shield className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-display">Admin Console</h1>
                        <p className="text-slate-400 text-sm">Welcome back, Administrator.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 bg-slate-900/50 p-1 rounded-xl w-fit border border-slate-800">
                    <button
                        onClick={() => setActiveTab('disputes')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'disputes' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <AlertTriangle className="w-4 h-4" /> Disputes
                    </button>
                    <button
                        onClick={() => setActiveTab('riders')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'riders' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Truck className="w-4 h-4" /> Rider Ops
                    </button>
                    <button
                        onClick={() => setActiveTab('moderation')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'moderation' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Package className="w-4 h-4" /> Moderation
                    </button>
                </div>

                {/* Content */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 min-h-[500px]">
                    {activeTab === 'disputes' && <DisputesPanel />}
                    {activeTab === 'riders' && <RidersPanel />}
                    {activeTab === 'moderation' && <ModerationPanel />}
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components ---

const DisputesPanel = () => {
    // In real app, fetch from API. Mocking by filtering MOCK_RENTALS
    const [disputes, setDisputes] = useState<Rental[]>(MOCK_RENTALS.filter(r => r.status === RentalStatus.DISPUTED || r.escrowStatus === EscrowStatus.DISPUTED));

    const handleResolve = async (rentalId: string, decision: 'refund' | 'release_to_owner') => {
        if (!confirm(`Are you sure you want to ${decision === 'refund' ? 'REFUND renter' : 'RELEASE funds to owner'}? This action is irreversible.`)) return;

        await api.resolveDispute(rentalId, decision);
        alert("Dispute resolved successfully.");
        // Refresh list
        setDisputes(prev => prev.filter(r => r.id !== rentalId));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Active Disputes ({disputes.length})
            </h2>

            {disputes.length > 0 ? (
                <div className="space-y-4">
                    {disputes.map(rental => (
                        <div key={rental.id} className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md uppercase tracking-wider font-bold">Rental #{rental.id}</span>
                                    <span className="text-xs text-slate-500">{rental.startDate} - {rental.endDate}</span>
                                </div>
                                <h3 className="font-bold text-white text-lg mb-1">{rental.item.title}</h3>
                                <div className="text-sm text-slate-400 flex flex-col gap-1">
                                    <p>Owner: <span className="text-white">{rental.item.owner.name}</span></p>
                                    <p>Renter: <span className="text-white">{rental.renter.name}</span></p>
                                    <p className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
                                        <span className="font-bold">Dispute Reason:</span> {rental.disputeReason || "Item damaged reported by owner."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 justify-center min-w-[200px]">
                                <div className="text-center mb-2">
                                    <div className="text-xs text-slate-500 uppercase">Escrow Amount</div>
                                    <div className="text-xl font-bold text-green-400">₱{rental.totalPrice.toLocaleString()}</div>
                                </div>
                                <button
                                    onClick={() => handleResolve(rental.id, 'refund')}
                                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition text-sm flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Refund Renter
                                </button>
                                <button
                                    onClick={() => handleResolve(rental.id, 'release_to_owner')}
                                    className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition text-sm flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> Release to Owner
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                    No active disputes. Peace reigns. 🕊️
                </div>
            )}
        </div>
    );
};

const RidersPanel = () => {
    // Mock Rider Jobs
    const activeDeliveries = MOCK_RENTALS.filter(r => r.logisticsType !== LogisticsType.PICKUP_ONLY);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-500" /> Active Deliveries ({activeDeliveries.length})
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
                            <th className="py-3 px-4">Rental ID</th>
                            <th className="py-3 px-4">Item</th>
                            <th className="py-3 px-4">Route</th>
                            <th className="py-3 px-4">Rider</th>
                            <th className="py-3 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {activeDeliveries.map(rental => (
                            <tr key={rental.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                <td className="py-3 px-4 font-mono text-slate-400">#{rental.id.substring(0, 6)}</td>
                                <td className="py-3 px-4 text-white font-medium">{rental.item.title}</td>
                                <td className="py-3 px-4 text-slate-400">
                                    {rental.item.location} <span className="text-slate-600">→</span> {rental.renter.location}
                                </td>
                                <td className="py-3 px-4 text-white">
                                    {rental.riderName ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                                            {rental.riderName}
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 italic">Unassigned</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <span className="bg-slate-800 text-cyan-400 px-2 py-1 rounded text-xs font-bold border border-slate-700">
                                        {rental.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ModerationPanel = () => {
    const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
    const [searchTerm, setSearchTerm] = useState("");

    const handleBlock = async (itemId: string) => {
        if (!confirm("Block this item? It will be removed from search results.")) return;
        await api.blockItem(itemId);
        alert("Item blocked.");
        setItems(prev => prev.filter(i => i.id !== itemId));
    };

    const filteredItems = items.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-500" /> Item Moderation
                </h2>
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-4 group hover:border-slate-700 transition">
                        <div className="w-20 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0">
                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white truncate">{item.title}</h3>
                            <p className="text-xs text-slate-400 mb-2">by {item.owner.name}</p>
                            <button
                                onClick={() => handleBlock(item.id)}
                                className="text-xs bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1"
                            >
                                <XCircle className="w-3 h-3" /> Block Item
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
