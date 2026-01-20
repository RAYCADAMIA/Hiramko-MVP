import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, ArrowRight, Lock, CheckCircle2, Loader2, AlertTriangle, ChevronLeft } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Item, Rental } from '../types';

const Checkout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const startDate = searchParams.get('start') || '';
    const endDate = searchParams.get('end') || '';
    // Deprecated deliveryMode, assume pickup/owner arranged
    const deliveryMode = 'pickup';

    useEffect(() => {
        if (!id) return;
        api.getItemById(id).then(data => {
            setItem(data);
            setLoading(false);
        });
    }, [id]);

    const calculateDays = () => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    };

    const days = calculateDays();
    const pricePerDay = item?.pricePerDay || 0;
    const platformFee = 15;
    const rentalTotal = pricePerDay * days;
    const depositAmount = item?.depositAmount || 0;
    const grandTotal = rentalTotal + platformFee;

    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);

    const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPaymentProof(file);
            setProofPreview(URL.createObjectURL(file));
        }
    };

    const handleConfirmPayment = async () => {
        if (!user || !item || !paymentProof) return;
        setProcessing(true);

        try {
            // 1. Create Rental first (Unpaid)
            const rental = await api.createRental({
                item: item,
                renter: user,
                startDate: startDate,
                endDate: endDate,
                totalPrice: grandTotal,
                deliveryMethod: deliveryMode,
            });

            // 2. Upload Proof
            const proofUrl = await api.uploadImage(paymentProof, 'item-images'); // Reusing bucket

            // 3. Submit Proof
            await api.submitPaymentProof(rental.id, proofUrl);

            setPaymentSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Payment submission failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
    );

    if (!item) return <div className="pt-24 text-center">Item not found</div>;

    if (paymentSuccess) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl max-w-lg w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Payment Submitted!</h1>
                    <p className="text-slate-400">
                        We've sent your payment receipt to <span className="text-white font-bold">{item.owner.name}</span>. Once valid, your rental will be activated.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-cyan-900/20"
                    >
                        Go to Dashboard
                    </button>
                    <Link to="/messages" className="block text-sm text-cyan-400 hover:underline">Chat with Owner</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-12 px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left: Summary */}
                <div className="space-y-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-slate-500 hover:text-white flex items-center gap-2 transition"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to details
                    </button>

                    <h1 className="text-4xl font-bold text-white font-display">Secure Checkout</h1>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex gap-4 p-4">
                        <img src={item.images[0]} alt={item.title} className="w-24 h-24 object-cover rounded-lg" />
                        <div>
                            <h2 className="font-bold text-lg text-white">{item.title}</h2>
                            <p className="text-slate-400 text-sm flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-cyan-400" /> Professional Rental
                            </p>
                            <div className="mt-2 text-xs font-mono text-cyan-400">
                                {startDate} → {endDate} ({days} days)
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-white uppercase text-xs tracking-widest text-slate-500">Rental Details</h3>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-sm text-slate-300">
                            <div className="flex justify-between">
                                <span>₱{pricePerDay.toLocaleString()} x {days} days</span>
                                <span>₱{rentalTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Processing</span>
                                <span>₱{platformFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Self Pickup / Owner Delivery</span>
                                <span>Free / Via Chat</span>
                            </div>
                            <div className="h-px bg-slate-800 my-2"></div>
                            <div className="flex justify-between text-white font-bold text-lg">
                                <span>Grand Total</span>
                                <span>₱{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Manual Payment Config */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">

                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            GCash Transfer
                        </h3>

                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl space-y-3 mb-6">
                            <p className="text-xs text-blue-300 font-bold uppercase">Send Payment To:</p>
                            <div className="flex justify-between items-center text-white">
                                <span className="text-sm text-slate-400">Account Name</span>
                                <span className="font-bold">{item.owner.gcashName}</span>
                            </div>
                            <div className="flex justify-between items-center text-white">
                                <span className="text-sm text-slate-400">GCash Number</span>
                                <span className="font-bold font-mono text-xl tracking-wider text-cyan-400">{item.owner.gcashNumber}</span>
                            </div>
                            <div className="flex justify-between items-center text-white border-t border-blue-500/30 pt-2">
                                <span className="text-sm text-slate-400">Amount to Send</span>
                                <span className="font-bold text-green-400">₱{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-slate-400">Upload Payment Screenshot / Receipt</label>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProofChange}
                                    className="hidden"
                                    id="proof-upload"
                                />
                                <label htmlFor="proof-upload" className={`cursor-pointer block w-full p-4 border-2 border-dashed rounded-xl text-center transition ${proofPreview ? 'border-cyan-500 bg-cyan-900/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'}`}>
                                    {proofPreview ? (
                                        <div className="relative h-48">
                                            <img src={proofPreview} alt="Proof" className="h-full w-full object-contain rounded-lg" />
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs py-1">Click to Change</div>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-slate-500">
                                            <p className="mb-2">Click to Upload Proof</p>
                                            <p className="text-xs">JPG, PNG screenshots accepted</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <Lock className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    Funds will be held in escrow. The Owner must verify this receipt before the rental starts.
                                </p>
                            </div>

                            <button
                                onClick={handleConfirmPayment}
                                disabled={processing || !paymentProof}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold transition shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>Submit Payment Proof <CheckCircle2 className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
