import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Shipment, ShipmentStatus, TrackingUpdate, Flight, FlightStatus, SupportTicket, Review } from '../types';
import { Search, Edit2, Plus, ArrowRight, Loader2, MapPin, Info, Plane, MessageSquare, Package, CheckCircle, XCircle, Star, FileText, Printer, X, Clock, Trash2, Activity, History } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import Logo from './Logo';

import Globe from './Globe';

type AdminTab = 'overview' | 'shipments' | 'flights' | 'cs' | 'reviews' | 'receipts' | 'users';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showReceipt, setShowReceipt] = useState<Shipment | Flight | null>(null);
  const [updating, setUpdating] = useState(false);

  // Update form state
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('pending');
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');
  const [updateImage, setUpdateImage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'shipment' | 'update' | 'manualReceipt') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'shipment') {
          setShipmentData(prev => ({ ...prev, packageImage: base64String }));
        } else if (type === 'manualReceipt') {
          setManualReceiptData(prev => ({ ...prev, packageImage: base64String }));
        } else {
          setUpdateImage(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Flight form state
  const [showFlightForm, setShowFlightForm] = useState(false);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [flightData, setFlightData] = useState({
    flightNumber: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    status: 'scheduled' as FlightStatus
  });
  const [shipmentData, setShipmentData] = useState({
    trackingNumber: '',
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    senderAddress: '',
    receiverName: '',
    receiverEmail: '',
    receiverPhone: '',
    receiverAddress: '',
    origin: '',
    destination: '',
    status: 'pending' as ShipmentStatus,
    weight: '',
    dimensions: '',
    serviceType: 'Express',
    estimatedDelivery: '',
    packageImage: ''
  });

  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteType, setConfirmDeleteType] = useState<'shipment' | 'flight' | 'ticket' | null>(null);

  const [showManualReceiptForm, setShowManualReceiptForm] = useState(false);
  const [manualReceiptData, setManualReceiptData] = useState({
    title: 'Official Shipping Receipt',
    date: new Date().toISOString().split('T')[0],
    receiptNumber: 'RCP-' + Math.floor(100000 + Math.random() * 900000),
    senderName: '',
    senderAddress: '',
    receiverName: '',
    receiverAddress: '',
    itemDescription: '',
    weight: '',
    amount: '',
    paymentMethod: 'Credit Card',
    packageImage: ''
  });

  const handleDeleteShipment = async (id: string) => {
    try {
      await api.shipments.delete(id);
      setConfirmDeleteId(null);
      setConfirmDeleteType(null);
      if (selectedShipment?.id === id) setSelectedShipment(null);
      refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleManualReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReceipt(manualReceiptData);
    setShowManualReceiptForm(false);
  };

  const resetShipmentForm = () => {
    setEditingShipment(null);
    setShipmentData({
      trackingNumber: 'SWIFT-' + Math.floor(100000 + Math.random() * 900000),
      senderName: '',
      senderEmail: '',
      senderPhone: '',
      senderAddress: '',
      receiverName: '',
      receiverEmail: '',
      receiverPhone: '',
      receiverAddress: '',
      origin: '',
      destination: '',
      status: 'pending',
      weight: '',
      dimensions: '',
      serviceType: 'Express',
      estimatedDelivery: '',
      packageImage: ''
    });
    setShowShipmentForm(true);
  };

  const refreshData = async () => {
    try {
      const [s, f, t, r, u] = await Promise.all([
        api.shipments.list(),
        api.flights.list(),
        api.supportTickets.list(),
        api.reviews.list(),
        api.users.list()
      ]);
      setShipments(s);
      setFlights(f);
      setTickets(t);
      setReviews(r);
      setUsers(u);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const dataToSave = {
      ...shipmentData,
      weight: parseFloat(shipmentData.weight) || 0
    };
    try {
      if (editingShipment) {
        await api.shipments.update(editingShipment.id, dataToSave);
      } else {
        await api.shipments.create(dataToSave);
      }
      setShowShipmentForm(false);
      setEditingShipment(null);
      refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setUpdating(true);
    try {
      const now = new Date().toISOString();
      await api.shipments.addUpdate(selectedShipment.id, {
        location: updateLocation,
        status: newStatus,
        description: updateDesc,
        packageImage: updateImage,
        timestamp: now
      });
      setUpdateLocation('');
      setUpdateDesc('');
      setUpdateImage('');
      setSelectedShipment(null);
      refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      if (editingFlight) {
        await api.flights.update(editingFlight.id, flightData);
      } else {
        await api.flights.create(flightData);
      }
      setShowFlightForm(false);
      setEditingFlight(null);
      refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteFlight = async (flightId: string) => {
    try {
      await api.flights.delete(flightId);
      setConfirmDeleteId(null);
      setConfirmDeleteType(null);
      if (selectedFlight?.id === flightId) setSelectedFlight(null);
      refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await api.supportTickets.delete(ticketId);
      setConfirmDeleteId(null);
      setConfirmDeleteType(null);
      refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateFlightStatus = async (flightId: string, status: FlightStatus) => {
    setUpdating(true);
    try {
      await api.flights.update(flightId, { status });
      refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddFlightUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;
    setUpdating(true);
    try {
      const now = new Date().toISOString();
      await api.flights.addUpdate(selectedFlight.id, {
        location: updateLocation,
        status: flightData.status,
        description: updateDesc,
        timestamp: now
      });
      setUpdateLocation('');
      setUpdateDesc('');
      setSelectedFlight(null);
      refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await api.supportTickets.update(ticketId, { 
        status: 'resolved',
        reply: replyText || 'Issue resolved by administrator.'
      });
      setReplyText('');
      setReplyingTo(null);
      refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredShipments = shipments.filter(s => 
    s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-black tracking-tight text-text">Admin Portal</h2>
          <p className="text-sm font-medium text-muted">Manage shipments, flights, and customer support</p>
        </div>
        <div className="flex gap-1 p-1 bg-bg rounded-xl w-full sm:w-fit overflow-x-auto scrollbar-hide">
          {(['overview', 'shipments', 'flights', 'cs', 'reviews', 'receipts', 'users'] as AdminTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-muted hover:text-text'
              }`}
            >
              {tab === 'cs' ? 'Support' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="card-modern p-1 bg-white overflow-hidden relative min-h-[600px] flex items-center justify-center">
              <div className="absolute top-8 left-8 z-20">
                <span className="section-label mb-2">Live Global Operations</span>
                <h3 className="heading-display text-5xl">Real-time Network</h3>
              </div>
              <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2 text-right">
                <span className="text-micro text-accent">Active Flights: {flights.filter(f => f.status === 'departed').length}</span>
                <span className="text-micro text-primary">In Transit: {shipments.filter(s => s.status !== 'delivered' && s.status !== 'cancelled').length}</span>
              </div>
              <Globe />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-border border border-border">
              <div className="bg-white p-8 flex flex-col gap-2">
                <span className="text-micro text-muted">Total Shipments</span>
                <span className="text-4xl font-black tracking-tight">{shipments.length}</span>
                <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold">
                  <ArrowRight className="w-3 h-3 -rotate-45" /> +12% this week
                </div>
              </div>
              <div className="bg-white p-8 flex flex-col gap-2">
                <span className="text-micro text-muted">Active Flights</span>
                <span className="text-4xl font-black tracking-tight">{flights.length}</span>
                <div className="flex items-center gap-2 text-amber-600 text-[10px] font-bold">
                  <Clock className="w-3 h-3" /> 4 delayed
                </div>
              </div>
              <div className="bg-white p-8 flex flex-col gap-2">
                <span className="text-micro text-muted">Support Tickets</span>
                <span className="text-4xl font-black tracking-tight">{tickets.filter(t => t.status === 'open').length}</span>
                <div className="flex items-center gap-2 text-rose-600 text-[10px] font-bold">
                  <Info className="w-3 h-3" /> Urgent action required
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-1 bg-border border border-border">
            <div className="bg-white p-10 flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <h4 className="text-micro font-bold uppercase tracking-widest flex items-center gap-2 opacity-50">
                  <History className="w-3 h-3" /> RECENT_ACTIVITY_LOG
                </h4>
                <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Full_Log</button>
              </div>
              <div className="flex flex-col gap-6">
                {shipments.slice(0, 5).map(shipment => (
                  <div key={shipment.id} className="flex gap-6 items-start group">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform" />
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-black tracking-tight text-text uppercase">Shipment {shipment.trackingNumber} updated</span>
                      <div className="flex items-center gap-2">
                        <span className="text-micro font-mono text-muted">{format(new Date(shipment.createdAt), 'HH:mm:ss')}</span>
                        <span className="text-micro font-bold text-primary uppercase tracking-widest px-1.5 py-0.5 bg-bg border border-border">
                          {shipment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary text-white p-10 flex flex-col gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Activity className="w-24 h-24" />
              </div>
              <h4 className="text-micro font-bold uppercase tracking-widest flex items-center gap-2 opacity-70">
                <Activity className="w-3 h-3" /> SYSTEM_HEALTH_METRICS
              </h4>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-micro font-bold uppercase tracking-widest opacity-70">
                    <span>Server_Load</span>
                    <span className="text-accent">24.08%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: '24%' }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-micro font-bold uppercase tracking-widest opacity-70">
                    <span>Database_Sync</span>
                    <span className="text-emerald-400">99.99%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-micro font-bold uppercase tracking-widest opacity-70">
                    <span>API_Latency</span>
                    <span className="text-amber-400">124ms</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-amber-400"
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shipments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input 
                  type="text" 
                  placeholder="Search all shipments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern pl-12"
                />
              </div>
              <button 
                onClick={resetShipmentForm}
                className="btn-primary whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Add Shipment
              </button>
            </div>

            <div className="card-modern bg-white overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-1 bg-border border-b border-border">
                <div className="col-span-1 p-4 col-header">#</div>
                <div className="col-span-3 p-4 col-header">Tracking ID</div>
                <div className="col-span-3 p-4 col-header">Receiver</div>
                <div className="col-span-2 p-4 col-header">Status</div>
                <div className="col-span-3 p-4 col-header text-right">Actions</div>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {filteredShipments.map((shipment, idx) => (
                  <div key={shipment.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-1 hover:bg-bg transition-colors items-start sm:items-center group p-4 sm:p-0">
                    <div className="hidden sm:block col-span-1 p-4 text-[10px] font-mono text-muted">{(idx + 1).toString().padStart(2, '0')}</div>
                    <div className="col-span-3 sm:p-4 font-mono font-bold text-primary text-xs flex flex-col sm:block gap-1">
                      <span className="sm:hidden text-[9px] text-muted uppercase tracking-widest">Tracking ID</span>
                      {shipment.trackingNumber}
                    </div>
                    <div className="col-span-3 sm:p-4 font-bold text-text text-sm flex flex-col sm:block gap-1 mt-2 sm:mt-0">
                      <span className="sm:hidden text-[9px] text-muted uppercase tracking-widest">Receiver</span>
                      {shipment.receiverName}
                    </div>
                    <div className="col-span-2 sm:p-4 mt-2 sm:mt-0">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm border ${
                        shipment.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        shipment.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {shipment.status}
                      </span>
                    </div>
                    <div className="col-span-3 sm:p-4 text-right w-full sm:w-auto mt-4 sm:mt-0">
                      <div className="flex justify-start sm:justify-end gap-1">
                        <button 
                          onClick={() => setShowReceipt(shipment)}
                          className="p-2 hover:bg-white rounded border border-transparent hover:border-border text-muted hover:text-primary transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingShipment(shipment);
                            setShipmentData({
                              trackingNumber: shipment.trackingNumber,
                              senderName: shipment.senderName || '',
                              senderEmail: shipment.senderEmail || '',
                              senderPhone: shipment.senderPhone || '',
                              senderAddress: shipment.senderAddress || '',
                              receiverName: shipment.receiverName || '',
                              receiverEmail: shipment.receiverEmail || '',
                              receiverPhone: shipment.receiverPhone || '',
                              receiverAddress: shipment.receiverAddress || '',
                              origin: shipment.origin || '',
                              destination: shipment.destination || '',
                              status: shipment.status,
                              weight: shipment.weight ? shipment.weight.toString() : '',
                              dimensions: shipment.dimensions || '',
                              serviceType: shipment.serviceType || 'Express',
                              estimatedDelivery: shipment.estimatedDelivery || '',
                              packageImage: shipment.packageImage || ''
                            });
                            setShowShipmentForm(true);
                          }}
                          className="p-2 hover:bg-white rounded border border-transparent hover:border-border text-muted hover:text-primary transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            setConfirmDeleteId(shipment.id);
                            setConfirmDeleteType('shipment');
                          }}
                          className="p-2 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 text-muted hover:text-rose-600 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setNewStatus(shipment.status);
                            setUpdateImage(shipment.packageImage || '');
                          }}
                          className="p-2 bg-primary text-white rounded hover:bg-accent transition-all"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="card-modern p-6 sticky top-24 bg-white">
              <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2 text-text">
                <Package className="w-5 h-5 text-primary" /> Update Shipment
              </h3>
              
              {selectedShipment ? (
                <form onSubmit={handleAddUpdate} className="flex flex-col gap-5">
                  <div className="bg-bg rounded-xl p-4 border border-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Tracking ID</span>
                      <span className="text-xs font-bold font-mono text-primary">{selectedShipment.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Receiver</span>
                      <span className="text-xs font-bold truncate max-w-[150px]">{selectedShipment.receiverName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">New Status</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                      className="input-modern py-2.5 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="carrier-1">Carrier 1</option>
                      <option value="carrier-2">Carrier 2</option>
                      <option value="carrier-3">Carrier 3</option>
                      <option value="customs">Customs</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input 
                        type="text" 
                        required
                        value={updateLocation}
                        onChange={(e) => setUpdateLocation(e.target.value)}
                        placeholder="e.g. London Hub"
                        className="input-modern pl-10 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Update Description</label>
                    <div className="relative">
                      <Info className="absolute left-3 top-3 w-4 h-4 text-muted" />
                      <textarea 
                        required
                        value={updateDesc}
                        onChange={(e) => setUpdateDesc(e.target.value)}
                        placeholder="Details about the update..."
                        className="input-modern pl-10 py-2.5 text-sm min-h-[100px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Package Image</label>
                    <div className="relative">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'update')}
                        className="hidden"
                        id="update-image-upload"
                      />
                      <label 
                        htmlFor="update-image-upload"
                        className="input-modern py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-bg transition-colors"
                      >
                        <Package className="w-4 h-4 text-muted" />
                        {updateImage ? 'Change Image' : 'Upload from Device'}
                      </label>
                      {updateImage && (
                        <div className="mt-2 relative group">
                          <img src={updateImage} alt="Preview" className="w-full h-20 object-cover rounded-lg border border-border" />
                          <button 
                            type="button"
                            onClick={() => setUpdateImage('')}
                            className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={updating}
                      className="btn-primary w-full py-3"
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      Post Update
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedShipment(null)}
                      className="text-xs font-bold text-muted hover:text-text transition-colors text-center py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl flex flex-col items-center gap-4">
                  <Package className="w-10 h-10 text-muted/20" />
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Select shipment to edit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'flights' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold tracking-tight text-text">Flight Schedules</h3>
                <p className="text-sm text-muted font-medium">Manage air freight routes and timings</p>
              </div>
              <button 
                onClick={() => {
                  setEditingFlight(null);
                  setFlightData({ flightNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', status: 'scheduled' });
                  setShowFlightForm(true);
                }}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" /> Add Flight
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-border border border-border">
              {flights.map(flight => (
                <div key={flight.id} className="bg-white p-8 flex flex-col gap-8 group hover:bg-primary hover:text-white transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-bg group-hover:bg-white/10 flex items-center justify-center transition-colors">
                        <Plane className="w-5 h-5 group-hover:text-accent transition-colors" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-micro opacity-50">Flight ID</span>
                        <span className="font-mono font-bold tracking-tighter">{flight.flightNumber}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setShowReceipt(flight)}
                        className="p-2 hover:bg-bg group-hover:hover:bg-white/10 rounded transition-all"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedFlight(flight);
                          setFlightData({ ...flightData, status: flight.status });
                        }}
                        className="p-2 hover:bg-bg group-hover:hover:bg-white/10 rounded transition-all"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingFlight(flight);
                          setFlightData({
                            flightNumber: flight.flightNumber,
                            origin: flight.origin,
                            destination: flight.destination,
                            departureTime: flight.departureTime || '',
                            arrivalTime: flight.arrivalTime || '',
                            status: flight.status
                          });
                          setShowFlightForm(true);
                        }}
                        className="p-2 hover:bg-bg group-hover:hover:bg-white/10 rounded transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setConfirmDeleteId(flight.id);
                          setConfirmDeleteType('flight');
                        }}
                        className="p-2 hover:bg-rose-50 group-hover:hover:bg-rose-500 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex flex-col">
                      <span className="text-micro opacity-50 mb-1">Origin</span>
                      <span className="text-3xl font-black tracking-tighter heading-display">{flight.origin}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                      <div className="w-full h-px bg-border group-hover:bg-white/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ x: [-20, 20], opacity: [0, 1, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Plane className="w-4 h-4 text-accent" />
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-micro opacity-50 mb-1">Destination</span>
                      <span className="text-3xl font-black tracking-tighter heading-display">{flight.destination}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-border group-hover:border-white/10">
                    <div className="flex flex-col gap-1">
                      <span className="text-micro opacity-50">Schedule</span>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span>{flight.departureTime ? format(new Date(flight.departureTime), 'HH:mm') : '--:--'}</span>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <span>{flight.arrivalTime ? format(new Date(flight.arrivalTime), 'HH:mm') : '--:--'}</span>
                      </div>
                    </div>
                    <select 
                      value={flight.status}
                      onChange={(e) => handleUpdateFlightStatus(flight.id, e.target.value as FlightStatus)}
                      disabled={updating}
                      className={`text-[10px] font-bold uppercase px-3 py-1 rounded-sm border cursor-pointer transition-all ${
                        flight.status === 'arrived' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-transparent' : 
                        flight.status === 'delayed' ? 'bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-500 group-hover:text-white group-hover:border-transparent' : 
                        flight.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200 group-hover:bg-rose-500 group-hover:text-white group-hover:border-transparent' : 
                        'bg-primary/5 text-primary border-primary/10 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20'
                      }`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="departed">Departed</option>
                      <option value="arrived">Arrived</option>
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="card-modern p-6 sticky top-24 bg-white">
              <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2 text-text">
                <Plane className="w-5 h-5 text-primary" /> Flight Update
              </h3>
              
              {selectedFlight ? (
                <form onSubmit={handleAddFlightUpdate} className="flex flex-col gap-5">
                  <div className="bg-bg rounded-xl p-4 border border-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Flight #</span>
                      <span className="text-xs font-bold font-mono text-primary">{selectedFlight.flightNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Route</span>
                      <span className="text-xs font-bold">{selectedFlight.origin} → {selectedFlight.destination}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">New Status</label>
                    <select 
                      value={flightData.status}
                      onChange={(e) => setFlightData({...flightData, status: e.target.value as FlightStatus})}
                      className="input-modern py-2.5 text-sm"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="departed">Departed</option>
                      <option value="arrived">Arrived</option>
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input 
                        type="text" 
                        required
                        value={updateLocation}
                        onChange={(e) => setUpdateLocation(e.target.value)}
                        placeholder="e.g. Heathrow Airport"
                        className="input-modern pl-10 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Update Description</label>
                    <div className="relative">
                      <Info className="absolute left-3 top-3 w-4 h-4 text-muted" />
                      <textarea 
                        required
                        value={updateDesc}
                        onChange={(e) => setUpdateDesc(e.target.value)}
                        placeholder="Details about the flight update..."
                        className="input-modern pl-10 py-2.5 text-sm min-h-[100px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={updating}
                      className="btn-primary w-full py-3"
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      Post Flight Update
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedFlight(null)}
                      className="text-xs font-bold text-muted hover:text-text transition-colors text-center py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl flex flex-col items-center gap-4">
                  <Plane className="w-10 h-10 text-muted/20" />
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Select flight to update</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )}

      {activeTab === 'cs' && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black tracking-tighter heading-display text-text">SUPPORT_LOGS</h3>
            <p className="text-micro opacity-50 uppercase tracking-widest">Inbound terminal communications and system tickets</p>
          </div>
          <div className="flex flex-col gap-1 bg-border border border-border">
            {tickets.length === 0 ? (
              <div className="py-24 text-center bg-white flex flex-col items-center gap-4">
                <MessageSquare className="w-12 h-12 text-muted/20" />
                <p className="text-micro font-bold text-muted uppercase tracking-widest">No active terminal sessions</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="p-8 bg-white flex flex-col md:flex-row justify-between gap-8 hover:bg-bg transition-all group">
                  <div className="flex flex-col gap-4 flex-1">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        ticket.status === 'open' ? 'bg-amber-500' : 
                        ticket.status === 'pending' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      <span className="text-micro font-bold text-muted uppercase tracking-widest">
                        {ticket.status} // {format(new Date(ticket.createdAt), 'yyyy.MM.dd HH:mm:ss')}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black tracking-tighter heading-display text-text uppercase">{ticket.subject}</h4>
                    <div className="font-mono text-sm text-muted leading-relaxed border-l-2 border-border pl-6 py-2 italic">
                      {ticket.message}
                    </div>
                    {ticket.reply && (
                      <div className="bg-primary text-white p-6 rounded-sm mt-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                          <MessageSquare className="w-12 h-12" />
                        </div>
                        <span className="text-micro font-bold uppercase tracking-widest block mb-2 opacity-70">Terminal_Reply_Auth_Admin</span>
                        <p className="font-mono text-sm">{ticket.reply}</p>
                      </div>
                    )}
                  </div>
                  {ticket.status !== 'resolved' && (
                    <div className="flex flex-col gap-4 w-full md:min-w-[320px] md:w-auto">
                      <div className="flex justify-end">
                        <button 
                          onClick={() => {
                            setConfirmDeleteId(ticket.id);
                            setConfirmDeleteType('ticket');
                          }}
                          className="p-2 hover:bg-rose-50 rounded text-muted hover:text-rose-600 transition-all border border-transparent hover:border-rose-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {replyingTo === ticket.id ? (
                        <div className="flex flex-col gap-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Enter terminal response..."
                            className="input-modern font-mono text-xs min-h-[120px] resize-none bg-bg border-border focus:border-primary"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleResolveTicket(ticket.id)}
                              className="bg-primary text-white py-3 flex-1 text-micro font-bold uppercase tracking-widest hover:bg-accent transition-all"
                            >
                              Execute_Resolve
                            </button>
                            <button 
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="bg-bg text-muted py-3 flex-1 text-micro font-bold uppercase tracking-widest hover:bg-border transition-all border border-border"
                            >
                              Abort
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setReplyingTo(ticket.id)}
                          className="bg-primary text-white py-4 px-8 text-micro font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-lg shadow-primary/20"
                        >
                          Initialize_Response
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black tracking-tighter heading-display text-text">USER_FEEDBACK</h3>
            <p className="text-micro opacity-50 uppercase tracking-widest">Public sentiment and service quality metrics</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-border border border-border">
            {reviews.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white flex flex-col items-center gap-4">
                <Star className="w-12 h-12 text-muted/20" />
                <p className="text-micro font-bold text-muted uppercase tracking-widest">No data points available</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="p-8 bg-white flex flex-col gap-6 hover:bg-bg transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-tight text-text uppercase">{review.userName}</span>
                      <span className="text-micro font-bold text-muted uppercase tracking-widest">{format(new Date(review.createdAt), 'yyyy.MM.dd')}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-3 h-3 ${star <= review.rating ? 'fill-accent text-accent' : 'text-border'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-bg border border-border text-[9px] font-mono font-bold text-muted uppercase tracking-widest">
                      {review.targetType}
                    </div>
                    <div className="font-mono text-[9px] font-bold text-primary">
                      {review.targetId}
                    </div>
                  </div>
                  <p className="font-serif italic text-muted leading-relaxed text-lg">"{review.comment}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black tracking-tighter heading-display text-text">RECEIPT_GENERATOR</h3>
            <p className="text-micro opacity-50 uppercase tracking-widest">Official documentation and billing terminal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-border border border-border">
            <div className="bg-white p-10 flex flex-col items-center justify-center gap-6 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer group"
              onClick={() => {
                setManualReceiptData({
                  ...manualReceiptData,
                  receiptNumber: 'RCP-' + Math.floor(100000 + Math.random() * 900000),
                  date: new Date().toISOString().split('T')[0]
                });
                setShowManualReceiptForm(true);
              }}
            >
              <div className="w-20 h-20 rounded-full bg-bg group-hover:bg-white/10 flex items-center justify-center transition-all group-hover:scale-110">
                <Plus className="w-8 h-8 group-hover:text-accent transition-colors" />
              </div>
              <div className="text-center">
                <h4 className="font-black text-xl uppercase tracking-tighter heading-display">Manual_Entry</h4>
                <p className="text-micro opacity-50 uppercase tracking-widest mt-2">Custom billing documentation</p>
              </div>
            </div>

            <div className="bg-white p-10 flex flex-col gap-8">
              <h4 className="text-micro font-bold uppercase tracking-widest flex items-center gap-2 opacity-50">
                <Package className="w-3 h-3" /> Shipments_Queue
              </h4>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {shipments.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-4 bg-bg border border-border hover:border-primary transition-all group">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-primary">{s.trackingNumber}</span>
                      <span className="text-xs font-bold uppercase tracking-tight">{s.receiverName}</span>
                    </div>
                    <button 
                      onClick={() => setShowReceipt(s)}
                      className="p-2 hover:bg-primary hover:text-white rounded transition-all"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-10 flex flex-col gap-8">
              <h4 className="text-micro font-bold uppercase tracking-widest flex items-center gap-2 opacity-50">
                <Plane className="w-3 h-3" /> Flights_Queue
              </h4>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {flights.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-4 bg-bg border border-border hover:border-primary transition-all group">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-secondary">{f.flightNumber}</span>
                      <span className="text-xs font-bold uppercase tracking-tight">{f.origin} → {f.destination}</span>
                    </div>
                    <button 
                      onClick={() => setShowReceipt(f)}
                      className="p-2 hover:bg-primary hover:text-white rounded transition-all"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black tracking-tighter heading-display text-text">USER_DATABASE</h3>
            <p className="text-micro opacity-50 uppercase tracking-widest">Authorized personnel and customer registry</p>
          </div>
          <div className="card-modern overflow-hidden bg-white">
            <div className="hidden sm:grid grid-cols-12 gap-1 bg-border border-b border-border">
              <div className="col-span-3 p-4 col-header">Personnel_Name</div>
              <div className="col-span-3 p-4 col-header">Email_Address</div>
              <div className="col-span-2 p-4 col-header">Customer_ID</div>
              <div className="col-span-2 p-4 col-header">Access_Level</div>
              <div className="col-span-2 p-4 col-header">Registry_Date</div>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {users.map((user) => (
                <div key={user.uid} className="flex flex-col sm:grid sm:grid-cols-12 gap-1 hover:bg-bg transition-colors items-start sm:items-center group p-4 sm:p-0">
                  <div className="col-span-3 sm:p-4 font-black tracking-tight text-text uppercase text-sm flex flex-col sm:block gap-1">
                    <span className="sm:hidden text-[9px] text-muted uppercase tracking-widest">Personnel_Name</span>
                    {user.name}
                  </div>
                  <div className="col-span-3 sm:p-4 text-xs font-mono text-muted flex flex-col sm:block gap-1 mt-2 sm:mt-0">
                    <span className="sm:hidden text-[9px] text-muted uppercase tracking-widest">Email_Address</span>
                    {user.email}
                  </div>
                  <div className="col-span-2 sm:p-4 font-mono font-bold text-primary text-xs flex flex-col sm:block gap-1 mt-2 sm:mt-0">
                    <span className="sm:hidden text-[9px] text-muted uppercase tracking-widest">Customer_ID</span>
                    {user.customerID}
                  </div>
                  <div className="col-span-2 sm:p-4 mt-2 sm:mt-0">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm border ${
                      user.role === 'admin' ? 'bg-primary text-white border-primary' : 'bg-bg text-muted border-border'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="col-span-2 sm:p-4 text-xs font-mono text-muted mt-2 sm:mt-0">
                    <span className="sm:hidden text-[9px] text-muted uppercase tracking-widest mr-2">Registry_Date:</span>
                    {user.createdAt ? format(new Date(user.createdAt), 'yyyy.MM.dd') : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showManualReceiptForm && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-sm flex items-center justify-center z-[200] p-2 sm:p-4">
          <div className="card-modern w-full max-w-2xl p-4 sm:p-8 bg-white animate-fade-in max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Create Manual Receipt</h2>
              <button onClick={() => setShowManualReceiptForm(false)} className="p-2 hover:bg-bg rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <form onSubmit={handleManualReceiptSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">Receipt Info</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Receipt Title</label>
                    <input 
                      type="text" required
                      value={manualReceiptData.title} onChange={e => setManualReceiptData({...manualReceiptData, title: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Date</label>
                    <input 
                      type="date" required
                      value={manualReceiptData.date} onChange={e => setManualReceiptData({...manualReceiptData, date: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Item Description</label>
                    <input 
                      type="text" required
                      value={manualReceiptData.itemDescription} onChange={e => setManualReceiptData({...manualReceiptData, itemDescription: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">Financials</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Amount ($)</label>
                    <input 
                      type="text" required
                      value={manualReceiptData.amount} onChange={e => setManualReceiptData({...manualReceiptData, amount: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Weight (KG)</label>
                    <input 
                      type="text" required
                      value={manualReceiptData.weight} onChange={e => setManualReceiptData({...manualReceiptData, weight: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Payment Method</label>
                    <select 
                      value={manualReceiptData.paymentMethod} onChange={e => setManualReceiptData({...manualReceiptData, paymentMethod: e.target.value})}
                      className="input-modern py-2"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">Sender</h3>
                  <input 
                    type="text" placeholder="Name" required
                    value={manualReceiptData.senderName} onChange={e => setManualReceiptData({...manualReceiptData, senderName: e.target.value})}
                    className="input-modern py-2 mb-2"
                  />
                  <textarea 
                    placeholder="Address" required
                    value={manualReceiptData.senderAddress} onChange={e => setManualReceiptData({...manualReceiptData, senderAddress: e.target.value})}
                    className="input-modern py-2 min-h-[80px] resize-none"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">Receiver</h3>
                  <input 
                    type="text" placeholder="Name" required
                    value={manualReceiptData.receiverName} onChange={e => setManualReceiptData({...manualReceiptData, receiverName: e.target.value})}
                    className="input-modern py-2 mb-2"
                  />
                  <textarea 
                    placeholder="Address" required
                    value={manualReceiptData.receiverAddress} onChange={e => setManualReceiptData({...manualReceiptData, receiverAddress: e.target.value})}
                    className="input-modern py-2 min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Package Image</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'manualReceipt')}
                  className="hidden"
                  id="manual-receipt-image-upload"
                />
                <label 
                  htmlFor="manual-receipt-image-upload"
                  className="input-modern py-2 text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-bg transition-colors"
                >
                  <Package className="w-4 h-4 text-muted" />
                  {manualReceiptData.packageImage ? 'Change Image' : 'Upload Package Photo'}
                </label>
                {manualReceiptData.packageImage && (
                  <div className="mt-2 relative group w-fit">
                    <img src={manualReceiptData.packageImage} alt="Preview" className="h-20 object-cover rounded-lg border border-border" />
                    <button 
                      type="button"
                      onClick={() => setManualReceiptData(prev => ({ ...prev, packageImage: '' }))}
                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowManualReceiptForm(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Generate Professional Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShipmentForm && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4">
          <div className="card-modern w-full max-w-2xl p-4 sm:p-8 bg-white animate-fade-in max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {editingShipment ? 'Edit Shipment' : 'New Shipment'}
              </h2>
              <button onClick={() => setShowShipmentForm(false)} className="p-2 hover:bg-bg rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <form onSubmit={handleSaveShipment} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">Sender Details</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Name</label>
                    <input 
                      type="text" required
                      value={shipmentData.senderName} onChange={e => setShipmentData({...shipmentData, senderName: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Email</label>
                    <input 
                      type="email" required
                      value={shipmentData.senderEmail} onChange={e => setShipmentData({...shipmentData, senderEmail: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Phone</label>
                    <input 
                      type="text" required
                      value={shipmentData.senderPhone} onChange={e => setShipmentData({...shipmentData, senderPhone: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Address</label>
                    <textarea 
                      required
                      value={shipmentData.senderAddress} onChange={e => setShipmentData({...shipmentData, senderAddress: e.target.value})}
                      className="input-modern py-2 min-h-[80px] resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">Receiver Details</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Name</label>
                    <input 
                      type="text" required
                      value={shipmentData.receiverName} onChange={e => setShipmentData({...shipmentData, receiverName: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Email</label>
                    <input 
                      type="email" required
                      value={shipmentData.receiverEmail} onChange={e => setShipmentData({...shipmentData, receiverEmail: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Phone</label>
                    <input 
                      type="text" required
                      value={shipmentData.receiverPhone} onChange={e => setShipmentData({...shipmentData, receiverPhone: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Address</label>
                    <textarea 
                      required
                      value={shipmentData.receiverAddress} onChange={e => setShipmentData({...shipmentData, receiverAddress: e.target.value})}
                      className="input-modern py-2 min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">Shipment Info</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Tracking #</label>
                    <input 
                      type="text" required
                      value={shipmentData.trackingNumber} onChange={e => setShipmentData({...shipmentData, trackingNumber: e.target.value})}
                      className="input-modern py-2 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Weight (KG)</label>
                    <input 
                      type="text" required
                      value={shipmentData.weight} onChange={e => setShipmentData({...shipmentData, weight: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Origin</label>
                    <input 
                      type="text" required
                      value={shipmentData.origin} onChange={e => setShipmentData({...shipmentData, origin: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Destination</label>
                    <input 
                      type="text" required
                      value={shipmentData.destination} onChange={e => setShipmentData({...shipmentData, destination: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Dimensions</label>
                    <input 
                      type="text" placeholder="e.g. 20x20x20 cm"
                      value={shipmentData.dimensions} onChange={e => setShipmentData({...shipmentData, dimensions: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Service Type</label>
                    <select 
                      value={shipmentData.serviceType} onChange={e => setShipmentData({...shipmentData, serviceType: e.target.value})}
                      className="input-modern py-2"
                    >
                      <option value="Express">Express</option>
                      <option value="Standard">Standard</option>
                      <option value="Economy">Economy</option>
                      <option value="Priority">Priority</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Package Image</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'shipment')}
                      className="hidden"
                      id="shipment-image-upload"
                    />
                    <label 
                      htmlFor="shipment-image-upload"
                      className="input-modern py-2 text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-bg transition-colors"
                    >
                      <Package className="w-4 h-4 text-muted" />
                      {shipmentData.packageImage ? 'Change Image' : 'Upload from Device'}
                    </label>
                    {shipmentData.packageImage && (
                      <div className="mt-2 relative group">
                        <img src={shipmentData.packageImage} alt="Preview" className="w-full h-20 object-cover rounded-lg border border-border" />
                        <button 
                          type="button"
                          onClick={() => setShipmentData(prev => ({ ...prev, packageImage: '' }))}
                          className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Est. Delivery</label>
                    <input 
                      type="date"
                      value={shipmentData.estimatedDelivery} onChange={e => setShipmentData({...shipmentData, estimatedDelivery: e.target.value})}
                      className="input-modern py-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowShipmentForm(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 btn-primary">
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingShipment ? 'Save Changes' : 'Create Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFlightForm && (
            <div className="fixed inset-0 bg-text/40 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4">
              <div className="card-modern w-full max-w-md p-4 sm:p-8 bg-white animate-fade-in max-h-[95vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {editingFlight ? 'Edit Flight' : 'New Flight'}
                  </h2>
                  <button onClick={() => setShowFlightForm(false)} className="p-2 hover:bg-bg rounded-lg transition-colors">
                    <X className="w-5 h-5 text-muted" />
                  </button>
                </div>
                <form onSubmit={handleSaveFlight} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Flight Number</label>
                    <input 
                      type="text" placeholder="e.g. BA123" required
                      value={flightData.flightNumber} onChange={e => setFlightData({...flightData, flightNumber: e.target.value})}
                      className="input-modern"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Origin</label>
                      <input 
                        type="text" placeholder="LHR" required
                        value={flightData.origin} onChange={e => setFlightData({...flightData, origin: e.target.value})}
                        className="input-modern"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Destination</label>
                      <input 
                        type="text" placeholder="JFK" required
                        value={flightData.destination} onChange={e => setFlightData({...flightData, destination: e.target.value})}
                        className="input-modern"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Departure</label>
                      <input 
                        type="datetime-local" required
                        value={flightData.departureTime} onChange={e => setFlightData({...flightData, departureTime: e.target.value})}
                        className="input-modern text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Arrival</label>
                      <input 
                        type="datetime-local" required
                        value={flightData.arrivalTime} onChange={e => setFlightData({...flightData, arrivalTime: e.target.value})}
                        className="input-modern text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Status</label>
                    <select 
                      value={flightData.status} onChange={e => setFlightData({...flightData, status: e.target.value as FlightStatus})}
                      className="input-modern"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="departed">Departed</option>
                      <option value="arrived">Arrived</option>
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                    <button type="button" onClick={() => {
                      setShowFlightForm(false);
                      setEditingFlight(null);
                    }} className="flex-1 btn-secondary">Cancel</button>
                    <button type="submit" disabled={updating} className="flex-1 btn-primary">
                      {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                      {editingFlight ? 'Save' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

      {showReceipt && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-sm flex items-center justify-center z-[200] p-2 sm:p-4">
          <div className="card-modern w-full max-w-2xl bg-white p-4 sm:p-12 relative overflow-hidden animate-zoom-in max-h-[95vh] overflow-y-auto">
            <button 
              onClick={() => setShowReceipt(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-bg rounded-lg transition-colors z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-muted" />
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 sm:mb-12">
              <div className="flex items-center gap-3">
                <div className="text-primary scale-75 sm:scale-100 origin-left">
                  <Logo size={48} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight text-text">
                    {'title' in showReceipt ? showReceipt.title : 'Receipt'}
                  </h2>
                  <p className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-widest">SwiftTrack Consignment Systems</p>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto">
                <div className="bg-primary/10 text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs inline-block">
                  Official Document
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 mb-8 sm:mb-12">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Reference ID</span>
                  <span className="text-lg sm:text-xl font-bold font-mono text-primary break-all">
                    {'trackingNumber' in showReceipt ? showReceipt.trackingNumber : 
                     'receiptNumber' in showReceipt ? showReceipt.receiptNumber : showReceipt.flightNumber}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Date Issued</span>
                  <span className="text-lg sm:text-xl font-bold font-mono text-text">
                    {'date' in showReceipt ? format(new Date(showReceipt.date), 'MMM dd, yyyy') : format(new Date(), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Type</span>
                  <span className="text-lg sm:text-xl font-bold text-text">
                    {'trackingNumber' in showReceipt ? 'Shipment Consignment' : 
                     'receiptNumber' in showReceipt ? 'Manual Receipt' : 'Flight Schedule'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Status</span>
                  <span className={`text-lg sm:text-xl font-bold uppercase px-3 py-1 rounded-lg w-fit ${
                    showReceipt.status === 'delivered' || showReceipt.status === 'arrived' || !('status' in showReceipt) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {'status' in showReceipt ? showReceipt.status : 'Paid'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-bg rounded-2xl p-4 sm:p-8 mb-8 sm:mb-12 border border-border">
              <h4 className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-widest mb-4 sm:mb-6">Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                {'trackingNumber' in showReceipt ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Receiver</span>
                      <span className="text-sm sm:text-base font-bold text-text">{showReceipt.receiverName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Weight</span>
                      <span className="text-sm sm:text-base font-bold text-text">{showReceipt.weight} KG</span>
                    </div>
                    <div className="sm:col-span-2 flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Address</span>
                      <span className="text-sm sm:text-base font-bold text-text">{showReceipt.receiverAddress}</span>
                    </div>
                  </>
                ) : 'receiptNumber' in showReceipt ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Sender</span>
                      <span className="text-sm sm:text-base font-bold text-text">{showReceipt.senderName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Receiver</span>
                      <span className="text-sm sm:text-base font-bold text-text">{showReceipt.receiverName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Description</span>
                      <span className="text-sm sm:text-base font-bold text-text">{showReceipt.itemDescription}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Amount</span>
                      <span className="text-sm sm:text-base font-bold text-text">${showReceipt.amount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Weight</span>
                      <span className="text-sm sm:text-base font-bold text-text">{showReceipt.weight} KG</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Payment</span>
                      <span className="text-sm sm:text-base font-bold text-text">{showReceipt.paymentMethod}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Origin</span>
                      <span className="text-sm sm:text-base font-bold text-text">{showReceipt.origin}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Destination</span>
                      <span className="text-sm sm:text-base font-bold text-text">{showReceipt.destination}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Departure</span>
                      <span className="text-sm sm:text-base font-bold text-text">{format(new Date(showReceipt.departureTime), 'MMM dd, HH:mm')}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Arrival</span>
                      <span className="text-sm sm:text-base font-bold text-text">{format(new Date(showReceipt.arrivalTime), 'MMM dd, HH:mm')}</span>
                    </div>
                  </>
                )}
                {'packageImage' in showReceipt && showReceipt.packageImage && (
                  <div className="sm:col-span-2 flex flex-col gap-2 mt-4">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Package Photo</span>
                    <img 
                      src={showReceipt.packageImage} 
                      alt="Package" 
                      referrerPolicy="no-referrer"
                      className="w-full h-32 sm:h-48 object-cover rounded-xl border border-border" 
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <span className="font-serif text-xl sm:text-3xl text-primary/40 absolute -top-6 sm:-top-8 left-2 pointer-events-none select-none italic">
                    SwiftTrack Admin
                  </span>
                  <div className="w-24 sm:w-40 h-px bg-border"></div>
                </div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Authorized Signature</span>
              </div>
              <button 
                onClick={() => window.print()}
                className="btn-primary flex items-center gap-2 px-8"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>

            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div className="card-modern w-full max-w-md p-8 bg-white animate-fade-in text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Delete {confirmDeleteType === 'shipment' ? 'Shipment' : confirmDeleteType === 'flight' ? 'Flight' : 'Ticket'}?</h3>
            <p className="text-muted mb-8">This action cannot be undone. All data for this {confirmDeleteType} will be permanently removed.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setConfirmDeleteId(null);
                  setConfirmDeleteType(null);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmDeleteType === 'shipment') handleDeleteShipment(confirmDeleteId);
                  else if (confirmDeleteType === 'flight') handleDeleteFlight(confirmDeleteId);
                  else if (confirmDeleteType === 'ticket') handleDeleteTicket(confirmDeleteId);
                }}
                className="btn-primary bg-rose-600 hover:bg-rose-700 border-rose-600 flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
