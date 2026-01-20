import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Zap } from 'lucide-react';
import { CATEGORIES } from '../constants';
import ItemCard from '../components/ItemCard';
import { api } from '../services/api';
import { Item } from '../types';

const Home: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await api.getItems();
        setItems(data);
      } catch (error) {
        console.error('Failed to load items', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden pt-16">
        {/* Abstract Tech Background */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_60%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono mb-6 backdrop-blur-sm animate-fade-in-up">
            <Zap className="w-3 h-3" /> PREMIER RENTAL PLATFORM
          </div>

          <div className="text-center max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              Rent what you need. <br /> Earn on what you own.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              List, browse, rent, or borrow items of any type—gadgets, tools, appliances, costumes, books, instruments, vehicles, and more.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <form onSubmit={handleSearch} className="relative flex items-center bg-slate-900/80 backdrop-blur-xl rounded-full p-2 shadow-2xl">
                <Search className="ml-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for cameras, drones, tools..."
                  className="w-full bg-transparent border-0 outline-none text-white placeholder-slate-500 px-4 py-2"
                />
                <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
            Browse by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category, index) => (
            <Link
              to={`/search?category=${encodeURIComponent(category)}`}
              key={category}
              className="group relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] block text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 text-slate-300 group-hover:text-white font-medium">{category}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
            Fresh Listings
          </h2>
          <button className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-sm font-medium transition-colors group">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 col-span-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-10">
                No items found. Be the first to list something!
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;