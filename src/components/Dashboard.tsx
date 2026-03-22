import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType, collection, query, where, onSnapshot, orderBy, updateDoc, doc, getDocs } from '../firebase';
import { Shipment, UserProfile } from '../types';
import { Package, Search, User, Mail, Calendar, Shield, Hash, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  profile: UserProfile | null;
}

export default function Dashboard({ profile }: DashboardProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [claimTracking, setClaimTracking] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (!profile) return;

    // Fetch shipments where user is sender OR receiver
    const q = query(
      collection(db, 'shipments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Shipment))
        .filter(s => s.senderId === profile.uid || s.receiverEmail === profile.email);
      setShipments(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'shipments');
    });

    return () => unsubscribe();
  }, [profile]);

  const handleClaimShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !claimTracking) return;
    
    setClaiming(true);
    setClaimStatus(null);
    
    try {
      const q = query(collection(db, 'shipments'), where('trackingNumber', '==', claimTracking));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setClaimStatus({ type: 'error', message: 'Tracking number not found.' });
        return;
      }

      const shipmentDoc = snapshot.docs[0];
      const shipmentData = shipmentDoc.data() as Shipment;

      if (shipmentData.senderId === profile.uid) {
        setClaimStatus({ type: 'error', message: 'This shipment is already in your dashboard.' });
        return;
      }

      // Allow claiming if receiverEmail matches or if it's unassigned (senderId is empty/placeholder)
      if (shipmentData.receiverEmail === profile.email || !shipmentData.senderId || shipmentData.senderId === 'admin') {
        await updateDoc(doc(db, 'shipments', shipmentDoc.id), {
          senderId: profile.uid // Linking it to the user
        });
        setClaimStatus({ type: 'success', message: 'Shipment successfully claimed and added to your dashboard!' });
        setClaimTracking('');
      } else {
        setClaimStatus({ type: 'error', message: 'You are not authorized to claim this shipment.' });
      }
    } catch (error) {
      setClaimStatus({ type: 'error', message: 'An error occurred while claiming the shipment.' });
    } finally {
      setClaiming(false);
    }
  };

  const filteredShipments = shipments.filter(s => 
    s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.receiverName && s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8 sm:gap-12 animate-fade-in py-4 sm:py-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-text">Dashboard</h2>
        <p className="text-xs sm:text-sm font-medium text-muted">Your account overview and shipment details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Registration Details & Claim Shipment */}
        <div className="lg:col-span-1 flex flex-col gap-6 sm:gap-8">
          <div className="card-modern p-5 sm:p-8 bg-white border-primary/10">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Registration Details
            </h3>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Customer ID</span>
                <div className="flex items-center gap-2 text-text font-bold">
                  <Hash className="w-4 h-4 text-primary" />
                  {profile?.customerID || 'N/A'}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Full Name</span>
                <span className="text-lg font-bold text-text">{profile?.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Email Address</span>
                <div className="flex items-center gap-2 text-text font-medium">
                  <Mail className="w-4 h-4 text-muted" />
                  {profile?.email}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Account Type</span>
                <div className="flex items-center gap-2 text-text font-medium">
                  <Shield className="w-4 h-4 text-muted" />
                  <span className="capitalize">{profile?.role}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Joined Date</span>
                <div className="flex items-center gap-2 text-text font-medium">
                  <Calendar className="w-4 h-4 text-muted" />
                  {profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM dd, yyyy') : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Claim Shipment */}
          <div className="card-modern p-5 sm:p-8 bg-white border-primary/10">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Claim Shipment
            </h3>
            <form onSubmit={handleClaimShipment} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Tracking Number</span>
                <input 
                  type="text" 
                  value={claimTracking}
                  onChange={(e) => setClaimTracking(e.target.value)}
                  placeholder="Enter tracking number..."
                  className="input-modern py-2 text-sm"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={claiming}
                className="btn-primary py-2.5 text-xs w-full"
              >
                {claiming ? 'Claiming...' : 'Claim Shipment'}
              </button>
              {claimStatus && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-xs font-bold ${
                  claimStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {claimStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {claimStatus.message}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
          <div className="card-modern p-5 sm:p-8 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Shipment Details
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text" 
                  placeholder="Search tracking..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern pl-10 py-2 text-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-muted font-medium">Loading shipments...</div>
            ) : filteredShipments.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-border rounded-2xl flex flex-col items-center gap-4">
                <Package className="w-10 h-10 text-muted/20" />
                <p className="text-sm font-bold text-muted uppercase tracking-widest">No shipments found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredShipments.map((shipment) => (
                  <div key={shipment.id} className="p-4 border border-border rounded-xl hover:border-primary/30 transition-all bg-bg/30">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Tracking Number</span>
                        <span className="font-mono font-bold text-primary">{shipment.trackingNumber}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Status</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full w-fit ${
                          shipment.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                          shipment.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {shipment.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Receiver</span>
                        <span className="text-sm font-bold">{shipment.receiverName}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Destination</span>
                        <span className="text-sm font-bold">{shipment.destination}</span>
                      </div>
                    </div>
                    {shipment.packageImage && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <img 
                          src={shipment.packageImage} 
                          alt="Package" 
                          referrerPolicy="no-referrer"
                          className="w-full h-32 object-cover rounded-lg border border-border" 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
