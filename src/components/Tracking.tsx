import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType, doc, getDoc, collection, query, orderBy, getDocs, where, onSnapshot, updateDoc } from '../firebase';
import { Shipment, TrackingUpdate, Review, Flight, UserProfile } from '../types';
import { Search, Package, MapPin, Clock, AlertCircle, Loader2, Star, Plane, Globe, Info, Plus, CheckCircle2, Truck } from 'lucide-react';
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
  const [claimStatus, setClaimStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    let unsubscribeShipment: (() => void) | undefined;
    let unsubscribeFlight: (() => void) | undefined;
    let unsubscribeUpdates: (() => void) | undefined;

    if (shipment) {
      unsubscribeShipment = onSnapshot(doc(db, 'shipments', shipment.id), (doc) => {
        if (doc.exists()) {
          setShipment({ id: doc.id, ...doc.data() } as Shipment);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'shipments'));

      const updatesRef = collection(db, 'shipments', shipment.id, 'updates');
      const q = query(updatesRef, orderBy('timestamp', 'desc'));
      unsubscribeUpdates = onSnapshot(q, (snap) => {
        setUpdates(snap.docs.map(d => ({ id: d.id, ...d.data() } as TrackingUpdate)));
      }, (err) => handleFirestoreError(err, OperationType.GET, 'shipments/updates'));
    }

    if (flight) {
      unsubscribeFlight = onSnapshot(doc(db, 'flights', flight.id), (doc) => {
        if (doc.exists()) {
          setFlight({ id: doc.id, ...doc.data() } as Flight);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'flights'));

      const updatesRef = collection(db, 'flights', flight.id, 'updates');
      const q = query(updatesRef, orderBy('timestamp', 'desc'));
      unsubscribeUpdates = onSnapshot(q, (snap) => {
        setUpdates(snap.docs.map(d => ({ id: d.id, ...d.data() } as TrackingUpdate)));
      }, (err) => handleFirestoreError(err, OperationType.GET, 'flights/updates'));
    }

    return () => {
      unsubscribeShipment?.();
      unsubscribeFlight?.();
      unsubscribeUpdates?.();
    };
  }, [shipment?.id, flight?.id]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError('');
    setShipment(null);
    setFlight(null);
    setUpdates([]);
    setReviews([]);

    try {
      const searchId = trackingNumber.trim().toUpperCase();
      
      if (trackingType === 'shipment') {
        const docRef = doc(db, 'shipments', searchId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setShipment({ id: docSnap.id, ...docSnap.data() } as Shipment);
          
          // Fetch updates
          const updatesRef = collection(db, 'shipments', docSnap.id, 'updates');
          const q = query(updatesRef, orderBy('timestamp', 'desc'));
          const updatesSnap = await getDocs(q);
          setUpdates(updatesSnap.docs.map(d => ({ id: d.id, ...d.data() } as TrackingUpdate)));

          // Fetch reviews
          const reviewsRef = collection(db, 'reviews');
          const reviewsQuery = query(
            reviewsRef, 
            where('targetId', '==', searchId),
            orderBy('createdAt', 'desc')
          );
          const reviewsSnap = await getDocs(reviewsQuery);
          setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
        } else {
          setError('Shipment not found. Please check your tracking number.');
        }
      } else {
        // Flight tracking
        const flightsRef = collection(db, 'flights');
        const q = query(flightsRef, where('flightNumber', '==', searchId));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          const flightDoc = querySnap.docs[0];
          setFlight({ id: flightDoc.id, ...flightDoc.data() } as Flight);
          
          // Initial updates fetch (onSnapshot will handle the rest)
          const updatesRef = collection(db, 'flights', flightDoc.id, 'updates');
          const uq = query(updatesRef, orderBy('timestamp', 'desc'));
          const updatesSnap = await getDocs(uq);
          setUpdates(updatesSnap.docs.map(d => ({ id: d.id, ...d.data() } as TrackingUpdate)));
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
  };

  const handleClaimShipment = async () => {
    if (!profile || !shipment) return;
    
    setClaiming(true);
    setClaimStatus(null);
    
    try {
      // Allow claiming if receiverEmail matches or if it's unassigned (senderId is empty/placeholder)
      if (shipment.receiverEmail === profile.email || !shipment.senderId || shipment.senderId === 'admin') {
        await updateDoc(doc(db, 'shipments', shipment.id), {
          senderId: profile.uid // Linking it to the user
        });
        setClaimStatus({ type: 'success', message: 'Shipment successfully claimed!' });
      } else {
        setClaimStatus({ type: 'error', message: 'You are not authorized to claim this shipment.' });
      }
    } catch (error) {
      setClaimStatus({ type: 'error', message: 'An error occurred while claiming the shipment.' });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-16 flex flex-col gap-12 md:gap-20 animate-fade-in px-4 sm:px-6">
      <div className="text-center flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-6xl md:text-8xl font-black tracking-tight text-text leading-tight">
            Track Your <span className="text-primary">Journey</span>
          </h2>
          <p className="text-sm sm:text-xl font-medium text-muted max-w-xl mx-auto px-4">
            Real-time logistics intelligence for global consignments and air freight
          </p>
        </div>

        <div className="flex justify-center gap-1 p-1 bg-bg rounded-2xl w-fit mx-auto border border-border overflow-x-auto max-w-full">
          <button 
            onClick={() => {
              setTrackingType('shipment');
              setShipment(null);
              setFlight(null);
              setError('');
            }}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              trackingType === 'shipment' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-text'
            }`}
          >
            <Package className="w-3.5 h-3.5 sm:w-4 h-4" /> Shipment
          </button>
          <button 
            onClick={() => {
              setTrackingType('flight');
              setShipment(null);
              setFlight(null);
              setError('');
            }}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              trackingType === 'flight' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-text'
            }`}
          >
            <Plane className="w-3.5 h-3.5 sm:w-4 h-4" /> Flight
          </button>
        </div>
        
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 max-w-2xl mx-auto w-full group px-2 sm:px-0">
          <div className="relative flex-1">
            {trackingType === 'shipment' ? (
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-muted" />
            ) : (
              <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-muted" />
            )}
            <input 
              type="text" 
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={trackingType === 'shipment' ? "Tracking ID" : "Flight Number"}
              className="input-modern pl-12 sm:pl-14 text-base sm:text-xl font-bold tracking-tight py-3 sm:py-4"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg shadow-xl shadow-primary/20"
          >
            {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Search className="w-5 h-5 sm:w-6 sm:h-6" />}
            Track
          </button>
        </form>
      </div>

      {error && (
        <div className="card-modern bg-rose-50 border-rose-200 p-6 flex items-center gap-4 animate-shake mx-auto w-full max-w-2xl">
          <AlertCircle className="w-6 h-6 text-rose-600" />
          <span className="text-base sm:text-lg font-semibold text-rose-700">{error}</span>
        </div>
      )}

      {shipment && (
        <div className="flex flex-col gap-12 animate-fade-in">
          <div className="card-modern p-6 sm:p-10 bg-white overflow-hidden relative border-2 border-primary/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            
            {/* Moving Truck Animation */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '100%', opacity: [0, 0.1, 0.1, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 -translate-y-1/2 left-0 w-full pointer-events-none -z-0"
            >
              <Truck className="w-24 h-24 text-primary/5" />
            </motion.div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Current Status</span>
                  <div className={`text-3xl sm:text-5xl font-black uppercase tracking-tighter px-5 py-2 rounded-2xl w-fit ${
                    shipment.status === 'delivered' ? 'text-emerald-600 bg-emerald-50' : 
                    shipment.status === 'cancelled' ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'
                  }`}>
                    {shipment.status}
                  </div>
                </div>
                {profile && shipment.senderId !== profile.uid && (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleClaimShipment}
                      disabled={claiming}
                      className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
                    >
                      {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Claim This Shipment
                    </button>
                    {claimStatus && (
                      <div className={`p-3 rounded-lg flex items-center gap-2 text-[10px] font-bold ${
                        claimStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {claimStatus.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {claimStatus.message}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3 text-muted bg-bg p-3 rounded-xl w-fit">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold">Tracking ID: <span className="text-text font-mono">{shipment.trackingNumber}</span></span>
                </div>
                {shipment.packageImage && (
                  <div className="flex flex-col gap-2 mt-4">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Package Photo</span>
                    <img 
                      src={shipment.packageImage} 
                      alt="Package" 
                      referrerPolicy="no-referrer"
                      className="w-full max-w-md h-48 object-cover rounded-2xl border-2 border-primary/10 shadow-lg" 
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 flex-1 lg:border-l border-border lg:pl-12">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Receiver</span>
                  <span className="text-xl font-bold text-text">{shipment.receiverName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Destination</span>
                  <span className="text-sm font-medium text-text leading-relaxed">{shipment.receiverAddress}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Weight</span>
                  <span className="text-xl font-bold text-text">{shipment.weight} KG</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Shipped Date</span>
                  <span className="text-sm font-medium text-text">{format(new Date(shipment.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <h4 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-4 text-text">
              <Clock className="w-8 h-8 text-primary" /> Journey Timeline
            </h4>
            <div className="relative ml-4 pl-10 border-l-2 border-border flex flex-col gap-12 py-4">
              {updates.length === 0 ? (
                <div className="relative">
                  <div className="absolute -left-[51px] top-1 w-5 h-5 rounded-full border-4 border-white bg-primary shadow-lg shadow-primary/30"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xl font-bold text-text">Shipment Registered</span>
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">{format(new Date(shipment.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    <p className="text-muted font-medium mt-3 max-w-2xl leading-relaxed">The shipment has been registered in our system and is awaiting pickup at the origin facility.</p>
                  </div>
                </div>
              ) : (
                updates.map((update, idx) => (
                  <div key={update.id} className="relative group">
                    <div className={`absolute -left-[51px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-lg transition-all duration-300 ${
                      idx === 0 ? 'bg-primary scale-125 shadow-primary/40' : 'bg-muted group-hover:bg-primary'
                    }`}></div>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xl font-bold text-text uppercase tracking-tight">{update.status}</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold bg-bg text-muted px-3 py-1.5 rounded-full uppercase tracking-widest border border-border">
                          <MapPin className="w-3 h-3 text-primary" /> {update.location}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-muted uppercase tracking-widest">{format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                      <p className="text-muted font-medium mt-3 max-w-2xl leading-relaxed text-sm sm:text-base">{update.description}</p>
                      {update.packageImage && (
                        <div className="mt-4">
                          <img 
                            src={update.packageImage} 
                            alt="Update Photo" 
                            referrerPolicy="no-referrer"
                            className="w-full max-w-sm h-32 object-cover rounded-xl border border-border shadow-sm" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {flight && (
        <div className="flex flex-col gap-12 animate-fade-in">
          <div className="card-modern p-6 sm:p-10 bg-white overflow-hidden relative border-2 border-primary/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            
            {/* Moving Plane Animation */}
            <motion.div
              initial={{ x: '-100%', y: '20%', opacity: 0 }}
              animate={{ x: '100%', y: '-20%', opacity: [0, 0.1, 0.1, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 -translate-y-1/2 left-0 w-full pointer-events-none -z-0"
            >
              <Plane className="w-32 h-32 text-primary/5 rotate-12" />
            </motion.div>

            <div className="relative z-10 flex flex-col gap-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Flight Status</span>
                  <div className={`text-3xl sm:text-5xl font-black uppercase tracking-tighter px-5 py-2 rounded-2xl w-fit ${
                    flight.status === 'arrived' ? 'text-emerald-600 bg-emerald-50' : 
                    flight.status === 'delayed' ? 'text-amber-600 bg-amber-50' : 
                    flight.status === 'cancelled' ? 'text-rose-600 bg-rose-50' : 'text-primary bg-primary/5'
                  }`}>
                    {flight.status}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-muted bg-bg p-3 rounded-xl">
                  <Plane className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold">Flight: <span className="text-text font-mono">{flight.flightNumber}</span></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 py-6 sm:py-8 border-y border-border">
                <div className="flex flex-col items-center sm:items-start gap-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Origin</span>
                  <span className="text-4xl sm:text-7xl font-black tracking-tighter text-text">{flight.origin}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-muted">{flight.departureTime ? format(new Date(flight.departureTime), 'HH:mm') : '--:--'}</span>
                </div>
                <div className="flex-1 w-full sm:w-auto flex items-center justify-center px-4 sm:px-8">
                  <div className="w-full h-px bg-border relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 sm:p-2 border border-border rounded-full">
                      <Plane className="w-4 h-4 sm:w-6 sm:h-6 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-end gap-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Destination</span>
                  <span className="text-4xl sm:text-7xl font-black tracking-tighter text-text">{flight.destination}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-muted">{flight.arrivalTime ? format(new Date(flight.arrivalTime), 'HH:mm') : '--:--'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Departure Date</span>
                  <span className="text-lg font-bold text-text">{flight.departureTime ? format(new Date(flight.departureTime), 'MMM dd, yyyy') : 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Arrival Date</span>
                  <span className="text-lg font-bold text-text">{flight.arrivalTime ? format(new Date(flight.arrivalTime), 'MMM dd, yyyy') : 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1 sm:text-right">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Aircraft Type</span>
                  <span className="text-lg font-bold text-text">Air Freight Cargo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <h4 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-4 text-text">
              <Clock className="w-8 h-8 text-primary" /> Flight Journey Timeline
            </h4>
            <div className="relative ml-4 pl-10 border-l-2 border-border flex flex-col gap-12 py-4">
              {updates.length === 0 ? (
                <div className="relative">
                  <div className="absolute -left-[51px] top-1 w-5 h-5 rounded-full border-4 border-white bg-primary shadow-lg shadow-primary/30"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xl font-bold text-text uppercase tracking-tight">Flight Scheduled</span>
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">
                      {flight.departureTime ? format(new Date(flight.departureTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </span>
                    <p className="text-muted font-medium mt-3 max-w-2xl leading-relaxed text-sm sm:text-base">
                      Flight {flight.flightNumber} has been scheduled for departure from {flight.origin} to {flight.destination}.
                    </p>
                  </div>
                </div>
              ) : (
                updates.map((update, idx) => (
                  <div key={update.id} className="relative group">
                    <div className={`absolute -left-[51px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-lg transition-all duration-300 ${
                      idx === 0 ? 'bg-primary scale-125 shadow-primary/40' : 'bg-muted group-hover:bg-primary'
                    }`}></div>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xl font-bold text-text uppercase tracking-tight">{update.status}</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold bg-bg text-muted px-3 py-1.5 rounded-full uppercase tracking-widest border border-border">
                          <MapPin className="w-3 h-3 text-primary" /> {update.location}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-muted uppercase tracking-widest">{format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                      <p className="text-muted font-medium mt-3 max-w-2xl leading-relaxed text-sm sm:text-base">{update.description}</p>
                      {update.packageImage && (
                        <div className="mt-4">
                          <img 
                            src={update.packageImage} 
                            alt="Update Photo" 
                            referrerPolicy="no-referrer"
                            className="w-full max-w-sm h-32 object-cover rounded-xl border border-border shadow-sm" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

          {reviews.length > 0 && (
            <div className="flex flex-col gap-8 mt-12">
              <h4 className="text-3xl font-black tracking-tight flex items-center gap-3 text-text">
                <Star className="w-8 h-8 text-amber-400 fill-amber-400" /> Customer Feedback
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="card-modern p-6 bg-white flex flex-col gap-4 hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text">{review.userName}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted font-medium italic leading-relaxed">"{review.comment}"</p>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
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
