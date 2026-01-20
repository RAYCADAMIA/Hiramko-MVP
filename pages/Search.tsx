import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import ItemCard from '../components/ItemCard';
import { Search as SearchIcon, SlidersHorizontal, PlusCircle, Frown, Sparkles, SearchX, Filter, X } from 'lucide-react';
import { getSmartSearchSuggestions } from '../services/geminiService';
import { User, LogisticsType } from '../types';

interface SearchProps {
  user: User | null;
  onShowToast: (message: string) => void;
}

import { api } from '../services/api';
import { Item } from '../types';

const Search: React.FC<SearchProps> = ({ user, onShowToast }) => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);
  const initialQuery = queryParams.get('q') || '';
  const initialCategory = queryParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Advanced Filters
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [logisticsFilter, setLogisticsFilter] = useState<LogisticsType | 'All'>('All');
  const [sortOption, setSortOption] = useState<'recommended' | 'price_asc' | 'price_desc' | 'newest'>('recommended');
  const [showFilters, setShowFilters] = useState(false); // Mobile toggle

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (initialQuery) setSearchTerm(initialQuery);
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialQuery, initialCategory]);

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice = item.pricePerDay >= minPrice && item.pricePerDay <= maxPrice;
    const matchesLogistics = logisticsFilter === 'All' || item.logisticsType === logisticsFilter;

    return matchesCategory && matchesSearch && matchesPrice && matchesLogistics;
  }).sort((a, b) => {
    if (sortOption === 'price_asc') return a.pricePerDay - b.pricePerDay;
    if (sortOption === 'price_desc') return b.pricePerDay - a.pricePerDay;
    // if (sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // assuming createdAt exists
    return 0;
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        const result = await getSmartSearchSuggestions(searchTerm);
        setSuggestions(result);
      } else {
        setSuggestions([]);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Simple heuristic for "gibberish"
  const isLikelyGibberish = (text: string) => {
    if (!text || text.length < 4) return false;
    const consonants = text.match(/[bcdfghjklmnpqrstvwxyz]/gi);
    const vowels = text.match(/[aeiou]/gi);
    // If no vowels and long enough, or repeating chars like 'aaaa'
    if (!vowels && text.length > 4) return true;
    if (/(.)\1{3,}/.test(text)) return true;
    return false;
  };

  const handleListNowClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      onShowToast("You need to log in first");
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      {/* Search Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">

            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for gear..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all shadow-inner"
              />
              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl mt-2 p-2 z-50 shadow-2xl">
                  <p className="text-xs font-semibold text-slate-500 px-3 py-2 uppercase tracking-wider">AI Suggestions</p>
                  {suggestions.map((s, i) => (
                    <div key={i} className="px-3 py-2 hover:bg-slate-800 hover:text-cyan-400 rounded-lg cursor-pointer text-sm text-slate-300 transition-colors" onClick={() => {
                      setSearchTerm(s);
                      setSuggestions([]);
                    }}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedCategory === 'All' ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.4)]' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'}`}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedCategory === cat ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.4)]' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 border border-slate-800 bg-slate-900 rounded-xl hover:bg-slate-800 text-slate-400 transition lg:hidden flex items-center justify-center"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar Filters */}
        {/* Sidebar Filters - Mobile Drawer & Desktop Sidebar */}
        <>
          {/* Mobile Backdrop */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
              onClick={() => setShowFilters(false)}
            />
          )}

          <div className={`
              lg:block space-y-6
              ${showFilters
              ? 'fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800 z-50 p-6 shadow-2xl animate-in slide-in-from-right duration-300'
              : 'hidden'
            }
              lg:static lg:w-auto lg:bg-transparent lg:border-none lg:p-0 lg:shadow-none lg:z-auto
           `}>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 h-full lg:h-auto overflow-y-auto lg:overflow-visible">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-lg lg:text-base">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="lg:hidden text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Price Range (Daily)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Min"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Logistics Type */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Logistics Required</label>
                <div className="space-y-2">
                  {['All', LogisticsType.LIGHT, LogisticsType.MEDIUM_HEAVY, LogisticsType.OWNER_DELIVERY, LogisticsType.PICKUP_ONLY].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="logistics"
                        checked={logisticsFilter === type}
                        onChange={() => setLogisticsFilter(type as any)}
                        className="accent-cyan-500 w-4 h-4"
                      />
                      <span className={`text-sm ${logisticsFilter === type ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'}`}>
                        {type === 'All' ? 'Any Type' : type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Footer Actions */}
              <div className="mt-8 pt-4 border-t border-slate-800 lg:hidden">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold transition"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        </>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white font-display">
              {filteredItems.length} Listings Found
            </h2>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Listed</option>
            </select>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
              {isLikelyGibberish(searchTerm) ? (
                <>
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <SearchX className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Hmm, that looks like a typo</h3>
                  <p className="text-slate-400 max-w-md mb-8">
                    We couldn't find anything for "{searchTerm}". Did you mean to type "Camera", "Drill", or "Tent"?
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-cyan-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Sparkles className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No results for this combination</h3>
                  <p className="text-slate-400 max-w-md mb-8">
                    Try adjusting your filters or search term to see more results.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                      setMinPrice(0);
                      setMaxPrice(10000);
                      setLogisticsFilter('All');
                    }}
                    className="text-cyan-400 hover:underline"
                  >
                    Clear all filters
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;