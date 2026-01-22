import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItemById, updateItem } from '../services/items';
import { supabase } from '../services/supabase';
import { Item } from '../types';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';

const EditItem: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<Item | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [deposit, setDeposit] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (id) {
            getItemById(id).then(setItem);
        }
    }, [id]);

    useEffect(() => {
        if (item) {
            setTitle(item.title);
            setDescription(item.description);
            setPrice(item.pricePerDay.toString());
            setDeposit(item.depositAmount.toString());
        }
    }, [item]);

    if (!item) return <div className="p-20 text-center text-slate-400">Loading item...</div>;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (!id) return;
            const { error } = await updateItem(id, {
                title,
                description,
                pricePerDay: Number(price),
                depositAmount: Number(deposit)
            });

            if (error) throw error;

            alert('Item updated successfully!');
            navigate(`/item/${id}`);
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12">
            <div className="max-w-2xl mx-auto px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-400 hover:text-white mb-6 transition"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Item
                </button>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        Edit Item Details
                    </h1>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Item Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Daily Rate (₱)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Security Deposit (₱)</label>
                                <input
                                    type="number"
                                    value={deposit}
                                    onChange={(e) => setDeposit(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                />
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3 text-sm text-yellow-200">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>Changing the price or deposit amount will not affect active rentals.</p>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition shadow-lg shadow-cyan-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4" /> Save Changes
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
