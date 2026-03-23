import { UserProfile } from './types';

export const api = {
  auth: {
    async me() {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      return res.json();
    },
    async signup(data: any) {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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
      return res.json();
    },
    async login(data: any) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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
      return res.json();
    },
    async logout() {
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    async getGoogleAuthUrl() {
      const res = await fetch('/api/auth/google/url');
      if (!res.ok) throw new Error('Failed to get Google Auth URL');
      return res.json();
    }
  },
  users: {
    async list() {
      const res = await fetch('/api/users');
      if (!res.ok) return [];
      return res.json();
    },
    async get(id: string) {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update user');
    }
  },
  shipments: {
    async list() {
      const res = await fetch('/api/shipments');
      if (!res.ok) return [];
      return res.json();
    },
    async create(data: any) {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create shipment');
      return res.json();
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update shipment');
      return res.json();
    },
    async get(id: string) {
      const res = await fetch(`/api/shipments/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    async delete(id: string) {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete shipment');
    },
    async getUpdates(id: string) {
      const res = await fetch(`/api/shipments/${id}/updates`);
      if (!res.ok) return [];
      return res.json();
    },
    async addUpdate(id: string, data: any) {
      const res = await fetch(`/api/shipments/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add update');
      return res.json();
    }
  },
  flights: {
    async list() {
      const res = await fetch('/api/flights');
      if (!res.ok) return [];
      return res.json();
    },
    async create(data: any) {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create flight');
      return res.json();
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/flights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update flight');
      return res.json();
    },
    async get(id: string) {
      const res = await fetch(`/api/flights/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    async delete(id: string) {
      const res = await fetch(`/api/flights/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete flight');
    },
    async getUpdates(id: string) {
      const res = await fetch(`/api/flights/${id}/updates`);
      if (!res.ok) return [];
      return res.json();
    },
    async addUpdate(id: string, data: any) {
      const res = await fetch(`/api/flights/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add update');
      return res.json();
    }
  },
  supportTickets: {
    async list() {
      const res = await fetch('/api/supportTickets');
      if (!res.ok) return [];
      return res.json();
    },
    async create(data: any) {
      const res = await fetch('/api/supportTickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create support ticket');
      return res.json();
    },
    async update(id: string, data: any) {
      const res = await fetch(`/api/supportTickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update support ticket');
      return res.json();
    },
    async delete(id: string) {
      const res = await fetch(`/api/supportTickets/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete support ticket');
    }
  },
  reviews: {
    async list() {
      const res = await fetch('/api/reviews');
      if (!res.ok) return [];
      return res.json();
    },
    async create(data: any) {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create review');
      return res.json();
    }
  }
};
