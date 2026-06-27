import { useState, useEffect } from 'react';
import { Coffee, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { COFFEE_PERSONAS } from '../data';

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

      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 bg-oat border-2 border-espresso text-espresso hover:bg-espresso hover:text-cream transition-all duration-150 active:translate-y-px shadow-[2px_2px_0px_0px_rgba(45,41,38,1)] hover:shadow-none disabled:opacity-50"
            title="Refresh radar"
            id="header-refresh-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}

        <button
          onClick={onChangePersona}
          className="flex items-center gap-2 px-3 py-1.5 bg-oat border-2 border-espresso text-[11px] font-mono hover:bg-espresso hover:text-cream transition-all duration-150 active:translate-y-px shadow-[2px_2px_0px_0px_rgba(45,41,38,1)] hover:shadow-none"
          id="header-persona-btn"
        >
          <div 
            className="w-2 h-2 rounded-none" 
            style={{ backgroundColor: currentPersona.color }} 
          />
          <span className="font-semibold uppercase tracking-wider text-[10px]">{currentPersona.name}</span>
          <Sparkles className="w-3 h-3 text-gold" />
        </button>
      </div>
    </header>
  );
}
