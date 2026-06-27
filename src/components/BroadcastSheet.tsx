import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, MapPin, Clock, PenTool, Check, AlertTriangle, ChevronRight, HelpCircle } from 'lucide-react';
import { CoffeeShop, UserStatus } from '../types';
import { VERIFIED_HANGOUTS, NEIGHBORHOODS } from '../data';

interface BroadcastSheetProps {
  currentPersona: { name: string; color: string };
  clientId: string;
  activeBroadcast: UserStatus | null;
  onBroadcast: (broadcastData: any) => Promise<void>;
  onCancelBroadcast: () => Promise<void>;
  onClose: () => void;
}

export default function BroadcastSheet({
  currentPersona,
  clientId,
  activeBroadcast,
  onBroadcast,
  onCancelBroadcast,
  onClose,
}: BroadcastSheetProps) {
  const [step, setStep] = useState(1);
  const [activity, setActivity] = useState<'Coffee' | 'Drink' | 'Walk'>('Coffee');
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0]);
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
  const [customLocationName, setCustomLocationName] = useState('');
  const [duration, setDuration] = useState<30 | 60 | 120>(60);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isCustomLoc, setIsCustomLoc] = useState(false);

  // Filter curated spots based on selected neighborhood
  const filteredShops = VERIFIED_HANGOUTS.filter(
    shop => shop.neighborhood === neighborhood
  );

  const handleSelectShop = (shop: CoffeeShop) => {
    setSelectedShop(shop);
    setCustomLocationName('');
    setIsCustomLoc(false);
    setStep(3); // skip ahead to duration/note
  };

  const handleSelectCustomLoc = () => {
    setIsCustomLoc(true);
    setSelectedShop(null);
  };

  const handleNextStep = () => {
    if (step === 2 && !selectedShop && !customLocationName && !isCustomLoc) {
      // Must choose or indicate custom
      setIsCustomLoc(true);
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const locationName = selectedShop ? selectedShop.name : (customLocationName || `${neighborhood} Neighborhood`);
      
      // Select approximate lat/lng based on shop or neighborhood
      let lat = 35.6580;
      let lng = 139.7016;
      if (selectedShop) {
        lat = selectedShop.lat;
        lng = selectedShop.lng;
      } else {
        // approximate neighborhoods coordinates in central Tokyo
        switch (neighborhood) {
          case 'Shimokitazawa': lat = 35.6616; lng = 139.6666; break;
          case 'Yoyogi Koen': lat = 35.6715; lng = 139.6949; break;
          case 'Shibuya': lat = 35.6580; lng = 139.7016; break;
          case 'Nakameguro': lat = 35.6433; lng = 139.6987; break;
          case 'Ebisu': lat = 35.6467; lng = 139.7101; break;
          case 'Harajuku': lat = 35.6702; lng = 139.7027; break;
        }
        // add slight noise (about 200-300m) so multiple people in same neighborhood don't stack directly
        lat += (Math.random() - 0.5) * 0.004;
        lng += (Math.random() - 0.5) * 0.004;
      }

      await onBroadcast({
        personaName: currentPersona.name,
        personaColor: currentPersona.color,
        activity,
        neighborhood,
        locationName,
        coffeeShopId: selectedShop?.id,
        duration,
        note,
        lat,
        lng,
        clientId
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await onCancelBroadcast();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-espresso/70 backdrop-blur-xs flex items-end justify-center z-50 p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-md bg-cream border-2 border-espresso shadow-[8px_8px_0px_0px_rgba(45,41,38,1)] z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Monoline sheet handle / header */}
        <div className="border-b-2 border-espresso p-4 bg-oat flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-gold rounded-none" />
            <span className="editorial text-lg font-bold text-espresso uppercase tracking-widest">
              {activeBroadcast ? 'Your Current Status' : 'Broadcast Status'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-espresso font-mono text-xs hover:bg-espresso hover:text-cream transition-colors duration-100"
          >
            ✕
          </button>
        </div>

        {activeBroadcast ? (
          /* ACTIVE BROADCAST SUMMARY VIEW */
          <div className="p-5 overflow-y-auto flex flex-col gap-4">
            <div className="bg-oat border border-espresso p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-none border border-espresso" 
                    style={{ backgroundColor: activeBroadcast.personaColor }}
                  />
                  <div>
                    <h4 className="editorial text-lg font-bold text-espresso leading-none">{activeBroadcast.personaName}</h4>
                    <p className="text-[9px] text-espresso/50 font-mono uppercase tracking-widest mt-0.5">Active Broadcast</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold bg-matcha text-cream px-2 py-0.5 uppercase">
                  LIVE
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs text-espresso/80 border-t border-espresso/10 pt-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-espresso rounded-none" />
                  <span>Activity: <strong className="text-espresso uppercase">{activeBroadcast.activity}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-espresso rounded-none" />
                  <span>Neighborhood: <strong className="text-espresso">{activeBroadcast.neighborhood}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-espresso rounded-none" />
                  <span>At: <strong className="text-espresso">{activeBroadcast.locationName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-espresso rounded-none" />
                  <span>Duration: <strong className="text-espresso">{activeBroadcast.duration} minutes</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-espresso rounded-none" />
                  <span>Expires: <strong className="text-espresso">
                    {new Date(activeBroadcast.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </strong></span>
                </div>
              </div>

              {activeBroadcast.note && (
                <div className="mt-4 bg-cream border-l-2 border-gold p-2.5 text-xs italic font-serif text-espresso/70">
                  "{activeBroadcast.note}"
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <div className="text-[10px] font-mono text-espresso/50 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span>You can broadcast a new status to overwrite this one.</span>
              </div>
              <button
                disabled={submitting}
                onClick={handleCancel}
                className="w-full py-3 bg-[#9E2A2B] text-cream hover:bg-espresso hover:text-cream font-mono text-xs font-bold border-2 border-espresso transition-all duration-150 shadow-[4px_4px_0px_0px_rgba(45,41,38,1)] active:translate-y-px active:shadow-none"
              >
                {submitting ? 'REMOVING...' : 'CANCEL CURRENT BROADCAST'}
              </button>
            </div>
          </div>
        ) : (
          /* BROADCAST STEP FLOW */
          <div className="overflow-y-auto flex-1 flex flex-col justify-between">
            {/* Steps indicator */}
            <div className="flex border-b border-espresso font-mono text-[10px]">
              <div className={`flex-1 py-2 text-center border-r border-espresso ${step === 1 ? 'bg-espresso text-cream font-bold' : 'bg-oat/40 text-espresso/60'}`}>
                1. ACTIVITY
              </div>
              <div className={`flex-1 py-2 text-center border-r border-espresso ${step === 2 ? 'bg-espresso text-cream font-bold' : 'bg-oat/40 text-espresso/60'}`}>
                2. LOCATION
              </div>
              <div className={`flex-1 py-2 text-center ${step === 3 ? 'bg-espresso text-cream font-bold' : 'bg-oat/40 text-espresso/60'}`}>
                3. NOTES & EXPIRY
              </div>
            </div>

            {/* Steps Content */}
            <div className="p-5 flex-1 min-h-[300px]">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="editorial text-xl text-espresso mb-1">What are you up to?</h3>
                    <p className="text-xs text-espresso/50 font-sans">Choose the general mood or category of your meetup.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setActivity('Coffee')}
                      className={`flex flex-col items-center justify-center p-4 border-2 border-espresso aspect-square transition-all duration-150 ${
                        activity === 'Coffee'
                          ? 'bg-oat shadow-[4px_4px_0px_0px_rgba(45,41,38,1)] font-bold'
                          : 'bg-cream hover:bg-oat/30'
                      }`}
                    >
                      <Coffee className="w-8 h-8 text-gold mb-2" />
                      <span className="font-mono text-xs tracking-wider">COFFEE</span>
                    </button>

                    <button
                      onClick={() => setActivity('Drink')}
                      className={`flex flex-col items-center justify-center p-4 border-2 border-espresso aspect-square transition-all duration-150 ${
                        activity === 'Drink'
                          ? 'bg-oat shadow-[4px_4px_0px_0px_rgba(45,41,38,1)] font-bold'
                          : 'bg-cream hover:bg-oat/30'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-matcha flex items-center justify-center mb-2 font-mono text-xs font-black text-matcha">
                        ¥
                      </div>
                      <span className="font-mono text-xs tracking-wider">DRINK</span>
                    </button>

                    <button
                      onClick={() => setActivity('Walk')}
                      className={`flex flex-col items-center justify-center p-4 border-2 border-espresso aspect-square transition-all duration-150 ${
                        activity === 'Walk'
                          ? 'bg-oat shadow-[4px_4px_0px_0px_rgba(45,41,38,1)] font-bold'
                          : 'bg-cream hover:bg-oat/30'
                      }`}
                    >
                      <MapPin className="w-8 h-8 text-espresso mb-2" />
                      <span className="font-mono text-xs tracking-wider">WALK</span>
                    </button>
                  </div>

                  <div className="bg-oat/60 border border-espresso/20 p-3 text-xs text-espresso/70 space-y-1.5 font-sans">
                    <span className="font-bold text-espresso">Guideline:</span>
                    <p>Yorimichi broadcasts are live, real-time presence indicators. Make sure you are actually at or heading to the location before broadcasting!</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="editorial text-xl text-espresso mb-1">Select Neighborhood</h3>
                      <p className="text-xs text-espresso/50 font-sans">Where are you drinking or strolling?</p>
                    </div>
                  </div>

                  {/* Neighborhood scroll */}
                  <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-espresso/15">
                    {NEIGHBORHOODS.map(n => (
                      <button
                        key={n}
                        onClick={() => {
                          setNeighborhood(n);
                          setSelectedShop(null);
                        }}
                        className={`px-3 py-1.5 font-mono text-xs border border-espresso whitespace-nowrap transition-all ${
                          neighborhood === n
                            ? 'bg-espresso text-cream font-bold'
                            : 'bg-cream hover:bg-oat'
                        }`}
                      >
                        {n.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Curated shops or custom */}
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    <p className="text-[10px] font-mono text-espresso/40 tracking-wider uppercase font-bold">Curated Spaces in {neighborhood}</p>
                    
                    {filteredShops.length > 0 ? (
                      filteredShops.map(shop => (
                        <button
                          key={shop.id}
                          onClick={() => handleSelectShop(shop)}
                          className={`w-full p-2.5 border text-left flex items-center justify-between transition-colors ${
                            selectedShop?.id === shop.id
                              ? 'bg-oat border-espresso border-2'
                              : 'bg-cream border-espresso/25 hover:bg-oat/30'
                          }`}
                        >
                          <div className="truncate">
                            <p className="font-serif text-xs font-bold text-espresso">{shop.name}</p>
                            <p className="text-[9px] font-mono text-espresso/50 truncate">{shop.address}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 text-[10px] font-mono text-gold font-bold">
                            <span>PICK</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs font-serif italic text-espresso/50 py-1">No verified hangouts listed here. Try custom location.</p>
                    )}

                    {/* Custom location trigger */}
                    <button
                      onClick={handleSelectCustomLoc}
                      className={`w-full p-2.5 border text-left flex items-center justify-between transition-colors ${
                        isCustomLoc
                          ? 'bg-oat border-espresso border-2'
                          : 'bg-cream border-espresso/25 hover:bg-oat/30'
                      }`}
                    >
                      <div>
                        <p className="font-serif text-xs font-bold text-espresso">Custom Spot / Area Name</p>
                        <p className="text-[9px] font-mono text-espresso/50">Type in any custom cafe or specific landmark</p>
                      </div>
                      <span className="font-mono text-[9px] border border-espresso px-2 py-0.5 uppercase bg-cream">CUSTOM</span>
                    </button>
                  </div>

                  {/* Custom location input */}
                  {isCustomLoc && (
                    <div className="space-y-1 bg-oat/40 p-2.5 border border-espresso animate-fadeIn">
                      <label className="block text-[10px] font-mono text-espresso/60 uppercase font-bold">Where specifically?</label>
                      <input
                        type="text"
                        placeholder="e.g. Starbucks Tsutaya, Nakameguro Station, near canal"
                        value={customLocationName}
                        onChange={(e) => setCustomLocationName(e.target.value)}
                        className="w-full bg-cream border border-espresso p-2 text-xs font-sans placeholder:text-espresso/30 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="editorial text-xl text-espresso mb-1">Details & Expiration</h3>
                    <p className="text-xs text-espresso/50 font-sans">Set duration and leave an optional friendly note for expats.</p>
                  </div>

                  {/* Duration picker */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-espresso/60 uppercase font-bold">How long are you staying?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[30, 60, 120].map(mins => (
                        <button
                          key={mins}
                          onClick={() => setDuration(mins as any)}
                          className={`py-2 border border-espresso font-mono text-xs transition-all ${
                            duration === mins
                              ? 'bg-espresso text-cream font-bold'
                              : 'bg-cream hover:bg-oat'
                          }`}
                        >
                          {mins === 30 ? '30 MINS' : mins === 60 ? '1 HOUR' : '2 HOURS'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Short note */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="block text-[10px] font-mono text-espresso/60 uppercase font-bold">Logistics or Vibe Note (Optional)</label>
                      <span className="text-[9px] font-mono text-espresso/40">{note.length}/100</span>
                    </div>
                    <textarea
                      maxLength={100}
                      placeholder="e.g. Wearing a denim jacket, reading a book at the counter. Stop by to chat!"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="w-full bg-cream border border-espresso p-2.5 text-xs font-serif placeholder:text-espresso/30 focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Persona warning */}
                  <div className="bg-matcha/10 border border-matcha/30 p-2 text-[10px] font-sans text-espresso/80 flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-matcha flex-shrink-0" />
                    <span>You will broadcast anonymously as <strong className="text-espresso">{currentPersona.name}</strong>. Fellow expats will see your avatar at <strong className="text-espresso">{selectedShop ? selectedShop.name : (customLocationName || `${neighborhood} Neighborhood`)}</strong>.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Nav Bar of the sheet */}
            <div className="border-t border-espresso p-4 bg-oat flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-3 bg-cream text-espresso hover:bg-oat font-mono text-xs font-bold border border-espresso transition-colors duration-100"
                >
                  BACK
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={step === 2 && !selectedShop && !customLocationName && !isCustomLoc}
                  className="flex-1 py-3 bg-espresso text-cream hover:bg-gold hover:text-espresso font-mono text-xs font-bold border border-espresso transition-all duration-150 shadow-[3px_3px_0px_0px_rgba(45,41,38,1)] active:translate-y-px active:shadow-none disabled:opacity-50 disabled:pointer-events-none"
                >
                  NEXT STEP
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-espresso text-cream hover:bg-gold hover:text-espresso font-mono text-xs font-bold border border-espresso transition-all duration-150 shadow-[4px_4px_0px_0px_rgba(45,41,38,1)] active:translate-y-px active:shadow-none"
                >
                  {submitting ? 'BROADCASTING...' : 'BROADCAST STATUS'}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
