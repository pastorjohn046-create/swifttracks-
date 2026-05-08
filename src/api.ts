import { UserProfile } from './types';

export const api = {
  auth: {
    async me() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.status === 401) return null;
        if (!res.ok) return null;
        return res.json();
      } catch (e) {
        return null;
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
      return res.json();
    },
    async login(data: any) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    async logout() {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    },
    async getGoogleAuthUrl() {
      const res = await fetch('/api/auth/google/url', { credentials: 'include' });
      return res.json();
    }
  },
  users: {
    async list() {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    async get(id: string) {
      const res = await fetch(`/api/users/${id}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
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
      const res = await fetch('/api/shipments', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
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
      const res = await fetch(`/api/shipments/${id}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    async delete(id: string) {
      await fetch(`/api/shipments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    },
    async claim(id: string) {
      const res = await fetch(`/api/shipments/${id}/claim`, {
        method: 'POST',
        credentials: 'include'
      });
      return res.json();
    },
    async getUpdates(id: string) {
      const res = await fetch(`/api/shipments/${id}/updates`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
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
      const res = await fetch('/api/flights', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
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
      const res = await fetch(`/api/flights/${id}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    async delete(id: string) {
      await fetch(`/api/flights/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    },
    async claim(id: string) {
      const res = await fetch(`/api/flights/${id}/claim`, {
        method: 'POST',
        credentials: 'include'
      });
      return res.json();
    },
    async getUpdates(id: string) {
      const res = await fetch(`/api/flights/${id}/updates`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
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
      const res = await fetch('/api/supportTickets', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
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
      await fetch(`/api/supportTickets/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    }
  },
  reviews: {
    async list() {
      const res = await fetch('/api/reviews', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
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
