import React, { useState, useEffect } from 'react';
import { User, RentalStatus, UserType, Rental, Item } from '../types';
import { MOCK_ITEMS, MOCK_RENTALS, MOCK_NOTIFICATIONS } from '../constants';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Star, Shield, Plus, Calendar, Settings, LogOut, Bell, CheckCircle, AlertCircle, Info, HelpCircle, Zap, HelpCircle as Help } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import Login from './Login';
import { api } from '../services/api';

interface DashboardProps {
    user: User | null;
    onLogout: () => void;
    onLogin: (user: User) => void;
    onToggleChat?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onLogin, onToggleChat }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showEscrowTooltip, setShowEscrowTooltip] = useState(false);
    const [myListings, setMyListings] = useState<Item[]>([]);
    const [activeRentals, setActiveRentals] = useState<Rental[]>([]);

    // Helper for local storage access
    const getLocalStorage = <T>(key: string, defaultValue: T): T => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    };

    const fetchDashboardData = async () => {
        if (user) {
            const listings = await api.getMyItems(user.id);
        setMyListings(listings);

        // Re-fetch all rentals to ensure we have latest from localStorage
        const allRentals = getLocalStorage<Rental[]>('hk_rentals', MOCK_RENTALS);
            setActiveRentals(allRentals.filter(r => r.renter.id === user.id || r.item.owner.id === user.id));
        }
    };

    useEffect(() => {
            fetchDashboardData();
    }, [user, location.search]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('payment_success') === 'true') {
            const rentalId = params.get('rentalId');
        alert(`Payment Verified! Rental ${rentalId} is now Pending Owner Approval.`);
        navigate('/dashboard', {replace: true });
        }
    }, [location, navigate]);

        if (!user) {
        return <Login onLogin={onLogin} />;
    }

        // Filter items owned by user (mock filter using ID if matching, otherwise simulate empty or mock)
        // const myListings = MOCK_ITEMS.filter(i => i.owner.id === user.id);

        // List of rentals is now stateful from API/localStorage
        // const [activeRentals, setActiveRentals] = useState(MOCK_RENTALS.filter(r => r.renter.id === user.id || r.item.owner.id === user.id));

        // Review Modal State
        const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
        const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
        const [reviewRating, setReviewRating] = useState(5);
        const [reviewComment, setReviewComment] = useState('');

    const handleConfirmReturn = async (rentalId: string) => {
        if (!confirm("Confirm that the item has been returned in good condition? This will release the escrowed funds.")) return;
        const result = await api.confirmReturn(rentalId, 5, false);
        if (result.success) {
            alert("Return confirmed! Funds released. Please leave a review.");
        // Trigger Review Modal immediately for Owner
        setSelectedRentalId(rentalId);
        setIsReviewModalOpen(true);
            // Ideally trigger refresh here
        }
    };

    // ... handleDispute ...

    const handleSubmitReview = async () => {
        if (!selectedRentalId || !user) return;

        // Find rental to get targetId
        const rental = activeRentals.find(r => r.id === selectedRentalId);
        if (!rental) return;

        const targetId = rental.renter.id === user.id ? rental.item.owner.id : rental.renter.id;

        await api.submitReview({
            rentalId: selectedRentalId,
        reviewerId: user.id,
        targetId: targetId,
        rating: reviewRating,
        comment: reviewComment
        });

        alert("Review submitted! Thank you.");
        setIsReviewModalOpen(false);
        setReviewComment('');
        setReviewRating(5);
    };

    const handleDispute = async (rentalId: string) => {
        const reason = prompt("Please describe the issue (e.g. Item damaged, Late return):");
        if (reason) {
            await api.fileDispute(rentalId, reason);
        alert("Dispute filed. Admin will review.");
        fetchDashboardData();
        }
    };

    const handleApproveRental = async (rentalId: string) => {
        if (!confirm("Confirm that you have received the payment?")) return;
        await api.confirmPayment(rentalId); // Updates payment to 'paid' and status to 'active'
        alert("Payment verified and rental approved! User has been notified.");
        fetchDashboardData();
    };

    const handleDeclineRental = async (rentalId: string) => {
        if (!confirm("Decline this rental request? Funds will be refunded to the renter.")) return;
        await api.updateRentalStatus(rentalId, RentalStatus.RETURN_INITIATED); // Reusing status for prototype
        alert("Rental declined.");
        fetchDashboardData();
    };

        return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Profile Header */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-cyan-500 to-blue-600">
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border-4 border-slate-900" />
                        </div>
                        <button className="absolute bottom-0 right-0 bg-slate-800 p-2 rounded-full border border-slate-600 text-slate-300 hover:text-white transition">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold text-white font-display flex items-center justify-center md:justify-start gap-2">
                            {user.name}
                            {user.verified && <Shield className="w-6 h-6 text-cyan-500" />}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                                {user.verified ? (
                                    <span className="text-cyan-400 font-bold flex items-center gap-1"><Shield className="w-3 h-3" /> Verified User</span>
                                ) : (
                                    <span className="text-slate-500 flex items-center gap-1"><Shield className="w-3 h-3" /> Unverified</span>
                                )}
                            </span>
                            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> {user.rating} Rating</span>
                        </div>

                        {/* Escrow & Verification CTA */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                            <div className="bg-slate-800/50 border border-slate-700 px-3 py-1 rounded-lg flex items-center gap-2 relative"
                                onMouseEnter={() => setShowEscrowTooltip(true)}
                                onMouseLeave={() => setShowEscrowTooltip(false)}
                            >
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-slate-300 font-mono">Escrow: <span className="text-white font-bold">₱0.00</span></span>
                                <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" />

                                {showEscrowTooltip && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 shadow-xl z-50">
                                        <p className="font-bold text-white mb-1">What is Escrow?</p>
                                        <p>To secure item return, a deposit must be held in escrow before renting.</p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45"></div>
                                    </div>
                                )}
                            </div>


                            <Link to="/deposit" className="w-6 h-6 bg-cyan-600 hover:bg-cyan-500 rounded-full flex items-center justify-center text-white transition shadow-lg shadow-cyan-900/20" title="Add Deposit">
                                <Plus className="w-4 h-4" />
                            </Link>


                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-center md:justify-start gap-6 mt-4 pt-4 border-t border-slate-800/50">
                            <a href="#my-listings" className="text-center md:text-left group cursor-pointer">
                                <div className="text-lg font-bold text-white group-hover:text-cyan-400 transition">{myListings.length}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider group-hover:text-slate-300 transition">Listings</div>
                            </a>
                            <a href="#active-rentals" className="text-center md:text-left group cursor-pointer">
                                <div className="text-lg font-bold text-white group-hover:text-cyan-400 transition">{activeRentals.length}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider group-hover:text-slate-300 transition">Rentals</div>
                            </a>
                            <div className="text-center md:text-left group cursor-pointer">
                                <div className="text-lg font-bold text-cyan-400 group-hover:text-cyan-300 transition">
                                    ₱{(myListings.length * 2500).toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider group-hover:text-slate-300 transition">Earnings</div>
                            </div>
                            <Link to="/messages" className="text-center md:text-left group cursor-pointer block">
                                <div className="text-lg font-bold text-white group-hover:text-cyan-400 transition">5</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider group-hover:text-slate-300 transition">Messages</div>
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <Link to="/post" className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-cyan-900/20">
                            <Plus className="w-5 h-5" /> List New Item
                        </Link>
                        <button onClick={onLogout} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-medium transition border border-slate-700">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Active Rentals */}
                        <div id="active-rentals">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Package className="w-5 h-5 text-cyan-400" /> Rental Activities
                            </h2>

                            {activeRentals.length > 0 ? (
                                <div className="space-y-8">
                                    {/* Requests for My Items */}
                                    {activeRentals.some(r => r.item.owner.id === user.id && r.status === RentalStatus.PENDING) && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Pending Requests (Incoming)</h3>
                                            <div className="grid gap-4">
                                                {activeRentals.filter(r => r.item.owner.id === user.id && r.status === RentalStatus.PENDING).map(rental => (
                                                    <div key={rental.id} className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 flex flex-col items-start gap-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                                        {/* Top Row: Info */}
                                                        <div className="flex flex-row items-center gap-6 w-full">
                                                            <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                                                <img src={rental.item.images[0]} alt={rental.item.title} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-bold text-white">{rental.item.title}</h3>
                                                                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded uppercase">Request</span>
                                                                </div>
                                                                <p className="text-sm text-slate-400">Renter: <span className="text-white">{rental.renter.name}</span></p>
                                                                <p className="text-xs text-slate-500 mt-1">{rental.startDate} to {rental.endDate}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-white">₱{rental.totalPrice.toLocaleString()}</p>
                                                                <p className="text-[10px] text-slate-500 uppercase">{rental.paymentStatus}</p>
                                                            </div>
                                                        </div>

                                                        {/* Bottom Row: Proof & Actions */}
                                                        <div className="w-full bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                                                            {rental.paymentStatus === 'review' && rental.paymentProofUrl ? (
                                                                <div className="flex items-center gap-3">
                                                                    <a href={rental.paymentProofUrl} target="_blank" rel="noreferrer" className="block w-20 h-20 border border-slate-700 rounded-lg overflow-hidden relative group hover:border-cyan-500 transition">
                                                                        <img src={rental.paymentProofUrl} alt="Receipt" className="w-full h-full object-cover" />
                                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px] text-white">View</div>
                                                                    </a>
                                                                    <div className="text-xs text-slate-400">
                                                                        <p className="text-white font-bold">Payment Receipt Submitted</p>
                                                                        <p>Please verify the amount matches.</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                                                    <AlertCircle className="w-4 h-4" /> Waiting for payment proof...
                                                                </div>
                                                            )}

                                                            <div className="flex gap-2">
                                                                {rental.paymentStatus === 'review' ? (
                                                                    <button
                                                                        onClick={() => handleApproveRental(rental.id)}
                                                                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-green-900/20"
                                                                    >
                                                                        Verify & Approve
                                                                    </button>
                                                                ) : (
                                                                    <button disabled className="px-6 py-2 bg-slate-800 text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed">
                                                                        Approve
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => handleDeclineRental(rental.id)}
                                                                    className="px-6 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700 rounded-xl text-xs font-bold transition"
                                                                >
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Active Rentals (Both Sides) */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">In Progress / Completed</h3>
                                        <div className="grid gap-4">
                                            {activeRentals.filter(r => r.status !== RentalStatus.PENDING).reverse().map(rental => (
                                                <div key={rental.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 hover:border-cyan-500/30 transition">
                                                    <div className="w-20 h-20 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                                        <img src={rental.item.images[0]} alt={rental.item.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 text-center md:text-left">
                                                        <h3 className="font-bold text-white">{rental.item.title}</h3>
                                                        <p className="text-sm text-slate-400">
                                                            {rental.renter.id === user.id ? `Owner: ${rental.item.owner.name}` : `Renter: ${rental.renter.name}`}
                                                        </p>
                                                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-xs text-slate-500">
                                                            <Calendar className="w-3 h-3" /> Due: {rental.endDate}
                                                        </div>
                                                    </div>
                                                    <div className="text-center md:text-right space-y-2">
                                                        <span className="inline-block px-3 py-1 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-full text-xs font-bold lowercase">
                                                            {rental.status}
                                                        </span>

                                                        {/* Owner Actions */}
                                                        {user.id === rental.item.owner.id && rental.status === RentalStatus.ACTIVE && (
                                                            <div className="flex flex-col gap-2">
                                                                <button
                                                                    onClick={() => handleConfirmReturn(rental.id)}
                                                                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold transition"
                                                                >
                                                                    Confirm Return
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Completed Action: Leave Review */}
                                                        {rental.status === RentalStatus.COMPLETED && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedRentalId(rental.id);
                                                                    setIsReviewModalOpen(true);
                                                                }}
                                                                className="text-xs border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 mx-auto"
                                                            >
                                                                <Star className="w-3 h-3" /> Leave Review
                                                            </button>
                                                        )}


                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-10 text-center text-slate-500">
                                    No rental activity found. Start exploring!
                                </div>
                            )}
                        </div>

                        {/* My Listings */}
                        <div id="my-listings">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-cyan-400" /> My Listings
                            </h2>
                            {myListings.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {myListings.map(item => (
                                        <ItemCard key={item.id} item={item} isOwner={true} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-10 text-center text-slate-500">
                                    You haven't listed any items yet.
                                    <br />
                                    <Link to="/post" className="text-cyan-400 hover:underline mt-2 inline-block">Start earning now.</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Notifications */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-yellow-400" /> Notifications
                                </h2>
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
                            </div>

                            <div className="space-y-4">
                                {MOCK_NOTIFICATIONS.map(notif => (
                                    <Link
                                        to="#my-listings"
                                        key={notif.id}
                                        className={`block p-4 rounded-xl border transition hover:border-cyan-500/30 cursor-pointer ${notif.read ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-800/50 border-slate-700'}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1">
                                                {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                                                {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                                                {notif.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${notif.read ? 'text-slate-400' : 'text-white'}`}>{notif.title}</h4>
                                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                                                <p className="text-[10px] text-slate-500 mt-2">{notif.time}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-2 text-xs font-medium text-slate-400 hover:text-white transition border-t border-slate-800">
                                View All Notifications
                            </button>
                        </div>
                    </div>
                </div>

            </div>
            {/* Review Modal */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-white mb-2">Rate Your Experience</h2>
                        <p className="text-sm text-slate-400 mb-6">How was your transaction?</p>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setReviewRating(star)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Write a brief review..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm mb-4 focus:outline-none focus:border-cyan-500 resize-none h-24"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                className="py-2 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                className="py-2 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
        );
};

        export default Dashboard;