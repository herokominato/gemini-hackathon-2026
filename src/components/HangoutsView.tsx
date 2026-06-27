import { useState } from 'react';
import { motion } from 'motion/react';
import { Coffee, MapPin, Clock, Compass, Filter, Share2, Star } from 'lucide-react';
import { CoffeeShop } from '../types';
import { VERIFIED_HANGOUTS, NEIGHBORHOODS } from '../data';

interface HangoutsViewProps {
  onSelectShopForBroadcast: (shop: CoffeeShop) => void;
  onLocateOnRadar: (shop: CoffeeShop) => void;
}

export default function HangoutsView({
  onSelectShopForBroadcast,
  onLocateOnRadar,
}: HangoutsViewProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);

  // Filter hangouts based on selected neighborhood
  const filteredHangouts = selectedNeighborhood
    ? VERIFIED_HANGOUTS.filter(h => h.neighborhood === selectedNeighborhood)
    : VERIFIED_HANGOUTS;

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Editorial Title banner */}
      <div className="p-4 border-b border-espresso bg-oat/50">
        <h2 className="editorial text-3xl text-espresso leading-tight tracking-tight">
          Verified Coffee Hubs
        </h2>
        <p className="text-xs text-espresso/60 font-sans mt-1">
          Curated modern spaces in Tokyo vetted for spontaneous expat meetups. Great lighting, friendly baristas, high-quality roasts.
        </p>
      </div>

      {/* Neighborhood Filters horizontal list */}
      <div className="p-3 border-b border-espresso bg-cream flex gap-1.5 overflow-x-auto select-none">
        <button
          onClick={() => setSelectedNeighborhood(null)}
          className={`px-3 py-1.5 font-mono text-xs border border-espresso whitespace-nowrap transition-colors duration-150 ${
            selectedNeighborhood === null
              ? 'bg-espresso text-cream font-bold'
              : 'bg-cream hover:bg-oat text-espresso'
          }`}
        >
          ALL HUBS ({VERIFIED_HANGOUTS.length})
        </button>

        {NEIGHBORHOODS.map((n) => {
          const count = VERIFIED_HANGOUTS.filter(h => h.neighborhood === n).length;
          return (
            <button
              key={n}
              onClick={() => setSelectedNeighborhood(n)}
              className={`px-3 py-1.5 font-mono text-xs border border-espresso whitespace-nowrap transition-colors duration-150 ${
                selectedNeighborhood === n
                  ? 'bg-espresso text-cream font-bold'
                  : 'bg-cream hover:bg-oat text-espresso'
              }`}
            >
              {n.toUpperCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-20">
        {filteredHangouts.map((shop) => (
          <motion.div
            key={shop.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-espresso bg-cream shadow-[4px_4px_0px_0px_rgba(45,41,38,1)] overflow-hidden flex flex-col group"
          >
            {/* Curated Interior Photography */}
            <div className="relative h-44 border-b-2 border-espresso overflow-hidden bg-espresso/10">
              <img
                src={shop.photoUrl}
                alt={shop.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale-20 hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
              />
              
              {/* Neighborhood badge */}
              <div className="absolute top-3 left-3 bg-espresso border border-cream text-cream font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                {shop.neighborhood}
              </div>

              {/* Hours badge */}
              <div className="absolute bottom-3 right-3 bg-cream/90 border border-espresso text-espresso font-mono text-[8px] font-bold px-2 py-0.5 flex items-center gap-1 backdrop-blur-xs">
                <Clock className="w-3 h-3 text-gold" />
                {shop.hours}
              </div>
            </div>

            {/* Shop Details */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="editorial text-xl text-espresso tracking-tight group-hover:text-gold transition-colors">
                    {shop.name}
                  </h3>
                  <span className="flex items-center gap-0.5 text-xs font-mono text-gold font-bold">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <span>5.0</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px] text-espresso/50 mt-1 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span className="truncate">{shop.address}</span>
                </div>

                <p className="editorial text-sm text-espresso/70 italic mt-3 leading-relaxed border-l-2 border-gold pl-3">
                  "{shop.description}"
                </p>

                {/* Features list */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-espresso/10">
                  {shop.features.map((f, i) => (
                    <span
                      key={i}
                      className="bg-oat border border-espresso/15 text-[9px] font-mono font-medium text-espresso/75 px-1.5 py-0.5"
                    >
                      #{f.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 border-t border-espresso/10 pt-3 mt-1">
                <button
                  onClick={() => onLocateOnRadar(shop)}
                  className="py-2 border border-espresso font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 bg-cream hover:bg-oat transition-colors duration-100"
                >
                  <Compass className="w-3.5 h-3.5 text-gold" />
                  LOCATE ON RADAR
                </button>

                <button
                  onClick={() => onSelectShopForBroadcast(shop)}
                  className="py-2 border border-espresso font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 bg-espresso text-cream hover:bg-gold hover:text-espresso transition-colors duration-150 shadow-[2px_2px_0px_0px_rgba(45,41,38,1)] active:translate-y-px active:shadow-none"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  BROADCAST HERE
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredHangouts.length === 0 && (
          <div className="text-center py-12 border border-dashed border-espresso/30 p-4">
            <Filter className="w-8 h-8 text-espresso/30 mx-auto mb-2" />
            <p className="font-serif text-base font-bold text-espresso">No hubs in this neighborhood</p>
            <p className="text-xs text-espresso/50 mt-1 font-sans">We are constantly vetting new Tokyo spots. Choose another filter or suggest one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
