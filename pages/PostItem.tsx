import React, { useState, useRef } from 'react';
import { generateItemDescription } from '../services/geminiService';
import { CATEGORIES } from '../constants';
import { ItemCategory, LogisticsType } from '../types';
import { Sparkles, Camera, Loader2, UploadCloud, Truck, Bike, Hand, Ban, CalendarCheck, Info, ShieldAlert, MapPin, X, Film, PlayCircle, Navigation, ChevronRight, ChevronLeft } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const libraries: ("places")[] = ["places"];

const PostItem: React.FC = () => {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState('Good');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [description, setDescription] = useState('');

  const [logisticsType, setLogisticsType] = useState<LogisticsType>(LogisticsType.LIGHT);
  const [allowSurvey, setAllowSurvey] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 7.0722, lng: 125.6108 }); // Davao
  const [markerPos, setMarkerPos] = useState({ lat: 7.0722, lng: 125.6108 });

  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Guard: User must be logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, location.pathname]);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remainingSlots = 10 - images.length;
      const filesToProcess = files.slice(0, remainingSlots);

      if (files.length > remainingSlots) {
        showNotification({
          title: 'Limit Reached',
          message: 'You can only upload up to 10 images total.',
          type: 'warning'
        });
      }

      const newImages = filesToProcess.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));

      setImages(prev => [...prev, ...newImages]);
      if (errors.image) setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!price || Number(price) <= 0) newErrors.price = 'Valid price is required';
    if (!deposit || Number(deposit) < 0) newErrors.deposit = 'Deposit is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = 'Description is required';
    if (images.length === 0) newErrors.image = 'At least one photo is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const uploadedUrls = await Promise.all(
        images.map(img => api.uploadImage(img.file, 'item-images'))
      );

      await api.createItem({
        title,
        description,
        category: category as ItemCategory,
        pricePerDay: Number(price),
        condition: condition as any,
        images: uploadedUrls,
        location: locationName || user.location || 'Davao City',
        depositAmount: Number(deposit),
        logisticsType,
        allowSurvey
      }, user);

      showNotification({
        title: 'Listing Live!',
        message: 'Your item has been listed successfully.',
        type: 'success'
      });
      navigate('/dashboard#my-listings');
    } catch (error) {
      console.error('Error creating item:', error);
      showNotification({
        title: 'Listing Failed',
        message: 'Something went wrong. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(newPos);
          setMarkerPos(newPos);
          setLocationName("Current Location Detected");
        },
        () => {
          showNotification({ title: 'GPS Error', message: 'Could not detect location.', type: 'error' });
        }
      );
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setMapCenter(newPos);
        setMarkerPos(newPos);
        setLocationName(place.formatted_address || place.name || "");
      }
    }
  };

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(pos);
      setLocationName(`Pinned Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-800 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
          <div
            className="h-full bg-cyan-500 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-800/50">
          <div>
            <h2 className="text-2xl font-black text-white font-display">List New Item</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Step {step} of 3 • {step === 1 ? 'Details' : step === 2 ? 'Media' : 'Logistics'}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-slate-800 rounded-2xl transition text-slate-500 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 ml-1">Item Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Sony A7III Camera"
                  className={`w-full p-4 bg-slate-950 border ${errors.title ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl text-white placeholder-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 ml-1">Category <span className="text-red-500">*</span></label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItemCategory)}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 ml-1">Condition <span className="text-red-500">*</span></label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Heavily Used">Heavily Used</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 ml-1">Daily Rate (₱) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (!deposit) setDeposit((Number(e.target.value) * 0.5).toString());
                    }}
                    className={`w-full p-4 bg-slate-950 border ${errors.price ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300 ml-1">Security Deposit (₱) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 ml-1">Upload Photos ({images.length}/10) <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 hover:border-cyan-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer group transition-all"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-600 group-hover:text-cyan-400 mb-1" />
                    <span className="text-[10px] uppercase font-bold text-slate-600">Add Pic</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                      multiple
                    />
                  </div>
                  {images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-slate-800 rounded-2xl relative group overflow-hidden border border-slate-700">
                      <img src={img.preview} className="w-full h-full object-cover" alt="Preview" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.image && <p className="text-xs text-red-400">{errors.image}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-300 ml-1">Description <span className="text-red-500">*</span></label>
                  <button
                    onClick={async () => {
                      if (!title) return alert("Add a title first!");
                      setIsGenerating(true);
                      const desc = await generateItemDescription(title, category, condition, "");
                      setDescription(desc);
                      setIsGenerating(false);
                    }}
                    disabled={isGenerating}
                    className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1 hover:text-cyan-300 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" /> {isGenerating ? 'Drafting...' : 'AI Draft'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full p-4 bg-slate-950 border ${errors.description ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none`}
                  placeholder="Tell renters about your item..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 ml-1">Location Preferred Area (Optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 z-20" />
                  {isLoaded && GOOGLE_MAPS_API_KEY ? (
                    <Autocomplete
                      onLoad={(ref) => autocompleteRef.current = ref}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <input
                        type="text"
                        placeholder="Search location..."
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="w-full p-4 pl-12 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      placeholder={loadError ? "Maps Offline - Manual Entry" : "Loading maps..."}
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full p-4 pl-12 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none"
                    />
                  )}
                  <button
                    onClick={handleDetectLocation}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500"
                  >
                    <Navigation className="w-5 h-5" />
                  </button>
                </div>

                {/* Map Container - Only show if Key is present and loaded */}
                <div className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative">
                  {isLoaded && GOOGLE_MAPS_API_KEY ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={mapCenter}
                      zoom={14}
                      onClick={onMapClick}
                      options={{
                        styles: [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] }],
                        disableDefaultUI: true
                      }}
                    >
                      <Marker position={markerPos} draggable onDragEnd={(e) => e.latLng && onMapClick(e as any)} />
                    </GoogleMap>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=7.0722,125.6108&zoom=13&size=400x200&style=feature:all|element:labels|visibility:off&style=feature:all|element:geometry|color:0x1a212e')] bg-cover grayscale opacity-30">
                      <MapPin className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Map Preview Disabled</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 ml-1">Logistics Preferred</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: LogisticsType.LIGHT, icon: Bike, label: 'Motorcycle' },
                    { type: LogisticsType.PICKUP_ONLY, icon: Ban, label: 'Pickup Only' },
                  ].map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => setLogisticsType(opt.type)}
                      className={`p-4 rounded-2xl border flex items-center gap-3 transition ${logisticsType === opt.type ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                    >
                      <opt.icon className="w-5 h-5" />
                      <span className="text-xs font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-start gap-4">
                <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0" />
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider mb-1">HiramKo Safe Tip</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    "High quality photos increase your booking rate by up to 300%."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 border-t border-slate-800/50 flex gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            onClick={() => {
              if (step === 1 && validateStep1()) setStep(2);
              else if (step === 2 && validateStep2()) setStep(3);
              else if (step === 3) handleSubmit();
            }}
            disabled={loading}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-tighter text-lg transition shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : step === 3 ? 'Publish Listing' : 'Next Step'}
            {step < 3 && !loading && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostItem;