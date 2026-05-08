import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import Layout from './components/Layout';
import Home from './components/Home';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <Router>
      <Layout user={user} profile={user}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
        </Routes>
      </Layout>
    </Router>
  );
}
