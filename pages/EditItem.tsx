import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Item, ItemCategory, LogisticsType } from '../types';
import { CATEGORIES } from '../constants';
import { ChevronLeft, Save, AlertCircle, Camera, UploadCloud, Truck, Bike, Hand, Ban, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const EditItem: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [condition, setCondition] = useState('Good');
    const [price, setPrice] = useState('');
    const [deposit, setDeposit] = useState('');
    const [location, setLocation] = useState('');
    const [logisticsType, setLogisticsType] = useState<LogisticsType>(LogisticsType.LIGHT);
    const [allowSurvey, setAllowSurvey] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (id) {
            api.getItemById(id).then(item => {
                if (item) {
                    setTitle(item.title);
                    setDescription(item.description);
                    setCategory(item.category);
                    setCondition(item.condition);
                    setPrice(item.pricePerDay.toString());
                    setDeposit(item.depositAmount.toString());
                    setLocation(item.location);
                    setLogisticsType(item.logisticsType);
                    setAllowSurvey(item.allowSurvey);
                    setImagePreview(item.images[0]);
                }
                setLoading(false);
            });
        }
    }, [id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsSaving(true);

        try {
            let imageUrl = imagePreview || '';
            if (imageFile) {
                imageUrl = await api.uploadImage(imageFile, 'item-images');
            }

            await api.updateItem(id, {
                title,
                description,
                category: category as ItemCategory,
                condition: condition as any,
                pricePerDay: Number(price),
                depositAmount: Number(deposit),
                location,
                logisticsType,
                allowSurvey,
                images: [imageUrl]
            });

            showNotification({
                title: 'Item Updated',
                message: 'Your changes have been saved successfully.',
                type: 'success'
            });
            navigate(`/item/${id}`);
        } catch (error) {
            console.error('Error updating item:', error);
            showNotification({
                title: 'Update Failed',
                message: 'We couldn’t save your changes. Please try again.',
                type: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-400 hover:text-white mb-6 transition"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Item
                </button>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-blue-600"></div>

                    <h1 className="text-3xl font-bold text-white mb-8 font-display">Edit Item Details</h1>

                    <form onSubmit={handleSave} className="space-y-10">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as ItemCategory)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition resize-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Section 2: Pricing & Location */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pricing & Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Daily Rate (₱)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Security Deposit (₱)</label>
                                    <input
                                        type="number"
                                        value={deposit}
                                        onChange={(e) => setDeposit(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Location</label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="City, District"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Photo & Logistics */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Photo & Logistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-3">
                                    <div className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950 hover:border-cyan-500 transition overflow-hidden group">
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                                <UploadCloud className="w-10 h-10 mb-2" />
                                                <span className="text-xs font-bold uppercase">Change Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { type: LogisticsType.LIGHT, icon: Bike, label: 'Light' },
                                        { type: LogisticsType.MEDIUM_HEAVY, icon: Truck, label: 'Medium' },
                                        { type: LogisticsType.OWNER_DELIVERY, icon: Hand, label: 'Owner' },
                                        { type: LogisticsType.PICKUP_ONLY, icon: Ban, label: 'Pickup' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.type}
                                            type="button"
                                            onClick={() => setLogisticsType(opt.type)}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${logisticsType === opt.type ? 'bg-cyan-600/10 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                        >
                                            <opt.icon className="w-5 h-5" />
                                            <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CalendarCheck className="w-5 h-5 text-cyan-400" />
                                    <div>
                                        <div className="text-sm font-bold text-white">Allow Survey?</div>
                                        <div className="text-xs text-slate-500">Renters can inspect before booking</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAllowSurvey(!allowSurvey)}
                                    className={`w-12 h-6 rounded-full p-1 transition ${allowSurvey ? 'bg-cyan-600' : 'bg-slate-800'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${allowSurvey ? 'translate-x-6' : ''}`}></div>
                                </button>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-800 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-8 py-4 rounded-xl text-slate-400 hover:text-white transition font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition shadow-lg shadow-cyan-900/40 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? 'Saving Changes...' : (
                                    <>
                                        <Save className="w-5 h-5" /> Update Listing
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditItem;
