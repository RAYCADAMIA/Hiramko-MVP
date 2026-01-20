import React from 'react';
import { Item, UserType } from '../types';
import { MapPin, ShieldCheck, Star, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ItemCardProps {
  item: Item;
  isOwner?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, isOwner }) => {
  // Format price to Peso format
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(item.pricePerDay);

  return (
    <Link to={`/item/${item.id}`} className="group glass-panel rounded-xl overflow-hidden hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:border-cyan-500/30 transition-all duration-300 flex flex-col h-full relative">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>


        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded border border-slate-700 text-xs font-medium text-cyan-400 shadow-sm">
          {item.category}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-200 line-clamp-1 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            <Star className="w-3 h-3 fill-yellow-400" />
            <span className="font-mono">{item.owner.rating}</span>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1 font-light">{item.description}</p>

        <div className="flex items-center text-xs text-slate-500 mb-4 gap-1">
          <MapPin className="w-3 h-3 text-cyan-600" />
          {item.location}
        </div>

        {isOwner ? (
          <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-slate-800">
            <button className="flex flex-col items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition-colors p-1 hover:bg-slate-800 rounded">
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            <button className="flex flex-col items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-yellow-400 transition-colors p-1 hover:bg-slate-800 rounded">
              <MessageSquare className="w-3.5 h-3.5" /> Requests
            </button>
            <button className="flex flex-col items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-red-400 transition-colors p-1 hover:bg-slate-800 rounded">
              <Trash2 className="w-3.5 h-3.5" /> Unlist
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-auto">
            <div className="flex items-center gap-2">
              <img src={item.owner.avatar} alt={item.owner.name} className="w-6 h-6 rounded-full border border-slate-600" />
              <span className="text-xs text-slate-400 font-medium truncate max-w-[100px]">{item.owner.name}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-cyan-400 font-mono">{formattedPrice}</span>
              <span className="text-xs text-slate-500 ml-1">/day</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ItemCard;