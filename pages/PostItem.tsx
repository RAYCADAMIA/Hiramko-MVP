import React, { useState } from 'react';
import { generateItemDescription } from '../services/geminiService';
import { CATEGORIES } from '../constants';
import { ItemCategory, LogisticsType } from '../types';
import { Sparkles, Camera, Loader2, UploadCloud, Truck, Bike, Hand, Ban, CalendarCheck } from 'lucide-react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface PostItemProps {
  onShowToast?: (message: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState('Good');
  const [price, setPrice] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [description, setDescription] = useState('');

  const [logisticsType, setLogisticsType] = useState<LogisticsType>(LogisticsType.LIGHT);
  const [allowSurvey, setAllowSurvey] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Guard: User must be logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, location.pathname]);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !description || !user) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1531297461136-82lw9z1w1e1d'; // Default fallback

      if (imageFile) {
        imageUrl = await api.uploadImage(imageFile, 'item-images');
      }

      await api.createItem({
        title,
        description,
        category: category as ItemCategory,
        pricePerDay: Number(price),
        condition: condition as any,
        images: [imageUrl],
        location: user.location || 'Davao City',
        depositAmount: Number(price) * 0.5,
        logisticsType,
        allowSurvey
      }, user);

      if (onShowToast) onShowToast('Item listed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to post item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!title || !keyFeatures) {
      alert("Please enter a title and some key features first.");
      return;
    }
    setIsGenerating(true);
    const generated = await generateItemDescription(title, category, condition, keyFeatures);
    setDescription(generated);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 pt-24">
      <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 border-b border-slate-800">
          <h1 className="text-3xl font-bold text-white font-display">List an Item</h1>
          <p className="text-slate-400 mt-2">Turn your idle assets into passive income. Secured by HiramKo.</p>
        </div>

        <div className="p-6 md:p-10 space-y-8">

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Item Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Canon EOS 5D Mark IV"
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {category === ItemCategory.OTHERS && (
                <input
                  type="text"
                  placeholder="Enter custom category"
                  className="w-full p-4 mt-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Daily Rate (₱)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2500"
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Heavily Used">Heavily Used</option>
              </select>
            </div>
          </div>

          {/* Logistics & Delivery Options */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-400">Logistics & Delivery Mode</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { type: LogisticsType.LIGHT, label: 'Light Item', desc: 'Motorcycle OK', icon: Bike },
                { type: LogisticsType.MEDIUM_HEAVY, label: 'Medium/Heavy', desc: 'Needs Car/Truck', icon: Truck },
                { type: LogisticsType.OWNER_DELIVERY, label: 'Owner Delivers', desc: 'You provide transport', icon: Hand },
                { type: LogisticsType.PICKUP_ONLY, label: 'No Delivery', desc: 'Pickup Only', icon: Ban },
              ].map((opt) => (
                <div
                  key={opt.type}
                  onClick={() => setLogisticsType(opt.type)}
                  className={`cursor-pointer p-4 rounded-xl border transition flex flex-col items-center text-center gap-2 ${logisticsType === opt.type ? 'bg-cyan-900/20 border-cyan-500 ring-1 ring-cyan-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                >
                  <opt.icon className={`w-6 h-6 ${logisticsType === opt.type ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div>
                    <div className={`text-sm font-bold ${logisticsType === opt.type ? 'text-white' : 'text-slate-300'}`}>{opt.label}</div>
                    <div className="text-xs text-slate-500">{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inquiry Options */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-green-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm">Allow Survey / Meetup?</h4>
              <p className="text-xs text-slate-500">Enable this for high-value items (Cars, Real Estate, Couture) so renters can inspect before renting.</p>
            </div>
            <input
              type="checkbox"
              checked={allowSurvey}
              onChange={(e) => setAllowSurvey(e.target.checked)}
              className="w-6 h-6 accent-cyan-500 cursor-pointer rounded bg-slate-800 border-slate-700"
            />
          </div>

          {/* AI Description Assistant */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-cyan-900/30 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Sparkles className="w-5 h-5" />
                <span>AI Smart Assist</span>
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <label className="text-sm font-medium text-slate-400">Key Features / Specs</label>
              <input
                type="text"
                value={keyFeatures}
                onChange={(e) => setKeyFeatures(e.target.value)}
                placeholder="e.g., Includes 2 batteries, waterproof case, 4k recording"
                className="w-full p-4 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleGenerateDescription}
              disabled={isGenerating}
              className="relative z-10 w-full sm:w-auto px-8 py-3 bg-cyan-700/20 hover:bg-cyan-700/40 text-cyan-300 border border-cyan-700/50 rounded-xl transition flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Description
            </button>

            <div className="space-y-2 pt-2 relative z-10">
              <label className="text-sm font-semibold text-slate-400">Final Description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="Generated description will appear here..."
              ></textarea>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400">Photos</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500 hover:bg-slate-900 transition relative overflow-hidden group">
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {imagePreview ? (
                <div className="relative w-full h-64">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <p className="text-white font-bold">Click to change</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-slate-800/80 transition">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-cyan-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-600 mt-1">SVG, PNG, JPG or GIF</p>
                </>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-10 py-4 rounded-xl font-bold transition shadow-lg shadow-cyan-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostItem;