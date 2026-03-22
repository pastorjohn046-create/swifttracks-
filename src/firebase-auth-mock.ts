import { auth } from './firebase';

export const signInWithEmailAndPassword = (a: any, email: string, pass: string) => auth.signInWithEmailAndPassword(email, pass);
export const createUserWithEmailAndPassword = (a: any, email: string, pass: string) => auth.createUserWithEmailAndPassword(email, pass);
export const signOut = (a: any) => auth.signOut();
export const onAuthStateChanged = (a: any, callback: (user: any) => void) => auth.onAuthStateChanged(callback);
export const sendPasswordResetEmail = async (a: any, email: string) => {
  console.log('Password reset requested for:', email);
  // Mock reset
  return Promise.resolve();
};
export const GoogleAuthProvider = class {
  static credential() { return {}; }
};

export const signInWithPopup = async (a: any, provider: any) => {
  try {
    const res = await fetch('/api/auth/google/url');
    if (!res.ok) throw new Error('Failed to get Google Auth URL');
    const { url } = await res.json();

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      'google-login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    return new Promise((resolve, reject) => {
      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          await auth.checkAuth();
          resolve({ user: auth.currentUser });
        }
      };
      window.addEventListener('message', handleMessage);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          reject(new Error('Login cancelled'));
        }
      }, 1000);
    });
  } catch (err: any) {
    throw err;
  }
};
