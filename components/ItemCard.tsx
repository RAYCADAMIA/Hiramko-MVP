import React from 'react';
import { Item } from '../types';
import { MapPin, ShieldCheck, Star, Edit, Trash2, MessageSquare, ShieldCheck as Shield, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { getTimeAgo } from '../services/utils';

interface ItemCardProps {
  item: Item;
  isOwner?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, isOwner }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  // Format price to Peso format
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(item.pricePerDay);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showNotification({
      title: 'Delete Listing?',
      message: 'Are you sure you want to remove this item? This action cannot be undone.',
      type: 'warning',
      confirmText: 'Yes, Delete',
      onConfirm: async () => {
        await api.deleteItem(item.id);
        showNotification({
          title: 'Deleted',
          message: 'Your listing has been removed.',
          type: 'info'
        });
        window.location.reload(); // Simple refresh to update UI
      }
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/item/${item.id}/edit`);
  };

  return (
    <Link to={`/item/${item.id}`} className="group glass-panel rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-cyan-500/30 transition-all duration-300 flex flex-col h-full relative border border-slate-800 bg-slate-900/40">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700 text-[10px] font-bold uppercase tracking-wider text-cyan-400 shadow-lg">
          {item.category}
        </div>

        {/* Trust Badge - Top Right */}
        {item.owner.verified && (
          <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white p-1.5 rounded-full shadow-lg border border-emerald-400/50 flex items-center justify-center group/tooltip">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="absolute right-full mr-2 bg-slate-900 text-[10px] text-white py-1 px-2 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-800">Verified Lender</span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-200 line-clamp-1 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
          <div className="flex items-center gap-1 text-yellow-500 text-sm bg-slate-950/40 px-2 py-0.5 rounded-full border border-slate-800/50">
            <Star className="w-3 h-3 fill-yellow-500" />
            <span className="font-bold text-xs">{item.owner.rating}</span>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1 font-light leading-relaxed">{item.description}</p>

        <div className="flex items-center justify-between mt-auto mb-4">
          <div className="flex items-center text-xs text-slate-500 gap-1.5">
            <MapPin className="w-3 h-3 text-cyan-500" />
            <span className="truncate max-w-[100px]">{item.location}</span>
          </div>
          <span className="text-[9px] text-slate-600 font-mono uppercase">{getTimeAgo(item.createdAt)}</span>
        </div>

        {isOwner ? (
          <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-slate-800/50">
            <button
              onClick={handleEdit}
              className="flex flex-col items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition-colors p-1.5 hover:bg-slate-800/50 rounded-xl"
            >
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            <button className="flex flex-col items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-yellow-400 transition-colors p-1.5 hover:bg-slate-800/50 rounded-xl">
              <MessageSquare className="w-3.5 h-3.5" /> Requests
            </button>
            <button
              onClick={handleDelete}
              className="flex flex-col items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-800/50 rounded-xl"
            >
              <Trash2 className="w-3.5 h-3.5" /> Unlist
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/50 mt-auto">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img src={item.owner.avatar} alt={item.owner.name} className="w-7 h-7 rounded-full border border-slate-700 object-cover shadow-sm" />
                {item.owner.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-slate-900 shadow-sm">
                    <ShieldCheck className="w-2 h-2 text-white stroke-[4px]" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-200 font-bold truncate max-w-[80px]">{item.owner.name}</span>
                <span className="text-[9px] text-emerald-500 font-medium flex items-center gap-0.5">
                  <ShieldCheck className="w-2 h-2" /> Trusted
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex flex-col items-end">
                <span className="text-lg font-black text-white">{formattedPrice}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">PER DAY</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ItemCard;
