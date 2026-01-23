import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Zap, X } from 'lucide-react';
import { CATEGORIES } from '../constants';
import ItemCard from '../components/ItemCard';
import { fetchItems } from '../services/items';
import { Item } from '../types';

const Home: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const loadItems = async () => {
            try {
                const data = await fetchItems();
                setItems(data || []);
            } catch (error) {
                console.error('Failed to load items', error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        loadItems();
    }, []);

    useEffect(() => {
        let result = items;

        // Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(item => item.category === selectedCategory);
        }

        // Text Search Filter
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(lowSearch) ||
                item.description.toLowerCase().includes(lowSearch) ||
                item.location.toLowerCase().includes(lowSearch)
            );
        }

        setFilteredItems(result);
    }, [selectedCategory, searchTerm, items]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-950">
            {/* Hero Section - Search Bar Restored Here */}
            <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden pt-16">
                <div className="absolute inset-0 bg-slate-950">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_60%)]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono mb-6 backdrop-blur-sm animate-fade-in-up">
                        <Zap className="w-3 h-3" /> PREMIER RENTAL PLATFORM
                    </div>

                    <div className="text-center max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                                Rent what you need. <br /> Earn on what you own.
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                                List, browse, rent, or borrow items of any type—gadgets, tools, appliances, costumes, books, instruments, vehicles, and more.
                            </p>
                        </div>

                        {/* Restored Hero Search Bar */}
                        <div className="relative max-w-xl mx-auto group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-slate-900/80 backdrop-blur-xl rounded-full p-2 shadow-2xl">
                                <Search className="ml-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search for cameras, drones, tools..."
                                    className="w-full bg-transparent border-0 outline-none text-white placeholder-slate-500 px-4 py-2"
                                />
                                <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-2.5 rounded-full font-medium hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm font-bold">
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sticky Categories Only */}
            <section className="sticky top-16 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50 py-4">
                <div className="container mx-auto px-4 overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex items-center gap-3 w-max min-w-full">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${selectedCategory === category
                                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(8,145,178,0.3)]'
                                    : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Results Grid Section */}
            <section className="container mx-auto px-4 py-8 mb-20">
                <div className="flex justify-end mb-6">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        {filteredItems.length} items found
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {filteredItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                        {filteredItems.length === 0 && (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
                                {items.length === 0 ? (
                                    <>
                                        <div className="w-24 h-24 bg-cyan-500/10 rounded-[2rem] flex items-center justify-center border border-cyan-500/20 relative group">
                                            <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                            <Zap className="w-10 h-10 text-cyan-400 relative z-10 animate-pulse" />
                                        </div>
                                        <div className="max-w-md">
                                            <h3 className="text-3xl font-black text-white mb-2 font-display">No items listed yet</h3>
                                            <p className="text-slate-400 text-lg">Be the first player to list an item in your area and start earning today!</p>
                                        </div>
                                        <Link
                                            to="/post"
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-lg transition-all shadow-xl shadow-cyan-900/20 active:scale-95"
                                        >
                                            Post Item Now
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                                            <Search className="w-6 h-6 text-slate-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">No items match your search</h3>
                                            <p className="text-slate-500 text-sm">Explore other categories or try different keywords.</p>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
                                            className="bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 px-6 py-2 rounded-xl text-sm font-bold hover:bg-cyan-600/20 transition"
                                        >
                                            Clear All
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
