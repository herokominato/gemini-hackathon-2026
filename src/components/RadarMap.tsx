import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, MapPin, Navigation, Send, Clock, Sparkles, Map as MapIcon, Compass } from 'lucide-react';
import { UserStatus } from '../types';
import { getPersonaAvatar, realToPercent, VERIFIED_HANGOUTS } from '../data';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface RadarMapProps {
  statuses: UserStatus[];
  currentClientId: string;
  onSelectStatus: (status: UserStatus) => void;
  selectedStatus: UserStatus | null;
  onPing: (status: UserStatus) => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim() !== '';

export default function RadarMap({
  statuses,
  currentClientId,
  onSelectStatus,
  selectedStatus,
  onPing,
}: RadarMapProps) {
  const [radarAngle, setRadarAngle] = useState(0);

  // Find current user status ("Hero" or current client status)
  const currentUserStatus = statuses.find(s => s.clientId === currentClientId) || 
                            statuses.find(s => s.personaName.toLowerCase().includes('hero'));

  const mapCenter = currentUserStatus 
    ? { lat: currentUserStatus.lat, lng: currentUserStatus.lng }
    : { lat: 35.6580, lng: 139.7016 }; // Shibuya center

  const heroPct = currentUserStatus 
    ? realToPercent(currentUserStatus.lat, currentUserStatus.lng)
    : { x: 50, y: 50 }; // default center

  // Rotate the radar sweep line continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 1.2) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Standard locations for Tokyo neighborhoods to print as labels (fallback mode)
  const NEIGHBORHOOD_LABELS = [
    { name: 'SHIMOKITAZAWA', x: 15, y: 35 },
    { name: 'YOYOGI KOEN', x: 30, y: 25 },
    { name: 'SHIBUYA', x: 45, y: 52 },
    { name: 'NAKAMEGURO', x: 35, y: 72 },
    { name: 'EBISU', x: 75, y: 82 },
  ];

  // Map custom light styling configuration
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    gestureHandling: 'cooperative',
    styles: [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#ebe3cd"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#523735"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#f5f1e6"
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#c9b2a6"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#dcd2be"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#ae9e90"
          }
        ]
      },
      {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#93817c"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#a5b076"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#447530"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f1e6"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#fdfcf8"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f8c967"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#e9bc62"
          }
        ]
      },
      {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e98d58"
          }
        ]
      },
      {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#db8555"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#806b63"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#8f7d77"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#ebe3cd"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#b9d3c2"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#92998d"
          }
        ]
      }
    ]
  };

  return (
    <div className="relative w-full flex-1 h-full bg-cream border border-espresso overflow-hidden select-none">
      
      {/* 1. MAP OR FALLBACK BACKGROUND */}
      {hasValidKey ? (
        <div className="w-full h-full relative z-0">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              key={currentUserStatus?.clientId || 'default'}
              defaultCenter={mapCenter}
              defaultZoom={13}
              gestureHandling="cooperative"
              options={mapOptions}
              mapId="7f1b11d01cc96456877c532c"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Radar sweep overlay anchored on the user */}
              <AdvancedMarker position={mapCenter}>
                <div className="relative flex items-center justify-center pointer-events-none" style={{ transform: 'translate(-50%, -50%)' }}>
                  {/* Concentric radar rings */}
                  <div className="w-[120px] h-[120px] rounded-full border border-gold/30 absolute" />
                  <div className="w-[240px] h-[240px] rounded-full border border-gold/20 absolute" />
                  <div className="w-[360px] h-[360px] rounded-full border border-gold/15 absolute" />
                  
                  {/* Dynamic scanning line */}
                  <div 
                    className="absolute w-[450px] h-[450px] origin-center pointer-events-none"
                    style={{ 
                      transform: `rotate(${radarAngle}deg)`,
                      background: 'conic-gradient(from 0deg, rgba(212, 163, 115, 0.22) 0deg, rgba(212, 163, 115, 0) 70deg, transparent 360deg)'
                    }}
                  />
                </div>
              </AdvancedMarker>

              {/* Verified Coffee Hangouts on Google Map */}
              {VERIFIED_HANGOUTS.map((shop) => (
                <AdvancedMarker
                  key={shop.id}
                  position={{ lat: shop.lat, lng: shop.lng }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border border-espresso/60 bg-cream flex items-center justify-center shadow-xs">
                      <Coffee className="w-3.5 h-3.5 text-espresso" />
                    </div>
                    <span className="font-mono text-[7px] text-espresso/60 uppercase tracking-wider bg-cream/80 px-1 border border-espresso/20 mt-0.5 scale-90">
                      {shop.name}
                    </span>
                  </div>
                </AdvancedMarker>
              ))}

              {/* Active Broadcasts on Google Map */}
              {statuses.map((status) => {
                const isSelected = selectedStatus?.id === status.id;
                return (
                  <AdvancedMarker
                    key={status.id}
                    position={{ lat: status.lat, lng: status.lng }}
                  >
                    <div 
                      onClick={() => onSelectStatus(status)}
                      className="relative flex flex-col items-center justify-center cursor-pointer group"
                    >
                      {/* Pulsing radar halo behind person profile */}
                      <div 
                        className="absolute w-12 h-12 scale-150 animate-ping opacity-25 rounded-none"
                        style={{ 
                          backgroundColor: status.personaColor,
                          animationDuration: '3.5s'
                        }} 
                      />

                      {/* Person Profile Icon Pin (Rounded-none vintage brutalist box) */}
                      <div 
                        className={`relative w-11 h-11 border bg-cream transition-all duration-300 rounded-none overflow-hidden ${
                          isSelected 
                            ? 'scale-110 border-espresso shadow-[6px_6px_0px_0px_rgba(45,41,38,1)] z-20' 
                            : 'border-espresso/40 hover:scale-105 shadow-[3px_3px_0px_0px_rgba(45,41,38,0.12)] hover:border-espresso hover:shadow-[4px_4px_0px_0px_rgba(45,41,38,1)]'
                        }`}
                        style={{ 
                          borderColor: isSelected ? '#2D2926' : status.personaColor,
                          borderWidth: '2.5px'
                        }}
                      >
                        <img
                          src={getPersonaAvatar(status.personaName)}
                          alt={status.personaName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
                          }}
                        />

                        {/* Micro active activity square */}
                        <span 
                          className="absolute -top-0.5 -right-0.5 w-3 h-3 border border-cream shadow-sm text-[5px] flex items-center justify-center font-bold text-white rounded-none"
                          style={{
                            backgroundColor: 
                              status.activity === 'Coffee' ? '#D4A373' :
                              status.activity === 'Drink' ? '#768959' : '#2D2926'
                          }}
                          title={status.activity}
                        />
                      </div>

                      {/* Popover text label */}
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-espresso text-cream px-2 py-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[8px] font-mono whitespace-nowrap z-30 uppercase tracking-widest border border-espresso">
                        {status.personaName} ({status.activity})
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}
            </Map>
          </APIProvider>
        </div>
      ) : (
        /* FALLBACK MINIMALIST VECTOR MAP */
        <div className="absolute inset-0 z-0 bg-cream">
          {/* Clean minimalist winding river representation */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M -50,160 Q 150,110 220,240 T 500,210"
              fill="none"
              stroke="#E4DCCF"
              strokeWidth="24"
              strokeLinecap="round"
              className="opacity-75"
            />
          </svg>

          {/* Tokyo Neighborhood Labels */}
          {NEIGHBORHOOD_LABELS.map((label, index) => (
            <div
              key={index}
              className="absolute pointer-events-none flex flex-col items-center select-none"
              style={{ left: `${label.x}%`, top: `${label.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-espresso/25 mb-1.5" />
              <span className="font-mono text-[9px] font-bold text-espresso/50 tracking-widest whitespace-nowrap">
                {label.name}
              </span>
            </div>
          ))}

          {/* Fallback Active Pins mapped from GPS to % */}
          <div className="absolute inset-0 z-10">
            {statuses.map((status) => {
              const isSelected = selectedStatus?.id === status.id;
              // Project real GPS coordinates to container percentages
              const pct = realToPercent(status.lat, status.lng);

              return (
                <button
                  key={status.id}
                  onClick={() => onSelectStatus(status)}
                  className="absolute p-2 -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-transform duration-150 group"
                  style={{ left: `${pct.x}%`, top: `${pct.y}%` }}
                >
                  {/* Pulsing beacon behind pin */}
                  <div 
                    className="absolute inset-0 scale-150 animate-ping opacity-35"
                    style={{ 
                      backgroundColor: status.personaColor,
                      animationDuration: '3s'
                    }} 
                  />

                  {/* Person Profile Icon Pin */}
                  <div 
                    className={`relative flex items-center justify-center w-11 h-11 border bg-cream transition-all duration-300 rounded-none overflow-hidden ${
                      isSelected 
                        ? 'scale-110 border-espresso bg-oat shadow-[6px_6px_0px_0px_rgba(45,41,38,1)] z-20' 
                        : 'border-espresso/40 hover:scale-105 shadow-[3px_3px_0px_0px_rgba(45,41,38,0.12)] hover:border-espresso hover:shadow-[4px_4px_0px_0px_rgba(45,41,38,1)]'
                    }`}
                    style={{ 
                      borderColor: isSelected ? '#2D2926' : status.personaColor,
                      borderWidth: '2.5px'
                    }}
                  >
                    <img
                      src={getPersonaAvatar(status.personaName)}
                      alt={status.personaName}
                      className="w-full h-full object-cover animate-fade-in"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
                      }}
                    />

                    {/* Micro active activity square */}
                    <span 
                      className="absolute -top-0.5 -right-0.5 w-3 h-3 border border-cream shadow-sm text-[5px] flex items-center justify-center font-bold text-white rounded-none"
                      style={{
                        backgroundColor: 
                          status.activity === 'Coffee' ? '#D4A373' :
                          status.activity === 'Drink' ? '#768959' : '#2D2926'
                      }}
                      title={status.activity}
                    />
                  </div>

                  {/* Popover label (appears on hover) */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-espresso text-cream px-2 py-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[8px] font-mono whitespace-nowrap z-30 uppercase tracking-widest border border-espresso">
                    {status.personaName} ({status.activity})
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mini informational notice about Google Maps key */}
          <div className="absolute top-3 right-3 bg-espresso/90 border border-gold/30 text-gold px-2.5 py-1.5 font-mono text-[8px] max-w-[200px] leading-relaxed select-none z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] flex flex-col gap-1">
            <div className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span>OFFLINE MAP MODE</span>
            </div>
            <p className="text-cream/80 text-[7px]">
              Set <strong>GOOGLE_MAPS_PLATFORM_KEY</strong> in Settings (⚙️) to overlay this coffee sweep onto a real styled Google Map!
            </p>
          </div>
        </div>
      )}

      {/* 2. RADAR SWEEPING OVERLAY (OFFLINE/FALLBACK MODE) */}
      {!hasValidKey && (
        <div 
          className="absolute pointer-events-none z-5 flex items-center justify-center"
          style={{ left: `${heroPct.x}%`, top: `${heroPct.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          {/* Concentric radar rings */}
          <div className="w-[120px] h-[120px] rounded-full border border-gold/30 absolute" />
          <div className="w-[240px] h-[240px] rounded-full border border-gold/20 absolute" />
          <div className="w-[360px] h-[360px] rounded-full border border-gold/15 absolute" />
          
          {/* Dynamic scanning line */}
          <div 
            className="absolute w-[450px] h-[450px] origin-center pointer-events-none"
            style={{ 
              transform: `rotate(${radarAngle}deg)`,
              background: 'conic-gradient(from 0deg, rgba(212, 163, 115, 0.22) 0deg, rgba(212, 163, 115, 0) 70deg, transparent 360deg)'
            }}
          />
        </div>
      )}

      {/* 3. RADAR SYSTEM STATUS INDICATOR */}
      <div className="absolute bottom-3 left-3 bg-cream/90 backdrop-blur-xs border-2 border-espresso text-espresso p-2.5 font-mono text-[9px] flex items-center gap-2 z-10 shadow-[4px_4px_0px_0px_rgba(45,41,38,1)]">
        <span className="w-2 h-2 rounded-none bg-matcha animate-pulse" />
        <span className="industrial text-[9px] tracking-wider uppercase font-bold">
          {hasValidKey ? 'Google Maps: Live' : 'Radar: Synced'}
        </span>
        <span className="text-gold font-bold">● {statuses.length} expats online</span>
      </div>

      {/* 4. QUICK INTERACTION DRAWER FOR SELECTED PIN */}
      <AnimatePresence>
        {selectedStatus && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="absolute bottom-0 inset-x-0 bg-cream border-t border-espresso z-30 p-4 shadow-[0_-4px_12px_rgba(45,41,38,0.15)]"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <img
                  src={getPersonaAvatar(selectedStatus.personaName)}
                  alt={selectedStatus.personaName}
                  className="w-6 h-6 object-cover border border-espresso rounded-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
                  }}
                />
                <span className="font-serif text-lg font-bold text-espresso">
                  {selectedStatus.personaName}
                </span>
                {selectedStatus.clientId === currentClientId && (
                  <span className="bg-matcha/25 border border-matcha text-matcha font-mono text-[8px] font-bold px-1.5 py-0.2">
                    YOU
                  </span>
                )}
              </div>
              <button 
                onClick={() => onSelectStatus(null as any)}
                className="text-espresso/40 hover:text-espresso font-mono text-xs border border-espresso/20 hover:border-espresso px-1.5 py-0.5 bg-oat/50"
              >
                CLOSE
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-1.5 font-mono text-xs text-espresso/70">
                <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span className="truncate font-semibold text-espresso">{selectedStatus.locationName}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-espresso/70">
                <Clock className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span>Expires in <span className="font-semibold text-espresso">
                  {Math.max(0, Math.ceil((new Date(selectedStatus.expiresAt).getTime() - new Date().getTime()) / 60000))}m
                </span></span>
              </div>
            </div>

            {selectedStatus.note && (
              <div className="bg-oat border-l-2 border-gold p-2 text-xs italic text-espresso/80 font-serif mb-3 line-clamp-2">
                "{selectedStatus.note}"
              </div>
            )}

            <div className="flex gap-2">
              {selectedStatus.clientId !== currentClientId ? (
                <button
                  onClick={() => onPing(selectedStatus)}
                  className="flex-1 bg-espresso text-cream hover:bg-gold hover:text-espresso font-mono text-xs font-bold py-2.5 flex items-center justify-center gap-2 border border-espresso transition-all duration-150 hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(45,41,38,1)] active:translate-y-px"
                >
                  <Send className="w-3.5 h-3.5" />
                  PING TO CHAT
                </button>
              ) : (
                <div className="flex-1 text-center font-mono text-[10px] text-espresso/50 py-2 border border-dashed border-espresso/30 bg-oat/30">
                  YOUR ACTIVE BROADCAST
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
