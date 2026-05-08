import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home({ user }: { user?: any }) {
  const [trackingId, setTrackingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleTrack = (e: FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setIsSubmitting(true);
    navigate(`/track?id=${trackingId.trim().toUpperCase()}`);
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1 style={{ fontSize: '48px' }}>SECURE SYSTEMS.</h1>
      <p style={{ color: '#666' }}>
        SwiftTrack provides professional-grade tracking and management for high-value consignments.
      </p>
      <form onSubmit={handleTrack} style={{ marginTop: '20px' }}>
        <input 
          type="text" 
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Tracking ID"
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: 'black', color: 'white' }}>
          {isSubmitting ? '...' : 'Track'}
        </button>
      </form>
    </div>
  );
}
