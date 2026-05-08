import { UserProfile } from './types';

const CACHE_PREFIX = 'swifttrack_cache_';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

function getUserId() {
  try {
    const me = localStorage.getItem(CACHE_PREFIX + 'me');
    if (!me) return 'anonymous';
    const { data } = JSON.parse(me);
    return data?.uid || 'anonymous';
  } catch (e) {
    return 'anonymous';
  }
}

function setCache(key: string, data: any) {
  try {
    const userId = (key === 'me') ? '' : getUserId();
    const cacheKey = CACHE_PREFIX + (userId ? userId + '_' : '') + key;
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (e) {
    console.error('Failed to set cache:', e);
  }
}

function getCache(key: string) {
  try {
    const userId = (key === 'me') ? '' : getUserId();
    const cacheKey = CACHE_PREFIX + (userId ? userId + '_' : '') + key;
    const item = localStorage.getItem(cacheKey);
    if (!item) return null;
    
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

export const api = {
  auth: {
    async me() {
      console.log('api.auth.me called');
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.status === 401) {
          localStorage.removeItem(CACHE_PREFIX + 'me');
          return null;
        }
        if (!res.ok) {
          return getCache('me');
        }
        const data = await res.json();
        setCache('me', data);
        return data;
      } catch (e) {
        return getCache('me');
      }
    },
    async signup(data: any) {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const err = await res.json();
          throw new Error(err.error || 'Signup failed');
        } else {
          const text = await res.text();
          console.error('Non-JSON error response during signup:', text);
          throw new Error(`Server error (${res.status}): ${res.statusText}`);
        }
      }
      const userData = await res.json();
      setCache('me', userData);
      return userData;
    },
    async login(data: any) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const err = await res.json();
          throw new Error(err.error || 'Login failed');
        } else {
          const text = await res.text();
          console.error('Non-JSON error response during login:', text);
          throw new Error(`Server error (${res.status}): ${res.statusText}`);
        }
      }
      const userData = await res.json();
      setCache('me', userData);
      return userData;
    },
    async logout() {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      // Clear current session 'me' cache, but keep data caches for 30 days
      localStorage.removeItem(CACHE_PREFIX + 'me');
    },
    async getGoogleAuthUrl() {
      const res = await fetch('/api/auth/google/url', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to get Google Auth URL');
      return res.json();
    }
  },
  users: {
    async list() {
      try {
        const res = await fetch('/api/users', { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('users_list');
          return cached || [];
        }
        const data = await res.json();
        setCache('users_list', data);
        return data;
      } catch (e) {
        const cached = getCache('users_list');
        return cached || [];
      }
    },
    async get(id: string) {
      try {
        const res = await fetch(`/api/users/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('users_list');
          if (cached) {
            return cached.find((u: any) => u.uid === id) || null;
          }
          return null;
        }
        return res.json();
      } catch (e) {
        const cached = getCache('users_list');
        if (cached) {
          return cached.find((u: any) => u.uid === id) || null;
        }
        return null;
      }
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update user');
      
      // Update local cache list if it exists
      const cachedList = getCache('users_list');
      if (cachedList) {
        const newList = cachedList.map((u: any) => u.uid === id ? { ...u, ...data } : u);
        setCache('users_list', newList);
      }
      
      // Also update 'me' cache if this is the current user
      const me = getCache('me');
      if (me && me.uid === id) {
        setCache('me', { ...me, ...data });
      }
    }
  },
  shipments: {
    async list() {
      try {
        const res = await fetch('/api/shipments', { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('shipments');
          return cached || [];
        }
        const data = await res.json();
        setCache('shipments', data);
        return data;
      } catch (e) {
        const cached = getCache('shipments');
        return cached || [];
      }
    },
    async create(data: any) {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to create shipment');
      const newShipment = await res.json();
      
      // Update local cache
      const cached = getCache('shipments');
      if (cached) {
        setCache('shipments', [...cached, newShipment]);
      } else {
        setCache('shipments', [newShipment]);
      }
      
      return newShipment;
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update shipment');
      const updatedShipment = await res.json();
      
      // Update local cache
      const cached = getCache('shipments');
      if (cached) {
        setCache('shipments', cached.map((s: any) => s.id === id || s.trackingNumber === id ? { ...s, ...updatedShipment } : s));
      }
      
      return updatedShipment;
    },
    async get(id: string) {
      try {
        const res = await fetch(`/api/shipments/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('shipments');
          if (cached) {
            return cached.find((s: any) => s.id === id || s.trackingNumber === id) || null;
          }
          return null;
        }
        const data = await res.json();
        return data;
      } catch (e) {
        const cached = getCache('shipments');
        if (cached) {
          return cached.find((s: any) => s.id === id || s.trackingNumber === id) || null;
        }
        return null;
      }
    },
    async delete(id: string) {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete shipment');
      
      // Update local cache
      const cached = getCache('shipments');
      if (cached) {
        setCache('shipments', cached.filter((s: any) => s.id !== id));
      }
    },
    async claim(id: string) {
      const res = await fetch(`/api/shipments/${id}/claim`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to claim shipment');
      }
      const data = await res.json();
      
      // Update local cache
      const cached = getCache('shipments');
      if (cached) {
        setCache('shipments', cached.map((s: any) => s.id === id ? data : s));
      }
      
      return data;
    },
    async getUpdates(id: string) {
      try {
        const res = await fetch(`/api/shipments/${id}/updates`, { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('shipments');
          if (cached) {
            const shipment = cached.find((s: any) => s.id === id || s.trackingNumber === id);
            return shipment?.updates || [];
          }
          return [];
        }
        return res.json();
      } catch (e) {
        const cached = getCache('shipments');
        if (cached) {
          const shipment = cached.find((s: any) => s.id === id || s.trackingNumber === id);
          return shipment?.updates || [];
        }
        return [];
      }
    },
    async addUpdate(id: string, data: any) {
      const res = await fetch(`/api/shipments/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to add update');
      const newUpdate = await res.json();
      
      // Update local cache for the shipment list if it has updates embedded
      const cached = getCache('shipments');
      if (cached) {
        setCache('shipments', cached.map((s: any) => {
          if (s.id === id || s.trackingNumber === id) {
            const updates = s.updates || [];
            return { ...s, updates: [...updates, newUpdate], status: data.status || s.status };
          }
          return s;
        }));
      }
      
      return newUpdate;
    }
  },
  flights: {
    async list() {
      try {
        const res = await fetch('/api/flights', { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('flights');
          return cached || [];
        }
        const data = await res.json();
        setCache('flights', data);
        return data;
      } catch (e) {
        const cached = getCache('flights');
        return cached || [];
      }
    },
    async create(data: any) {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to create flight');
      const newFlight = await res.json();
      
      // Update local cache
      const cached = getCache('flights');
      if (cached) {
        setCache('flights', [...cached, newFlight]);
      } else {
        setCache('flights', [newFlight]);
      }
      
      return newFlight;
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/flights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update flight');
      const updatedFlight = await res.json();
      
      // Update local cache
      const cached = getCache('flights');
      if (cached) {
        setCache('flights', cached.map((f: any) => f.id === id || f.flightNumber === id ? { ...f, ...updatedFlight } : f));
      }
      
      return updatedFlight;
    },
    async get(id: string) {
      try {
        const res = await fetch(`/api/flights/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('flights');
          if (cached) {
            return cached.find((f: any) => f.id === id || f.flightNumber === id) || null;
          }
          return null;
        }
        return res.json();
      } catch (e) {
        const cached = getCache('flights');
        if (cached) {
          return cached.find((f: any) => f.id === id || f.flightNumber === id) || null;
        }
        return null;
      }
    },
    async delete(id: string) {
      const res = await fetch(`/api/flights/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete flight');
      
      // Update local cache
      const cached = getCache('flights');
      if (cached) {
        setCache('flights', cached.filter((f: any) => f.id !== id));
      }
    },
    async claim(id: string) {
      const res = await fetch(`/api/flights/${id}/claim`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to claim flight');
      }
      const data = await res.json();
      
      // Update local cache
      const cached = getCache('flights');
      if (cached) {
        setCache('flights', cached.map((f: any) => f.id === id || f.flightNumber === id ? data : f));
      }
      
      return data;
    },
    async getUpdates(id: string) {
      try {
        const res = await fetch(`/api/flights/${id}/updates`, { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('flights');
          if (cached) {
            const flight = cached.find((f: any) => f.id === id || f.flightNumber === id);
            return flight?.updates || [];
          }
          return [];
        }
        return res.json();
      } catch (e) {
        const cached = getCache('flights');
        if (cached) {
          const flight = cached.find((f: any) => f.id === id || f.flightNumber === id);
          return flight?.updates || [];
        }
        return [];
      }
    },
    async addUpdate(id: string, data: any) {
      const res = await fetch(`/api/flights/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to add update');
      const newUpdate = await res.json();
      
      // Update local cache
      const cached = getCache('flights');
      if (cached) {
        setCache('flights', cached.map((f: any) => {
          if (f.id === id || f.flightNumber === id) {
            const updates = f.updates || [];
            return { ...f, updates: [...updates, newUpdate], status: data.status || f.status };
          }
          return f;
        }));
      }
      
      return newUpdate;
    }
  },
  supportTickets: {
    async list() {
      try {
        const res = await fetch('/api/supportTickets', { credentials: 'include' });
        if (!res.ok) {
          return getCache('support_tickets') || [];
        }
        const data = await res.json();
        setCache('support_tickets', data);
        return data;
      } catch (e) {
        return getCache('support_tickets') || [];
      }
    },
    async create(data: any) {
      const res = await fetch('/api/supportTickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to create support ticket');
      const newTicket = await res.json();
      
      const cached = getCache('support_tickets');
      if (cached) setCache('support_tickets', [...cached, newTicket]);
      
      return newTicket;
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/supportTickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update support ticket');
      const updated = await res.json();
      
      const cached = getCache('support_tickets');
      if (cached) {
        setCache('support_tickets', cached.map((t: any) => t.id === id ? { ...t, ...updated } : t));
      }
      
      return updated;
    },
    async delete(id: string) {
      const res = await fetch(`/api/supportTickets/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete support ticket');
      
      const cached = getCache('support_tickets');
      if (cached) {
        setCache('support_tickets', cached.filter((t: any) => t.id !== id));
      }
    }
  },
  reviews: {
    async list() {
      try {
        const res = await fetch('/api/reviews', { credentials: 'include' });
        if (!res.ok) {
          return getCache('reviews') || [];
        }
        const data = await res.json();
        setCache('reviews', data);
        return data;
      } catch (e) {
        return getCache('reviews') || [];
      }
    },
    async create(data: any) {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to create review');
      const newReview = await res.json();
      
      const cached = getCache('reviews');
      if (cached) setCache('reviews', [...cached, newReview]);
      
      return newReview;
    }
  }
};
