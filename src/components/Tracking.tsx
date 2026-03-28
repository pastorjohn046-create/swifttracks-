import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api';
import { Shipment, TrackingUpdate, Review, Flight, UserProfile } from '../types';
import { Search, Package, MapPin, Clock, AlertCircle, Loader2, Star, Plane, Globe, Info, Plus, CheckCircle2, Truck, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

type TrackingType = 'shipment' | 'flight';

interface TrackingProps {
  profile: UserProfile | null;
}

export default function Tracking({ profile }: TrackingProps) {
  const [trackingType, setTrackingType] = useState<TrackingType>('shipment');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [updates, setUpdates] = useState<TrackingUpdate[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [showTechnicalData, setShowTechnicalData] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const location = useLocation();

  const performTracking = useCallback(async (id: string, type: TrackingType) => {
    setLoading(true);
    setError('');
    setShipment(null);
    setFlight(null);
    setUpdates([]);
    setReviews([]);

    try {
      const searchId = id.trim().toUpperCase();
      
      if (type === 'shipment') {
        try {
          const s = await api.shipments.get(searchId);
          setShipment(s);
          const u = await api.shipments.getUpdates(searchId);
          setUpdates(u);
          const r = await api.reviews.list();
          setReviews(r.filter(review => review.targetId === searchId));
        } catch (err) {
          setError('Shipment not found. Please check your tracking number.');
        }
      } else {
        const flights = await api.flights.list();
        const f = flights.find(fl => fl.flightNumber === searchId);
        if (f) {
          setFlight(f);
          const u = await api.flights.getUpdates(f.id);
          setUpdates(u);
        } else {
          setError('Flight not found. Please check the flight number.');
        }
      }
    } catch (err) {
      setError('An error occurred while tracking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setTrackingNumber(id);
      performTracking(id, 'shipment');
    }
  }, [location.search, performTracking]);

  useEffect(() => {
    let interval: any;

    const refreshData = async () => {
      if (shipment) {
        try {
          const s = await api.shipments.get(shipment.id);
          setShipment(s);
          const u = await api.shipments.getUpdates(shipment.id);
          setUpdates(u);
        } catch (err) {
          console.error(err);
        }
      }

      if (flight) {
        try {
          const f = await api.flights.get(flight.id);
          setFlight(f);
          const u = await api.flights.getUpdates(flight.id);
          setUpdates(u);
        } catch (err) {
          console.error(err);
        }
      }
    };

    if (shipment || flight) {
      refreshData();
      interval = setInterval(refreshData, 10000);
    }

    return () => clearInterval(interval);
  }, [shipment?.id, flight?.id]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    performTracking(trackingNumber, trackingType);
  };

  const handleClaimShipment = async () => {
    if (!profile || !shipment) return;
    
    setClaiming(true);
    setClaimStatus(null);
    
    try {
      // Use the new claim endpoint
      await api.shipments.claim(shipment.id);
      
      setClaimStatus({ type: 'success', message: 'Shipment successfully claimed!' });
      const updated = await api.shipments.get(shipment.id);
      setShipment(updated);
    } catch (error: any) {
      setClaimStatus({ type: 'error', message: error.message || 'An error occurred while claiming the shipment.' });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 md:py-24 flex flex-col gap-16 md:gap-32 animate-fade-in px-6">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-8 max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-accent"></div>
            <span className="text-micro text-accent uppercase tracking-widest">REAL-TIME INTELLIGENCE</span>
          </div>
          <h2 className="text-5xl sm:text-8xl font-black tracking-tighter text-primary leading-[0.9] heading-display uppercase">
            Track Your <br />
            <span className="text-muted/40 italic font-serif lowercase">Journey</span>.
          </h2>
          <p className="text-xl sm:text-2xl font-medium text-muted leading-relaxed max-w-xl">
            Global logistics intelligence for high-value consignments and air freight systems.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex gap-8 border-b border-primary/5">
            <button 
              onClick={() => {
                setTrackingType('shipment');
                setShipment(null);
                setFlight(null);
                setError('');
              }}
              className={`pb-4 text-micro transition-all relative ${
                trackingType === 'shipment' ? 'text-primary' : 'text-muted hover:text-primary'
              }`}
            >
              SHIPMENT
              {trackingType === 'shipment' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />}
            </button>
            <button 
              onClick={() => {
                setTrackingType('flight');
                setShipment(null);
                setFlight(null);
                setError('');
              }}
              className={`pb-4 text-micro transition-all relative ${
                trackingType === 'flight' ? 'text-primary' : 'text-muted hover:text-primary'
              }`}
            >
              FLIGHT
              {trackingType === 'flight' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />}
            </button>
          </div>
          
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-px bg-primary/5 border border-primary/5 max-w-3xl w-full">
            <div className="relative flex-1 bg-white">
              <input 
                type="text" 
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={trackingType === 'shipment' ? "ENTER TRACKING ID" : "ENTER FLIGHT NUMBER"}
                className="w-full px-8 py-6 text-sm font-black tracking-widest uppercase placeholder:text-muted/40 focus:outline-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary text-white px-12 py-6 text-sm font-black tracking-widest uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 min-w-[200px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              TRACK NOW
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="p-8 bg-rose-50 border border-rose-100 flex items-center gap-4 animate-shake max-w-3xl">
          <AlertCircle className="w-6 h-6 text-rose-600" />
          <span className="text-sm font-bold text-rose-700 uppercase tracking-tight">{error}</span>
        </div>
      )}

      {shipment && (
        <div className="flex flex-col gap-24 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-primary/5 border border-primary/5">
            <div className="bg-white p-12 flex flex-col gap-12">
              <div className="flex flex-col gap-4">
                <span className="text-micro text-muted">CURRENT STATUS</span>
                <div className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter heading-display ${
                  shipment.status === 'delivered' ? 'text-emerald-600' : 
                  shipment.status === 'cancelled' ? 'text-rose-600' : 'text-accent'
                }`}>
                  {shipment.status}.
                </div>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <span className="text-micro text-muted">TRACKING IDENTIFIER</span>
                  <span className="text-2xl font-black text-primary font-mono tracking-tight">{shipment.trackingNumber}</span>
                </div>

                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setShowTechnicalData(!showTechnicalData)}
                    className="text-[10px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2"
                  >
                    <Info className="w-3 h-3" /> {showTechnicalData ? 'Hide' : 'Show'} Technical Metadata
                  </button>
                  <button 
                    onClick={async () => {
                      if (shipment) {
                        try {
                          const s = await api.shipments.get(shipment.id);
                          setShipment(s);
                          const u = await api.shipments.getUpdates(shipment.id);
                          setUpdates(u);
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                    className="text-[10px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2"
                  >
                    <Activity className="w-3 h-3" /> Refresh Data
                  </button>
                </div>
                {showTechnicalData && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-bg border border-border p-4 font-mono text-[10px] text-muted overflow-hidden"
                  >
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify({
                        id: shipment.id,
                        sender_id: shipment.senderId,
                        weight_kg: shipment.weight,
                        created_at: shipment.createdAt,
                        system_hash: btoa(shipment.id).slice(0, 16)
                      }, null, 2)}
                    </pre>
                  </motion.div>
                )}

                {profile && shipment.senderId !== profile.uid && (
                  <button 
                    onClick={handleClaimShipment}
                    disabled={claiming}
                    className="bg-accent text-white px-8 py-4 text-xs font-black tracking-widest uppercase hover:bg-accent/90 transition-colors w-fit flex items-center gap-3"
                  >
                    {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    CLAIM SHIPMENT
                  </button>
                )}

                {claimStatus && (
                  <div className={`p-4 text-micro font-bold border ${
                    claimStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                  }`}>
                    {claimStatus.message}
                  </div>
                )}
              </div>

              {shipment.packageImage && (
                <div className="flex flex-col gap-4">
                  <span className="text-micro text-muted">CONSIGNMENT VISUAL</span>
                  <img 
                    src={shipment.packageImage} 
                    alt="Package" 
                    referrerPolicy="no-referrer"
                    className="w-full aspect-video object-cover grayscale hover:grayscale-0 transition-all duration-700 border border-primary/5" 
                  />
                </div>
              )}
            </div>

            <div className="bg-primary p-12 text-white flex flex-col gap-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="flex flex-col gap-2">
                  <span className="text-micro text-white/40">RECEIVER</span>
                  <span className="text-2xl font-black heading-display uppercase tracking-tight">{shipment.receiverName}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-micro text-white/40">WEIGHT</span>
                  <span className="text-2xl font-black heading-display uppercase tracking-tight">{shipment.weight} KG</span>
                </div>
                <div className="flex flex-col gap-2 col-span-full">
                  <span className="text-micro text-white/40">DESTINATION</span>
                  <span className="text-lg font-medium text-white/60 leading-relaxed">{shipment.receiverAddress}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-micro text-white/40">SHIPPED DATE</span>
                  <span className="text-lg font-medium text-white/60">{format(new Date(shipment.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-16">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-accent"></div>
              <h4 className="text-2xl font-black tracking-tighter heading-display uppercase">Journey Timeline</h4>
            </div>
            <div className="flex flex-col gap-px bg-primary/5 border border-primary/5">
              {updates.length === 0 ? (
                <div className="bg-white p-12 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-micro text-accent">ORIGIN</span>
                    <span className="text-micro text-muted">{format(new Date(shipment.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  <h5 className="text-2xl font-black heading-display uppercase tracking-tight">Shipment Registered</h5>
                  <p className="text-muted font-medium max-w-2xl leading-relaxed">The shipment has been registered in our system and is awaiting pickup at the origin facility.</p>
                </div>
              ) : (
                updates.map((update, idx) => (
                  <div key={update.id} className="bg-white p-12 flex flex-col gap-6 group hover:bg-primary/5 transition-colors">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <span className={`text-micro ${idx === 0 ? 'text-accent' : 'text-muted'}`}>STEP {updates.length - idx}</span>
                        <span className="text-micro text-muted">{format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                      <span className="text-micro text-primary flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> {update.location}
                      </span>
                    </div>
                    <h5 className="text-3xl font-black heading-display uppercase tracking-tighter">{update.status}</h5>
                    <p className="text-muted font-medium max-w-2xl leading-relaxed">{update.description}</p>
                    {update.packageImage && (
                      <img 
                        src={update.packageImage} 
                        alt="Update Photo" 
                        referrerPolicy="no-referrer"
                        className="w-full max-w-md aspect-video object-cover grayscale hover:grayscale-0 transition-all duration-700 border border-primary/5" 
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {flight && (
        <div className="flex flex-col gap-24 animate-fade-in">
          <div className="bg-primary p-12 text-white flex flex-col gap-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
              <div className="flex flex-col gap-4">
                <span className="text-micro text-white/40">FLIGHT STATUS</span>
                <div className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter heading-display ${
                  flight.status === 'arrived' ? 'text-emerald-400' : 
                  flight.status === 'delayed' ? 'text-amber-400' : 
                  flight.status === 'cancelled' ? 'text-rose-400' : 'text-white'
                }`}>
                  {flight.status}.
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-micro text-white/40">FLIGHT IDENTIFIER</span>
                <span className="text-2xl font-black font-mono tracking-tight">{flight.flightNumber}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-12 py-12 border-y border-white/10">
              <div className="flex flex-col items-center sm:items-start gap-2">
                <span className="text-micro text-white/40">ORIGIN</span>
                <span className="text-5xl sm:text-8xl font-black tracking-tighter heading-display uppercase">{flight.origin}</span>
                <span className="text-lg font-medium text-white/60">{flight.departureTime ? format(new Date(flight.departureTime), 'HH:mm') : '--:--'}</span>
              </div>
              <div className="flex-1 w-full sm:w-auto flex items-center justify-center">
                <div className="w-full h-[1px] bg-white/10 relative">
                  <Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-accent animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-center sm:items-end gap-2">
                <span className="text-micro text-white/40">DESTINATION</span>
                <span className="text-5xl sm:text-8xl font-black tracking-tighter heading-display uppercase">{flight.destination}</span>
                <span className="text-lg font-medium text-white/60">{flight.arrivalTime ? format(new Date(flight.arrivalTime), 'HH:mm') : '--:--'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
              <div className="flex flex-col gap-2">
                <span className="text-micro text-white/40">DEPARTURE DATE</span>
                <span className="text-xl font-black heading-display uppercase tracking-tight">{flight.departureTime ? format(new Date(flight.departureTime), 'MMM dd, yyyy') : 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-micro text-white/40">ARRIVAL DATE</span>
                <span className="text-xl font-black heading-display uppercase tracking-tight">{flight.arrivalTime ? format(new Date(flight.arrivalTime), 'MMM dd, yyyy') : 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-2 sm:text-right">
                <span className="text-micro text-white/40">AIRCRAFT TYPE</span>
                <span className="text-xl font-black heading-display uppercase tracking-tight">AIR FREIGHT CARGO</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => setShowTechnicalData(!showTechnicalData)}
                className="text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                <Info className="w-3 h-3" /> {showTechnicalData ? 'Hide' : 'Show'} Technical Metadata
              </button>
              <button 
                onClick={async () => {
                  if (flight) {
                    try {
                      const f = await api.flights.get(flight.id);
                      setFlight(f);
                      const u = await api.flights.getUpdates(flight.id);
                      setUpdates(u);
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }}
                className="text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                <Activity className="w-3 h-3" /> Refresh Data
              </button>
            </div>
            {showTechnicalData && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white/5 border border-white/10 p-4 font-mono text-[10px] text-white/60 overflow-hidden"
              >
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify({
                    id: flight.id,
                    flight_number: flight.flightNumber,
                    origin: flight.origin,
                    destination: flight.destination,
                    departure: flight.departureTime,
                    arrival: flight.arrivalTime,
                    system_hash: btoa(flight.id).slice(0, 16)
                  }, null, 2)}
                </pre>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-16">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-accent"></div>
              <h4 className="text-2xl font-black tracking-tighter heading-display uppercase">Flight Journey Timeline</h4>
            </div>
            <div className="flex flex-col gap-px bg-primary/5 border border-primary/5">
              {updates.length === 0 ? (
                <div className="bg-white p-12 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-micro text-accent">SCHEDULED</span>
                    <span className="text-micro text-muted">
                      {flight.departureTime ? format(new Date(flight.departureTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </span>
                  </div>
                  <h5 className="text-2xl font-black heading-display uppercase tracking-tight">Flight Scheduled</h5>
                  <p className="text-muted font-medium max-w-2xl leading-relaxed">
                    Flight {flight.flightNumber} has been scheduled for departure from {flight.origin} to {flight.destination}.
                  </p>
                </div>
              ) : (
                updates.map((update, idx) => (
                  <div key={update.id} className="bg-white p-12 flex flex-col gap-6 group hover:bg-primary/5 transition-colors">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <span className={`text-micro ${idx === 0 ? 'text-accent' : 'text-muted'}`}>STEP {updates.length - idx}</span>
                        <span className="text-micro text-muted">{format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                      <span className="text-micro text-primary flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> {update.location}
                      </span>
                    </div>
                    <h5 className="text-3xl font-black heading-display uppercase tracking-tighter">{update.status}</h5>
                    <p className="text-muted font-medium max-w-2xl leading-relaxed">{update.description}</p>
                    {update.packageImage && (
                      <img 
                        src={update.packageImage} 
                        alt="Update Photo" 
                        referrerPolicy="no-referrer"
                        className="w-full max-w-md aspect-video object-cover grayscale hover:grayscale-0 transition-all duration-700 border border-primary/5" 
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="flex flex-col gap-16 mt-12">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-accent"></div>
            <h4 className="text-2xl font-black tracking-tighter heading-display uppercase">Customer Feedback</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-primary/5 border border-primary/5">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-12 flex flex-col gap-8 hover:bg-primary/5 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-micro text-muted">REVIEWER</span>
                    <span className="text-xl font-black heading-display uppercase tracking-tight">{review.userName}</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-primary/10'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xl font-medium text-muted italic leading-relaxed">"{review.comment}"</p>
                <span className="text-micro text-muted uppercase tracking-widest">
                  {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
