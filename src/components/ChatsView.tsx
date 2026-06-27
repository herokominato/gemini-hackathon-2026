import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Clock, Trash2, ArrowLeft, Coffee, Sparkles, MapPin } from 'lucide-react';
import { ChatRoom, ChatMessage } from '../types';

interface ChatsViewProps {
  rooms: ChatRoom[];
  currentClientId: string;
  currentPersona: { name: string; color: string };
  onSendMessage: (roomId: string, text: string) => Promise<void>;
  onRefreshChats: () => Promise<void>;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
}

export default function ChatsView({
  rooms,
  currentClientId,
  currentPersona,
  onSendMessage,
  onRefreshChats,
  selectedRoomId,
  onSelectRoom,
}: ChatsViewProps) {
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [secondsTick, setSecondsTick] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tick every second to update countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll chats list every 2.5 seconds to pick up new messages or responses
  useEffect(() => {
    const pollInterval = setInterval(() => {
      onRefreshChats();
    }, 2500);
    return () => clearInterval(pollInterval);
  }, [onRefreshChats]);

  // Scroll to bottom when message log changes
  const activeRoom = rooms.find(r => r.id === selectedRoomId);
  useEffect(() => {
    if (activeRoom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoom?.messages?.length, selectedRoomId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoomId || submitting) return;

    setSubmitting(true);
    try {
      await onSendMessage(selectedRoomId, inputText.trim());
      setInputText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format remaining time in 2h countdown
  const getCountdownString = (expiresAtStr: string) => {
    const diffMs = new Date(expiresAtStr).getTime() - new Date().getTime();
    if (diffMs <= 0) return 'EXPIRED';

    const totalSecs = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const hrsStr = hrs > 0 ? `${hrs}h ` : '';
    const minsStr = String(mins).padStart(2, '0');
    const secsStr = String(secs).padStart(2, '0');

    return `${hrsStr}${minsStr}m ${secsStr}s`;
  };

  const isExpired = (expiresAtStr: string) => {
    return new Date(expiresAtStr).getTime() < new Date().getTime();
  };

  return (
    <div className="flex flex-col h-full bg-cream relative">
      <AnimatePresence mode="wait">
        {!selectedRoomId ? (
          /* 1. ROOMS LIST SCREEN */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* Header Banner */}
            <div className="p-4 border-b border-espresso bg-oat/50 flex justify-between items-center">
              <div>
                <h2 className="editorial text-3xl text-espresso leading-tight tracking-tight">
                  Ephemeral Pings
                </h2>
                <p className="text-xs text-espresso/60 font-sans mt-1">
                  Spontaneous meetup coordinators. Auto-expires in 2 hours.
                </p>
              </div>
              <button 
                onClick={onRefreshChats}
                className="p-1 border border-espresso/20 text-xs font-mono hover:bg-espresso hover:text-cream text-espresso bg-cream flex items-center justify-center"
              >
                ↻
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
              {rooms.length > 0 ? (
                rooms.map((room) => {
                  const partnerName = room.statusOwnerClientId === currentClientId ? room.pingerPersona : room.statusOwnerPersona;
                  const lastMsg = room.messages[room.messages.length - 1];
                  const roomExpired = isExpired(room.expiresAt);

                  if (roomExpired) return null;

                  return (
                    <button
                      key={room.id}
                      onClick={() => onSelectRoom(room.id)}
                      className="w-full text-left border-2 border-espresso bg-cream hover:bg-oat/20 shadow-[2px_2px_0px_0px_rgba(45,41,38,1)] hover:shadow-[4px_4px_0px_0px_rgba(45,41,38,1)] transition-all duration-150 p-4 flex flex-col gap-2.5"
                    >
                      {/* Top status bar */}
                      <div className="flex justify-between items-center border-b border-espresso/10 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-none bg-matcha" />
                          <span className="editorial text-sm font-bold text-espresso">
                            With: {partnerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[9px] font-bold text-[#9E2A2B] bg-[#9E2A2B]/10 px-1.5 py-0.5">
                          <Clock className="w-3 h-3" />
                          <span>EXPIRY: {getCountdownString(room.expiresAt)}</span>
                        </div>
                      </div>

                      {/* Info and last message */}
                      <div>
                        <p className="font-mono text-[10px] text-espresso/60 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gold" />
                          <span>Meeting spot: <strong className="text-espresso">{room.locationName}</strong></span>
                        </p>
                        
                        {lastMsg && (
                          <p className="editorial text-xs text-espresso/70 italic mt-2 truncate bg-oat/50 p-2 border-l-2 border-gold">
                            "{lastMsg.text}"
                          </p>
                        )}
                      </div>

                      {/* Link indicator */}
                      <div className="text-right text-[10px] font-mono text-espresso font-semibold uppercase tracking-wider">
                        OPEN CHAT ➔
                      </div>
                    </button>
                  );
                })
              ) : (
                /* EMPTY CHATS STATE */
                <div className="text-center py-16 border border-dashed border-espresso/30 p-6 flex flex-col items-center">
                  <MessageSquare className="w-10 h-10 text-espresso/30 mb-2" />
                  <p className="editorial text-2xl text-espresso mb-1">No Active Pings</p>
                  <p className="text-xs text-espresso/50 mt-1.5 max-w-xs leading-relaxed font-sans">
                    You don't have any logistics chats yet. Spot fellow coffee enthusiasts on the **Radar Map** and send them a **Ping** to coordinate!
                  </p>
                  <div className="mt-4 bg-oat border border-espresso/20 p-3 text-[10px] text-espresso/60 font-mono">
                    💡 Tip: Active broadcasts on the map show who is currently at a cafe right now!
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* 2. CHAT DETAIL OVERLAY SCREEN */
          <motion.div
            key="chat-room"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute inset-0 bg-cream flex flex-col z-35"
          >
            {/* Countdown header */}
            <div className="p-3 border-b-2 border-espresso bg-espresso text-cream flex items-center justify-between shadow-sm">
              <button
                onClick={() => onSelectRoom(null)}
                className="flex items-center gap-1 text-xs font-mono font-bold text-cream hover:text-gold"
              >
                <ArrowLeft className="w-4 h-4" />
                BACK
              </button>

              <div className="flex flex-col items-center">
                <span className="font-serif text-sm font-bold text-cream tracking-tight">
                  {activeRoom ? (activeRoom.statusOwnerClientId === currentClientId ? activeRoom.pingerPersona : activeRoom.statusOwnerPersona) : 'Chat'}
                </span>
                <span className="text-[8px] font-mono uppercase text-gold tracking-widest mt-0.5">
                  {activeRoom?.locationName}
                </span>
              </div>

              <div className="flex items-center gap-1 font-mono text-[9px] text-[#FFA8A8] border border-[#FFA8A8]/30 px-1.5 py-0.5 font-bold bg-[#FFA8A8]/10">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeRoom ? getCountdownString(activeRoom.expiresAt) : ''}</span>
              </div>
            </div>

            {/* Expired alert warning */}
            {activeRoom && isExpired(activeRoom.expiresAt) && (
              <div className="bg-[#9E2A2B] text-cream p-3 text-center text-xs font-mono font-bold">
                ⚠️ THIS EPHEMERAL CHAT HAS EXPIRED AND IS LOCKED FOR LOGISTICS.
              </div>
            )}

            {/* Message log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
              <div className="mx-auto text-center py-2 bg-oat border border-espresso/15 max-w-[90%] p-3 font-sans text-[10px] text-espresso/60 space-y-1">
                <p className="font-bold text-espresso">🔒 Yorimichi Spontaneous Safety Guarantee</p>
                <p>Chat logs exist purely for logistics (which seat, what jacket) and are scrubbed automatically when the timer reaches 0.</p>
              </div>

              {activeRoom?.messages.map((msg) => {
                const isMe = msg.senderClientId === currentClientId;
                const isSystem = msg.senderClientId === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-1.5">
                      <span className="inline-block bg-oat border border-espresso/20 text-[9px] text-espresso/50 font-mono px-2 py-0.5 uppercase tracking-wider">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    {/* Persona label */}
                    <span className="text-[8px] font-mono text-espresso/45 mb-1 flex items-center gap-1">
                      {!isMe && <Coffee className="w-2.5 h-2.5 text-gold" />}
                      {msg.senderPersona}
                    </span>

                    {/* Chat Bubble */}
                    <div
                      className={`p-3 border font-sans text-xs select-text ${
                        isMe
                          ? 'bg-espresso text-cream border-espresso shadow-[2px_2px_0px_0px_rgba(212,163,115,0.4)]'
                          : 'bg-oat text-espresso border-espresso shadow-[2px_2px_0px_0px_rgba(45,41,38,0.15)]'
                      }`}
                    >
                      <p className="leading-relaxed font-medium">{msg.text}</p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-[7px] font-mono text-espresso/30 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-espresso bg-oat/50 flex gap-2">
              <input
                disabled={activeRoom ? isExpired(activeRoom.expiresAt) : true}
                type="text"
                placeholder={activeRoom && isExpired(activeRoom.expiresAt) ? "Thread expired..." : `Msg as ${currentPersona.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-cream border border-espresso p-2.5 text-xs font-sans placeholder:text-espresso/35 focus:outline-none"
              />
              <button
                disabled={!inputText.trim() || submitting || (activeRoom ? isExpired(activeRoom.expiresAt) : true)}
                type="submit"
                className="bg-espresso text-cream hover:bg-gold hover:text-espresso font-mono text-xs font-bold px-4 border border-espresso transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(45,41,38,1)] active:translate-y-px"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
