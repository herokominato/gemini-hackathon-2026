import { useState, useEffect } from 'react';
import { Coffee, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { COFFEE_PERSONAS, getPersonaAvatar } from '../data';

interface HeaderProps {
  currentPersona: { name: string; color: string };
  onChangePersona: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Header({ currentPersona, onChangePersona, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="border-b-2 border-espresso bg-cream p-4 md:px-8 flex items-center justify-between relative z-20 select-none">
      <div className="flex items-baseline gap-1.5">
        <span className="editorial text-3xl md:text-4xl tracking-tighter text-espresso">
          Yorimichi
        </span>
        <div className="w-2 h-2 rounded-full bg-matcha animate-pulse" />
      </div>

      <div className="flex items-center gap-1.5">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 bg-oat border-2 border-espresso text-espresso hover:bg-espresso hover:text-cream transition-all duration-150 active:translate-y-px shadow-[1.5px_1.5px_0px_0px_rgba(45,41,38,1)] hover:shadow-none disabled:opacity-50"
            title="Refresh radar"
            id="header-refresh-btn"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}

        <button
          onClick={onChangePersona}
          className="flex items-center gap-2 px-2.5 py-1 bg-oat border-2 border-espresso text-[9.5px] font-mono hover:bg-espresso hover:text-cream transition-all duration-150 active:translate-y-px shadow-[1.5px_1.5px_0px_0px_rgba(45,41,38,1)] hover:shadow-none"
          id="header-persona-btn"
        >
          <div className="relative w-5 h-5 rounded-none border border-espresso flex-shrink-0 overflow-hidden bg-cream">
            <img 
              src={getPersonaAvatar(currentPersona.name)} 
              alt={currentPersona.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
              }}
            />
            <div 
              className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-none" 
              style={{ backgroundColor: currentPersona.color }} 
            />
          </div>
          <span className="font-semibold uppercase tracking-wider text-[8.5px]">{currentPersona.name}</span>
          <Sparkles className="w-2.5 h-2.5 text-gold" />
        </button>
      </div>
    </header>
  );
}
