import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ShieldCheck, Calendar, MessageCircle, Star, AlertTriangle, ChevronLeft, ChevronRight, Truck, Bike, Hand, Ban, CalendarCheck, MessageSquare } from 'lucide-react';
import { UserType, Item, LogisticsType } from '../types';
import { User } from '../types';
import { getItemById } from '../services/items';

interface ItemDetailsProps {
  user: User | null;
  onShowToast: (message: string) => void;
  onToggleChat?: () => void;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ user, onShowToast, onToggleChat }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  // Defensive state defaults
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Modals & Payment State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  // Delivery mode fixed to pickup/owner arranged
  const deliveryMode = 'pickup';

  // Date State
  const [startDate, setStartDate] = useState<string>('2023-11-12');
  const [endDate, setEndDate] = useState<string>('2023-11-15');

  // Debug logging
  console.log("Rendering ItemDetails. ID:", id, "Loading:", loading, "Item:", item);

  // Helper for date calc (safe to run always)
  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const days = calculateDays();

  // Price calculation - MUST be safe against null item
  // Defaults used if item is null, but UI won't show it anyway due to early returns
  // Safe defaults prevent crash during 'loading' or 'not found' render passes
  const pricePerDay = item?.pricePerDay || 0;
  const platformFee = 15;
  const depositAmount = item?.depositAmount || 0;
  const rentalTotal = pricePerDay * days;
  const grandTotal = rentalTotal + platformFee;

  useEffect(() => {
    let isMounted = true;

    // Force timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.error("ItemDetails load timed out");
        setLoading(false);
      }
    }, 5000);

    if (id) {
      setLoading(true);
      getItemById(id)
        .then(data => {
          if (isMounted) {
            setItem(data);
          }
        })
        .catch(err => {
          console.error("Error fetching item:", err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [id]);

  const handleHiramKo = () => {
    if (!user) {
      onShowToast("Please log in to rent items");
      navigate('/login', { state: { from: location.pathname } });
      return;
    }



    // Safe access
    if ((user.escrowBalance || 0) < depositAmount) {
      setIsErrorModalOpen(true);
      return;
    }

    setIsBookingModalOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-slate-400 gap-4">
      <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
      <p>Loading item details...</p>
    </div>
  );

  // Robust check for item existence
  if (!item) return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-slate-400 gap-6">
      <div className="p-4 bg-slate-900 rounded-full">
        <AlertTriangle className="w-8 h-8 text-slate-500" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Item Not Found</h2>
        <p className="text-sm">The item you are looking for does not exist or has been removed.</p>
        <p className="text-xs text-slate-600 mt-2">ID: {id || 'N/A'}</p>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  );

  const formatMoney = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₱0.00';
    try {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
      }).format(amount);
    } catch (e) {
      return `₱${amount}`;
    }
  };

  // Safe image access
  const images = item?.images || [];
  const safeImage = images[currentImageIndex] || 'https://via.placeholder.com/800x600?text=No+Image';

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Safe data access
  const ownerName = item?.owner?.name || 'Unknown Owner';
  const ownerAvatar = item?.owner?.avatar || 'https://via.placeholder.com/150';
  const category = item?.category || 'General';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 pt-24 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Images & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Carousel */}
          <div className="aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative group select-none">
            <img
              src={safeImage}
              alt={item.title}
              className="w-full h-full object-cover transition-opacity duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none"></div>

            <div className="absolute bottom-4 left-4 z-10">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-slate-700 rounded-full text-xs font-mono text-cyan-400">
                {category}
              </span>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-cyan-400 w-4' : 'bg-slate-500 hover:bg-slate-300'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="mb-4 text-slate-500 hover:text-cyan-400 flex items-center gap-1 text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to result
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-display">{item.title}</h1>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4 text-cyan-500" /> {item.location}
                </div>
                <span className="text-slate-600">|</span>
                <span className={`text-sm font-medium ${item.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {item.isAvailable ? 'Available Now' : 'Currently Rented'}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right bg-slate-900/50 p-3 rounded-xl border border-slate-800 inline-block sm:block">
              <div className="text-3xl font-bold text-cyan-400 font-mono">{formatMoney(item.pricePerDay)}</div>
              <div className="text-slate-500 text-xs uppercase tracking-wide">per day</div>
            </div>
          </div>

          <div className="h-px bg-slate-800 my-8"></div>

          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-bold text-white mb-4 font-display">About this item</h3>
            <p className="text-slate-300 leading-relaxed">{item.description}</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h4 className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-2">Condition</h4>
              <p className="text-white font-bold text-lg">{item.condition}</p>
            </div>
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h4 className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-2">Security Deposit</h4>
              <p className="text-cyan-400 font-bold text-lg font-mono">{formatMoney(item.depositAmount)}</p>
            </div>
          </div>

          {/* Logistics Info */}
          <div className="mt-4 bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-lg text-cyan-400">
              <Hand />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Logistics: Self Pickup / Owner Delivery</h4>
              <p className="text-xs text-slate-400">
                You will need to arrange pickup or delivery directly with the owner via chat.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Booking & Owner - Fixed Sticky Container */}
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
          {/* Booking Card */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-slate-800">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-3">Rental Period</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-700 bg-slate-950 rounded-lg p-3 hover:border-cyan-500/50 transition cursor-pointer">
                  <div className="text-xs text-slate-500 mb-1">Start</div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-white text-sm font-medium w-full focus:outline-none"
                  />
                </div>
                <div className="border border-slate-700 bg-slate-950 rounded-lg p-3 hover:border-cyan-500/50 transition cursor-pointer">
                  <div className="text-xs text-slate-500 mb-1">End</div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-white text-sm font-medium w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-400 mb-6 font-mono">
              <div className="flex justify-between">
                <span>{formatMoney(item.pricePerDay)} x {days} days</span>
                <span>{formatMoney(rentalTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>{formatMoney(platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Self Pickup / Owner Delivery</span>
                <span>Free / Arrange in Chat</span>
              </div>
              <div className="h-px bg-slate-800 my-2"></div>
              <div className="flex justify-between font-bold text-lg text-white">
                <span>Total</span>
                <span>{formatMoney(grandTotal)}</span>
              </div>
            </div>

            {
              user && user.id === item.owner.id ? (
                // Owner View: Hide Booking Card Content
                <div className="p-4 bg-slate-800/50 rounded-xl text-center text-slate-400 text-sm">
                  You are the owner of this item.
                  <Link to={`/item/${item.id}/edit`} className="block mt-2 text-cyan-400 hover:text-cyan-300 font-bold">
                    Edit Item Details
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleHiramKo}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold transition shadow-[0_0_20px_rgba(8,145,178,0.4)] flex items-center justify-center gap-2"
                  >
                    Hiram Ko
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        if (!user) navigate('/login', { state: { from: location.pathname } });
                        else navigate('/messages');
                      }}
                      className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition border border-slate-700 flex items-center justify-center gap-2 text-sm"
                    >
                      <MessageSquare className="w-4 h-4" /> Inquire First
                    </button>
                    {item.allowSurvey && (
                      <button
                        onClick={() => {
                          if (!user) navigate('/login', { state: { from: location.pathname } });
                          else navigate('/messages'); // Ideally specific logic for scheduling
                        }}
                        className="py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl font-bold transition border border-slate-700 flex items-center justify-center gap-2 text-sm"
                      >
                        <CalendarCheck className="w-4 h-4" /> Survey/Meet
                      </button>
                    )}
                  </div>
                </div>
              )
            }

            <div className="mt-4 flex items-start gap-2 text-xs text-slate-400 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p>
                <span className="font-bold text-white">Note:</span> Security deposit of <span className="text-cyan-400 font-bold">₱{item.depositAmount}</span> must be secured in <Link to="/deposit" className="text-cyan-400 underline hover:text-cyan-300">escrow</Link> before renting.
              </p>
            </div>
          </div>

          {/* Owner Profile */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-300 mb-4 text-sm uppercase tracking-wider">Lender Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img src={item.owner.avatar} alt={item.owner.name} className="w-14 h-14 rounded-full border-2 border-slate-700" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <div className="font-bold text-lg text-white flex items-center gap-2">
                  {item.owner.name}
                  {item.owner.verified && <ShieldCheck className="w-4 h-4 text-cyan-500" />}
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span>{item.owner.rating} Rating</span>
                </div>

              </div>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  onShowToast("Please log in to chat with the lister");
                  navigate('/login', { state: { from: location.pathname } });
                } else {
                  navigate('/messages');
                }
              }}
              className="w-full border border-slate-700 bg-slate-800 text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Chat with {item.owner.name.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {
        isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <h2 className="text-xl font-bold text-white mb-6">Confirm Rental</h2>

              <div className="space-y-6">
                {/* Delivery Option */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Delivery Method</label>
                  <div className="grid grid-cols-1 gap-3">
                    <div
                      className={`p-3 rounded-xl border text-sm font-medium bg-cyan-500/10 border-cyan-500 text-cyan-400`}
                    >
                      Self Pickup / Owner Delivery (Arrange in Chat)
                    </div>
                  </div>
                </div>

                {/* Guarantees */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Item Guarantee</h4>
                      <p className="text-xs text-slate-400">Item is verified to be in good condition.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Payment Protection</h4>
                      <p className="text-xs text-slate-400">Payment is held until you confirm receipt.</p>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <span className="text-slate-400">Total to Pay</span>
                  <span className="text-2xl font-bold text-white">
                    {formatMoney(grandTotal)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    navigate(`/checkout/${item.id}?start=${startDate}&end=${endDate}`);
                  }}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                </button>

                <p className="text-center text-[10px] text-slate-500">
                  By proceeding, you agree to our Rental Terms & Conditions.
                </p>
              </div>
            </div>
          </div>
        )
      }

      {/* Error Modal for Insufficient Escrow */}
      {
        isErrorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Insufficient Escrow</h3>
              <p className="text-slate-400 mb-6">
                Add escrow credits first before you can rent. You need at least <span className="text-white font-bold">{formatMoney(depositAmount)}</span>.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsErrorModalOpen(false)}
                  className="py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <Link
                  to="/deposit"
                  className="py-3 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center justify-center"
                >
                  Add Credits
                </Link>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default ItemDetails;