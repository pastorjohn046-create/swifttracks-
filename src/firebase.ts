// Mock Firebase SDK using custom Express API
import { UserProfile } from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('API Error: ', error, operationType, path);
  throw error;
}

// Mock Auth
class MockAuth {
  currentUser: any = null;
  private listeners: ((user: any) => void)[] = [];

  constructor() {
    this.checkAuth();
  }

  async checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        this.currentUser = await res.json();
      } else {
        this.currentUser = null;
      }
    } catch (err) {
      this.currentUser = null;
    }
    this.notify();
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentUser));
  }

  async signInWithEmailAndPassword(email: string, pass: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    this.currentUser = await res.json();
    this.notify();
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email: string, pass: string) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Signup failed');
    }
    this.currentUser = await res.json();
    this.notify();
    return { user: this.currentUser };
  }

  async signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    this.currentUser = null;
    this.notify();
  }
}

export const auth = new MockAuth();

// Mock Firestore
export const db = {};

export function collection(db: any, ...pathSegments: string[]) {
  return { path: pathSegments.join('/') };
}

export function doc(db: any, ...pathSegments: string[]) {
  return { path: pathSegments.join('/'), id: pathSegments[pathSegments.length - 1] };
}

export function query(col: any, ...constraints: any[]) {
  return col;
}

export function orderBy(field: string, direction: string = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function where(field: string, op: string, value: any) {
  return { type: 'where', field, op, value };
}

export async function getDoc(docRef: any) {
  const [col, id] = docRef.path.split('/');
  const res = await fetch(`/api/${col}/${id}`);
  if (!res.ok) return { exists: () => false };
  const data = await res.json();
  return {
    exists: () => true,
    data: () => data,
    id
  };
}

export async function getDocs(query: any) {
  const res = await fetch(`/api/${query.path}`);
  if (!res.ok) return { docs: [], empty: true };
  const data = await res.json();
  return {
    docs: data.map((d: any) => ({
      id: d.id,
      data: () => d,
      exists: () => true
    })),
    empty: data.length === 0
  };
}

export async function setDoc(docRef: any, data: any) {
  const [col, id] = docRef.path.split('/');
  const res = await fetch(`/api/${col}/${id || ''}`, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save document');
}

export async function addDoc(colRef: any, data: any) {
  const res = await fetch(`/api/${colRef.path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add document');
  return { id: (await res.json()).id };
}

export async function updateDoc(docRef: any, data: any) {
  const [col, id] = docRef.path.split('/');
  const res = await fetch(`/api/${col}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update document');
}

export async function deleteDoc(docRef: any) {
  const [col, id] = docRef.path.split('/');
  const res = await fetch(`/api/${col}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete document');
}

export function onSnapshot(ref: any, callback: (snapshot: any) => void, errorCallback?: (err: any) => void) {
  // Simple polling for mock real-time
  const poll = async () => {
    try {
      if (ref.path.includes('/')) {
        const snap = await getDoc(ref);
        callback(snap);
      } else {
        const snap = await getDocs(ref);
        callback(snap);
      }
    } catch (err) {
      if (errorCallback) errorCallback(err);
    }
  };

  poll();
  const interval = setInterval(poll, 5000);
  return () => clearInterval(interval);
}

export const serverTimestamp = () => new Date().toISOString();

// Re-export auth functions to match Firebase SDK
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from './firebase-auth-mock';
