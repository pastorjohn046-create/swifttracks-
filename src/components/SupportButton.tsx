import React, { useState } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addDoc, collection, db } from '../firebase';

export default function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(db, 'tickets'), {
        ...formData,
        status: 'open',
        createdAt: new Date().toISOString()
      });
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => {
        setSent(false);
        setIsOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[10000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 sm:bottom-24 right-0 w-[calc(100vw-3rem)] sm:w-[380px] card-modern bg-white p-5 sm:p-8 shadow-2xl border border-border"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h3 className="text-lg font-bold tracking-tight">Support Center</h3>
                <p className="text-xs text-muted font-medium">We're here to help you</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            {sent ? (
              <div className="py-12 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Send className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-text">Message Sent!</h4>
                  <p className="text-xs text-muted">We'll get back to you shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Name</label>
                    <input 
                      type="text" required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="input-modern py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Email</label>
                    <input 
                      type="email" required
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="input-modern py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Subject</label>
                  <input 
                    type="text" required
                    value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="input-modern py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Message</label>
                  <textarea 
                    required
                    value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                    className="input-modern py-2 text-sm min-h-[100px] resize-none"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={sending}
                  className="btn-primary w-full py-3 mt-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-text text-white rotate-90' : 'bg-primary text-white hover:scale-110 active:scale-95'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
