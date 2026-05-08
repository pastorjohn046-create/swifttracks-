import { UserProfile } from './types';

const CACHE_PREFIX = 'swifttrack_cache_';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

function getUserId() {
  try {
    const me = localStorage.getItem(CACHE_PREFIX + 'me');
    if (!me) return 'anonymous';
    const parsed = JSON.parse(me);
    return parsed?.data?.uid || 'anonymous';
  } catch (e) {
    return 'anonymous';
  }
}

function setCache(key: string, data: any) {
  try {
    const userId = (key === 'me') ? '' : getUserId();
    const cacheKey = CACHE_PREFIX + (userId ? userId + '_' : '') + key;
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
}

function getCache(key: string) {
  try {
    const userId = (key === 'me') ? '' : getUserId();
    const cacheKey = CACHE_PREFIX + (userId ? userId + '_' : '') + key;
    const item = localStorage.getItem(cacheKey);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_DURATION) return null;
    return data;
  } catch (e) {
    return null;
  }
}

export const api = {
  auth: {
    async me() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.status === 401) {
          localStorage.removeItem(CACHE_PREFIX + 'me');
          return null;
        }
        if (!res.ok) return getCache('me');
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
      if (!res.ok) throw new Error('Signup failed');
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
      if (!res.ok) throw new Error('Login failed');
      const userData = await res.json();
      setCache('me', userData);
      return userData;
    },
    async logout() {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      localStorage.removeItem(CACHE_PREFIX + 'me');
    },
    async getGoogleAuthUrl() {
      const res = await fetch('/api/auth/google/url', { credentials: 'include' });
      return res.json();
    }
  },
  users: {
    async list() {
      try {
        const res = await fetch('/api/users', { credentials: 'include' });
        if (!res.ok) return getCache('users_list') || [];
        const data = await res.json();
        setCache('users_list', data);
        return data;
      } catch (e) {
        return getCache('users_list') || [];
      }
    },
    async get(id: string) {
      try {
        const res = await fetch(`/api/users/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('users_list');
          return cached?.find((u: any) => u.uid === id) || null;
        }
        return res.json();
      } catch (e) {
        const cached = getCache('users_list');
        return cached?.find((u: any) => u.uid === id) || null;
      }
    },
    async update(id: string, data: any) {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    }
  },
  shipments: {
    async list() {
      try {
        const res = await fetch('/api/shipments', { credentials: 'include' });
        if (!res.ok) return getCache('shipments') || [];
        const data = await res.json();
        setCache('shipments', data);
        return data;
      } catch (e) {
        return getCache('shipments') || [];
      }
    },
    async create(data: any) {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return res.json();
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return res.json();
    },
    async get(id: string) {
      try {
        const res = await fetch(`/api/shipments/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('shipments');
          return cached?.find((s: any) => s.id === id || s.trackingNumber === id) || null;
        }
        return res.json();
      } catch (e) {
        const cached = getCache('shipments');
        return cached?.find((s: any) => s.id === id || s.trackingNumber === id) || null;
      }
    },
    async delete(id: string) {
      await fetch(`/api/shipments/${id}`, { method: 'DELETE', credentials: 'include' });
    },
    async claim(id: string) {
      const res = await fetch(`/api/shipments/${id}/claim`, { method: 'POST', credentials: 'include' });
      return res.json();
    },
    async getUpdates(id: string) {
      try {
        const res = await fetch(`/api/shipments/${id}/updates`, { credentials: 'include' });
        if (!res.ok) return getCache(`shipment_updates_${id}`) || [];
        const data = await res.json();
        setCache(`shipment_updates_${id}`, data);
        return data;
      } catch (e) {
        return getCache(`shipment_updates_${id}`) || [];
      }
    },
    async addUpdate(id: string, data: any) {
      const res = await fetch(`/api/shipments/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return res.json();
    }
  },
  flights: {
    async list() {
      try {
        const res = await fetch('/api/flights', { credentials: 'include' });
        if (!res.ok) return getCache('flights') || [];
        const data = await res.json();
        setCache('flights', data);
        return data;
      } catch (e) {
        return getCache('flights') || [];
      }
    },
    async create(data: any) {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return res.json();
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/flights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return res.json();
    },
    async get(id: string) {
      try {
        const res = await fetch(`/api/flights/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const cached = getCache('flights');
          return cached?.find((f: any) => f.id === id || f.flightNumber === id) || null;
        }
        return res.json();
      } catch (e) {
        const cached = getCache('flights');
        return cached?.find((f: any) => f.id === id || f.flightNumber === id) || null;
      }
    },
    async delete(id: string) {
      await fetch(`/api/flights/${id}`, { method: 'DELETE', credentials: 'include' });
    },
    async claim(id: string) {
      const res = await fetch(`/api/flights/${id}/claim`, { method: 'POST', credentials: 'include' });
      return res.json();
    },
    async getUpdates(id: string) {
      try {
        const res = await fetch(`/api/flights/${id}/updates`, { credentials: 'include' });
        if (!res.ok) return getCache(`flight_updates_${id}`) || [];
        const data = await res.json();
        setCache(`flight_updates_${id}`, data);
        return data;
      } catch (e) {
        return getCache(`flight_updates_${id}`) || [];
      }
    },
    async addUpdate(id: string, data: any) {
      const res = await fetch(`/api/flights/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return res.json();
    }
  },
  supportTickets: {
    async list() {
      try {
        const res = await fetch('/api/supportTickets', { credentials: 'include' });
        if (!res.ok) return getCache('support_tickets') || [];
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
      return res.json();
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/supportTickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return res.json();
    },
    async delete(id: string) {
      await fetch(`/api/supportTickets/${id}`, { method: 'DELETE', credentials: 'include' });
    }
  },
  reviews: {
    async list() {
      try {
        const res = await fetch('/api/reviews', { credentials: 'include' });
        if (!res.ok) return getCache('reviews') || [];
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
      return res.json();
    }
  }
};
