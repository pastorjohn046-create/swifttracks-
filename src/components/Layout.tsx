import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { UserProfile } from '../types';
import { Globe, LogOut, User as UserIcon, Shield, Search, Info, Package, Plane, Truck, Bus, Star, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  user: any | null;
  profile: UserProfile | null;
}

export default function Layout({ children, user, profile }: LayoutProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await api.auth.logout();
    localStorage.removeItem('admin_session');
    window.location.href = '/'; // Force reload to clear state
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg text-text overflow-x-hidden relative">
      {/* Global Background Animations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0 opacity-20">
        <motion.div
          initial={{ x: '-20vw', y: '20vh', opacity: 0 }}
          animate={{ x: '120vw', y: '25vh', opacity: [0, 0.3, 0.3, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute text-primary/10"
        >
          <Plane className="w-24 h-24 rotate-12" />
        </motion.div>
        <motion.div
          initial={{ x: '120vw', y: '60vh', opacity: 0 }}
          animate={{ x: '-20vw', y: '65vh', opacity: [0, 0.2, 0.2, 0] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear", delay: 15 }}
          className="absolute text-secondary/10"
        >
          <Bus className="w-20 h-20" />
        </motion.div>
        <motion.div
          initial={{ x: '-20vw', y: '85vh', opacity: 0 }}
          animate={{ x: '120vw', y: '80vh', opacity: [0, 0.25, 0.25, 0] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear", delay: 30 }}
          className="absolute text-accent/10"
        >
          <Truck className="w-16 h-16" />
        </motion.div>
      </div>

      <header className="border-b border-border sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <Logo size={32} className="text-primary group-hover:rotate-90 transition-transform duration-700" />
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter text-primary leading-none heading-display">SWIFTTRACK.</span>
              <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] ml-0.5 hidden sm:block">Logistics Excellence</span>
            </div>
          </Link>

          <nav className="flex items-center gap-12">
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">System_Online</span>
              </div>
              <Link to="/about" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">About</Link>
              <Link to="/reviews" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Reviews</Link>
              <Link to="/track" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Track</Link>
            </div>
            
            <div className="h-6 w-[1px] bg-border hidden lg:block"></div>

            <div className="hidden lg:flex items-center gap-6">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Dashboard</Link>
                  {(profile?.role === 'admin' || localStorage.getItem('admin_session') === 'true') && (
                    <Link to="/admin" className="text-xs font-bold text-accent hover:opacity-80 transition-opacity uppercase tracking-widest">Admin</Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="btn-primary !py-2 !px-6 !text-[10px]"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-primary !py-2 !px-8 !text-[10px]">
                  GET STARTED
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-border shadow-2xl p-8 z-40"
            >
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">System_Online</span>
                </div>
                
                <div className="flex flex-col gap-6">
                  <Link 
                    to="/about" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-black heading-display text-primary uppercase tracking-tight"
                  >
                    About Us
                  </Link>
                  <Link 
                    to="/reviews" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-black heading-display text-primary uppercase tracking-tight"
                  >
                    Client Reviews
                  </Link>
                  <Link 
                    to="/track" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-black heading-display text-primary uppercase tracking-tight"
                  >
                    Track Shipment
                  </Link>
                </div>

                <div className="h-[1px] bg-border w-full"></div>

                <div className="flex flex-col gap-4">
                  {user ? (
                    <>
                      <Link 
                        to="/dashboard" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-black heading-display text-primary uppercase tracking-tight"
                      >
                        Dashboard
                      </Link>
                      {(profile?.role === 'admin' || localStorage.getItem('admin_session') === 'true') && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-lg font-black heading-display text-accent uppercase tracking-tight"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="btn-primary w-full"
                      >
                        LOGOUT
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn-primary w-full text-center"
                    >
                      GET STARTED
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-border px-6 py-3 flex items-center justify-around z-50">
        <Link to="/" className="flex flex-col items-center gap-1 text-primary">
          <Globe className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
        </Link>
        <Link to="/track" className="flex flex-col items-center gap-1 text-muted hover:text-primary transition-colors">
          <Search className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Track</span>
        </Link>
        {user ? (
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-muted hover:text-primary transition-colors">
            <Package className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Shipments</span>
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center gap-1 text-muted hover:text-primary transition-colors">
            <UserIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Login</span>
          </Link>
        )}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-muted hover:text-primary transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">More</span>
        </button>
      </nav>

      <footer className="bg-white border-t border-border py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-6 flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <Logo size={28} className="text-primary" />
                <span className="font-black text-2xl tracking-tighter heading-display">SWIFTTRACK.</span>
              </div>
              <p className="text-muted text-lg max-w-md font-medium leading-relaxed">
                SwiftTrack is a global leader in high-value logistics, providing secure, transparent, and precise consignment systems for the modern world.
              </p>
            </div>
            <div className="md:col-span-3 flex flex-col gap-8">
              <span className="section-label">Navigation</span>
              <nav className="flex flex-col gap-4 text-sm font-bold text-muted uppercase tracking-widest">
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
                <Link to="/track" className="hover:text-primary transition-colors">Track Shipment</Link>
                <Link to="/reviews" className="hover:text-primary transition-colors">Client Reviews</Link>
              </nav>
            </div>
            <div className="md:col-span-3 flex flex-col gap-8">
              <span className="section-label">Legal</span>
              <nav className="flex flex-col gap-4 text-sm font-bold text-muted uppercase tracking-widest">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
              </nav>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-border gap-8">
            <p className="text-xs font-mono text-muted uppercase tracking-widest">
              &copy; {new Date().getFullYear()} SwiftTrack Consignment Systems.
            </p>
            <div className="flex gap-12">
              <span className="text-xs font-mono text-muted uppercase tracking-widest">ISO 9001:2015</span>
              <span className="text-xs font-mono text-muted uppercase tracking-widest">TAPA CERTIFIED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
