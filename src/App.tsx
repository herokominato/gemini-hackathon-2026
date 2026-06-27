import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Coffee, MessageSquare, Plus, AlertCircle, RefreshCw, Smartphone, Monitor, Sparkles } from 'lucide-react';

import Header from './components/Header';
import RadarMap from './components/RadarMap';
import BroadcastSheet from './components/BroadcastSheet';
import HangoutsView from './components/HangoutsView';
import ChatsView from './components/ChatsView';

import { COFFEE_PERSONAS, VERIFIED_HANGOUTS } from './data';
import { UserStatus, ChatRoom, CoffeeShop } from './types';

export default function App() {
  // Client state
  const [clientId, setClientId] = useState('');
  const [currentPersona, setCurrentPersona] = useState({ name: 'Flat White', color: '#D4A373' });
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);

  // Core navigation: 'radar' | 'hangouts' | 'chats'
  const [activeTab, setActiveTab] = useState<'radar' | 'hangouts' | 'chats'>('radar');

  // Application Data States
  const [statuses, setStatuses] = useState<UserStatus[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeBroadcast, setActiveBroadcast] = useState<UserStatus | null>(null);
  
  // Interaction States
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | null>(null);
  const [isBroadcastSheetOpen, setIsBroadcastSheetOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize Client ID and Persona on first startup
  useEffect(() => {
    // 1. Get or create Client ID
    let savedClientId = localStorage.getItem('yorimichi_clientId');
    if (!savedClientId) {
      savedClientId = 'client-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('yorimichi_clientId', savedClientId);
    }
    setClientId(savedClientId);

    // 2. Get or create Coffee Persona
    const savedPersonaName = localStorage.getItem('yorimichi_personaName');
    if (savedPersonaName) {
      const matched = COFFEE_PERSONAS.find(p => p.name === savedPersonaName);
      if (matched) {
        setCurrentPersona(matched);
      }
    } else {
      // Pick random initial persona
      const randomPersona = COFFEE_PERSONAS[Math.floor(Math.random() * COFFEE_PERSONAS.length)];
      setCurrentPersona(randomPersona);
      localStorage.setItem('yorimichi_personaName', randomPersona.name);
    }
  }, []);

  // Fetch radar statuses and active chats
  const handleFetchData = useCallback(async (quiet = false) => {
    if (!clientId) return;
    if (!quiet) setIsRefreshing(true);
    
    try {
      // Fetch active statuses on radar map
      const radarRes = await fetch('/api/radar');
      if (radarRes.ok) {
        const data: UserStatus[] = await radarRes.json();
        setStatuses(data);
        
        // Find if this client has an active broadcast in the list
        const mine = data.find(s => s.clientId === clientId);
        setActiveBroadcast(mine || null);
      }

      // Fetch user pings (chat rooms)
      const chatsRes = await fetch(`/api/chats?clientId=${clientId}`);
      if (chatsRes.ok) {
        const chatData: ChatRoom[] = await chatsRes.json();
        setRooms(chatData);
      }
    } catch (err) {
      console.error('Error fetching data from server:', err);
    } finally {
      if (!quiet) setIsRefreshing(false);
    }
  }, [clientId]);

  // Fetch on mount or when client ID updates
  useEffect(() => {
    if (clientId) {
      handleFetchData();
    }
  }, [clientId, handleFetchData]);

  // Handle active broadcast updates
  const handleBroadcast = async (broadcastData: any) => {
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/api' }, // standard json
        body: JSON.stringify(broadcastData)
      });
      if (res.ok) {
        const newStatus = await res.json();
        setActiveBroadcast(newStatus);
        handleFetchData(true);
        setActiveTab('radar');
      } else {
        const err = await res.json();
        triggerError(err.error || 'Failed to broadcast status');
      }
    } catch (err) {
      triggerError('Server connection error. Please try again.');
    }
  };

  // Cancel current broadcast status
  const handleCancelBroadcast = async () => {
    if (!clientId) return;
    try {
      const res = await fetch('/api/broadcast/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      if (res.ok) {
        setActiveBroadcast(null);
        handleFetchData(true);
      }
    } catch (err) {
      console.error('Failed to delete broadcast:', err);
    }
  };

  // Initiate Ping to another user (create chat)
  const handlePing = async (targetStatus: UserStatus) => {
    if (!clientId) return;
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusId: targetStatus.id,
          pingerClientId: clientId,
          pingerPersona: currentPersona.name
        })
      });

      if (res.ok) {
        const room: ChatRoom = await res.json();
        // Add room to local list if not already there
        if (!rooms.some(r => r.id === room.id)) {
          setRooms(prev => [room, ...prev]);
        }
        
        // Clear active pin popover, switch to chat screen, select the room!
        setSelectedStatus(null);
        setActiveTab('chats');
        setSelectedRoomId(room.id);
      } else {
        const err = await res.json();
        triggerError(err.error || 'Failed to ping coffee companion');
      }
    } catch (err) {
      triggerError('Could not ping. Server seems offline.');
    }
  };

  // Send message inside chat room
  const handleSendMessage = async (roomId: string, text: string) => {
    try {
      const res = await fetch(`/api/chats/${roomId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderClientId: clientId,
          senderPersona: currentPersona.name,
          text
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        
        // Append message to active room locally
        setRooms(prevRooms => 
          prevRooms.map(room => {
            if (room.id === roomId) {
              return {
                ...room,
                messages: [...room.messages, newMsg]
              };
            }
            return room;
          })
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Quick Action: select a curated shop from "Hangouts" tab and go to broadcast wizard
  const handleSelectShopForBroadcast = (shop: CoffeeShop) => {
    setIsBroadcastSheetOpen(true);
    // Since broadcast sheet opens step by step, we will pass a custom callback
    // handled internally in the sheet component
  };

  // Quick Action: find coffee shop location on map and center it
  const handleLocateOnRadar = (shop: CoffeeShop) => {
    // Filter map statuses to highlight or locate
    const existing = statuses.find(s => s.coffeeShopId === shop.id);
    if (existing) {
      setSelectedStatus(existing);
    } else {
      // If no active status is there, simulate a quick locator popover or show a mock status at that shop
      const tempStatus: UserStatus = {
        id: `locate-${shop.id}`,
        personaName: `${shop.name}`,
        personaColor: '#D4A373',
        activity: 'Coffee',
        neighborhood: shop.neighborhood,
        locationName: shop.name,
        coffeeShopId: shop.id,
        duration: 60,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        note: `Vetted space: ${shop.description}`,
        clientId: 'vetted-system',
        lat: shop.lat,
        lng: shop.lng
      };
      setStatuses(prev => {
        if (!prev.some(s => s.id === tempStatus.id)) {
          return [tempStatus, ...prev];
        }
        return prev;
      });
      setSelectedStatus(tempStatus);
    }
    setActiveTab('radar');
  };

  // Change Coffee Persona handler
  const handleSelectPersona = (persona: { name: string; color: string }) => {
    setCurrentPersona(persona);
    localStorage.setItem('yorimichi_personaName', persona.name);
    setShowPersonaSelector(false);
  };

  // Error trigger util
  const triggerError = (msg: string) => {
    setErrorBanner(msg);
    setTimeout(() => {
      setErrorBanner(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-oat flex items-center justify-center p-0 md:p-6 font-sans">
      {/* Editorial Decorative Background for Desktop */}
      <div className="hidden md:flex flex-col absolute left-8 top-1/2 -translate-y-1/2 w-64 gap-3 text-espresso/40">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-espresso/80">Yorimichi</h1>
        <p className="font-sans text-xs uppercase tracking-widest border-b border-espresso/20 pb-2">寄道 (Detour)</p>
        <p className="font-serif text-sm italic leading-relaxed text-espresso/70">
          "Japanese cultural philosophy celebrating the spontaneous pitstops, sudden detours, and coffee meetups that enrich our urban journeys."
        </p>
        <div className="mt-4 flex flex-col gap-1.5 font-mono text-[10px] uppercase">
          <div className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-gold" /> Mobile-Optimized Web App</div>
          <div className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-gold" /> Built with React & Tailwind 4</div>
        </div>
      </div>

      <div className="hidden md:flex flex-col absolute right-8 top-1/2 -translate-y-1/2 w-64 gap-3 text-espresso/40 text-right">
        <h4 className="font-serif text-lg font-bold text-espresso/80">Tokyo Social Radar</h4>
        <div className="h-0.5 bg-espresso/15 w-full my-1" />
        <p className="font-mono text-[9px] uppercase tracking-widest text-espresso/60">Modern Coffee Vibe</p>
        <div className="text-xs space-y-2 leading-relaxed text-espresso/70 font-sans">
          <p>• Sharp 0px borders</p>
          <p>• Monoline 1px layout grids</p>
          <p>• Real-time broadcast sync</p>
          <p>• Ephemeral 2-hour chat scrubs</p>
        </div>
      </div>

      {/* PRIMARY MOBILE SCREEN WRAPPER */}
      <div className="w-full max-w-md h-screen md:h-[840px] bg-cream md:border-2 md:border-espresso md:shadow-[12px_12px_0px_0px_rgba(45,41,38,1)] flex flex-col relative overflow-hidden">
        
        {/* Error banner indicator */}
        <AnimatePresence>
          {errorBanner && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-0 inset-x-0 bg-[#9E2A2B] text-cream text-xs font-mono p-3 text-center z-50 flex items-center justify-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorBanner}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header (Clock, Persona widget) */}
        <Header 
          currentPersona={currentPersona} 
          onChangePersona={() => setShowPersonaSelector(true)} 
          onRefresh={handleFetchData}
          isRefreshing={isRefreshing}
        />

        {/* MAIN BODY AREA WITH TAB PAGES */}
        <main className="flex-1 overflow-hidden relative bg-cream">
          {activeTab === 'radar' && (
            <div className="h-full flex flex-col">
              {/* Map Canvas Element */}
              <RadarMap 
                statuses={statuses} 
                currentClientId={clientId}
                onSelectStatus={setSelectedStatus} 
                selectedStatus={selectedStatus}
                onPing={handlePing}
              />
            </div>
          )}

          {activeTab === 'hangouts' && (
            <HangoutsView 
              onSelectShopForBroadcast={handleSelectShopForBroadcast}
              onLocateOnRadar={handleLocateOnRadar}
            />
          )}

          {activeTab === 'chats' && (
            <ChatsView 
              rooms={rooms}
              currentClientId={clientId}
              currentPersona={currentPersona}
              onSendMessage={handleSendMessage}
              onRefreshChats={() => handleFetchData(true)}
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
            />
          )}
        </main>

        {/* STICKY BOTTOM NAVIGATION BAR */}
        <nav className="border-t-2 border-espresso bg-cream h-20 flex relative z-25 px-4 md:px-8 items-center justify-between">
          <button
            onClick={() => {
              setActiveTab('radar');
              setSelectedRoomId(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full border-r border-espresso/10 transition-colors ${
              activeTab === 'radar' ? 'bg-oat text-espresso font-bold border-b-2 border-espresso' : 'text-espresso/50 hover:text-espresso hover:bg-oat/10'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="industrial text-[9px] tracking-widest mt-0.5">Radar</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('hangouts');
              setSelectedRoomId(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full border-r border-espresso/10 transition-colors ${
              activeTab === 'hangouts' ? 'bg-oat text-espresso font-bold border-b-2 border-espresso' : 'text-espresso/50 hover:text-espresso hover:bg-oat/10'
            }`}
          >
            <Coffee className="w-5 h-5" />
            <span className="industrial text-[9px] tracking-widest mt-0.5">Hangouts</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('chats');
            }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors relative ${
              activeTab === 'chats' ? 'bg-oat text-espresso font-bold border-b-2 border-espresso' : 'text-espresso/50 hover:text-espresso hover:bg-oat/10'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="industrial text-[9px] tracking-widest mt-0.5">Pings</span>
            
            {/* Unread dot count */}
            {rooms.length > 0 && (
              <span className="absolute top-4 right-1/4 w-2 h-2 rounded-none bg-[#9E2A2B]" />
            )}
          </button>
        </nav>

        {/* BOTTOM SHEET - BROADCAST WIZARD */}
        <AnimatePresence>
          {isBroadcastSheetOpen && (
            <BroadcastSheet 
              currentPersona={currentPersona}
              clientId={clientId}
              activeBroadcast={activeBroadcast}
              onBroadcast={handleBroadcast}
              onCancelBroadcast={handleCancelBroadcast}
              onClose={() => setIsBroadcastSheetOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* MODAL - COFFEE PERSONA SELECTOR */}
        <AnimatePresence>
          {showPersonaSelector && (
            <div className="fixed inset-0 bg-espresso/70 backdrop-blur-xs flex items-center justify-center z-50 p-6">
              {/* Click outside to close */}
              <div className="absolute inset-0" onClick={() => setShowPersonaSelector(false)} />

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-cream border-2 border-espresso max-w-sm w-full p-5 shadow-[6px_6px_0px_0px_rgba(45,41,38,1)] z-10 space-y-4 relative"
              >
                <div>
                  <h3 className="editorial text-xl text-espresso flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold" />
                    Select Your Coffee Persona
                  </h3>
                  <p className="text-xs text-espresso/50 mt-1 font-sans">
                    Choose your anonymous callsign. It updates your marker badge dynamically on Tokyo maps.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {COFFEE_PERSONAS.map((p) => {
                    const isSelected = currentPersona.name === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => handleSelectPersona(p)}
                        className={`p-2.5 border text-left flex items-center gap-2 transition-all rounded-none ${
                          isSelected
                            ? 'bg-oat border-espresso font-bold shadow-[2px_2px_0px_0px_rgba(45,41,38,1)]'
                            : 'bg-cream border-espresso/20 hover:bg-oat/30'
                        }`}
                      >
                        <div 
                          className="w-3.5 h-3.5 rounded-none flex-shrink-0" 
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="font-mono text-xs text-espresso">{p.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-espresso/10 pt-3 flex justify-end">
                  <button
                    onClick={() => setShowPersonaSelector(false)}
                    className="px-4 py-2 border border-espresso font-mono text-xs font-bold hover:bg-oat active:translate-y-px"
                  >
                    CANCEL
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
