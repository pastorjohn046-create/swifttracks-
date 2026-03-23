import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import axios from 'axios';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'swifttrack-secret-2026';

// Initial DB structure
const initialDb = {
  users: [],
  shipments: [],
  flights: [],
  supportTickets: [],
  reviews: []
};

// Load or initialize DB
function getDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { uid: string };
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    authenticate(req, res, () => {
      const db = getDb();
      const user = db.users.find((u: any) => u.uid === req.user.uid);
      if (user && user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ error: 'Admin access required' });
      }
    });
  };

  const generateCustomerID = () => {
    return 'CUST-' + Math.floor(100000 + Math.random() * 900000);
  };

  // API Routes
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name, role } = req.body;
    const db = getDb();
    
    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      uid: Math.random().toString(36).substring(2, 15),
      email,
      password: hashedPassword,
      name,
      role: (email === 'pastorjohn046@gmail.com' || email === 'admin@example.com') ? 'admin' : 'user',
      customerID: generateCustomerID(),
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb(db);

    const token = jwt.sign({ uid: newUser.uid }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.json(userWithoutPassword);
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.users.find((u: any) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { uid: string };
      const db = getDb();
      const user = db.users.find((u: any) => u.uid === decoded.uid);
      if (!user) return res.status(401).json({ error: 'User not found' });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Google OAuth Routes
  app.get('/api/auth/google/url', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: 'GOOGLE_CLIENT_ID is not configured' });
    }

    const redirectUri = `${process.env.APP_URL || `http://localhost:${PORT}`}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing code');

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).send('Google OAuth is not fully configured');
    }

    try {
      const redirectUri = `${process.env.APP_URL || `http://localhost:${PORT}`}/api/auth/google/callback`;

      // Exchange code for tokens
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      const { access_token } = tokenRes.data;

      // Get user info
      const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const googleUser = userRes.data;
      const db = getDb();
      
      let user = db.users.find((u: any) => u.email === googleUser.email);
      
      if (!user) {
        user = {
          uid: Math.random().toString(36).substring(2, 15),
          email: googleUser.email,
          name: googleUser.name,
          role: (googleUser.email === 'pastorjohn046@gmail.com' || googleUser.email === 'admin@example.com') ? 'admin' : 'user',
          customerID: generateCustomerID(),
          createdAt: new Date().toISOString(),
          photoURL: googleUser.picture
        };
        db.users.push(user);
        saveDb(db);
      }

      const token = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('Google OAuth error:', err.response?.data || err.message);
      res.status(500).send('Authentication failed');
    }
  });

  // Users API
  app.get('/api/users', isAdmin, (req, res) => {
    const db = getDb();
    const usersWithoutPasswords = db.users.map((u: any) => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    res.json(usersWithoutPasswords);
  });

  app.get('/api/users/:id', (req, res) => {
    const db = getDb();
    const user = db.users.find((u: any) => u.uid === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.put('/api/users/:id', (req, res) => {
    const db = getDb();
    const index = db.users.findIndex((u: any) => u.uid === req.params.id);
    if (index === -1) {
      // If user doesn't exist in users array (e.g. created via signup but we need to update profile)
      // Actually signup already adds it. But let's be safe.
      db.users.push(req.body);
    } else {
      db.users[index] = { ...db.users[index], ...req.body };
    }
    saveDb(db);
    res.json({ success: true });
  });

  // Shipments API
  app.get('/api/shipments', (req, res) => {
    const db = getDb();
    res.json(db.shipments);
  });

  app.post('/api/shipments', isAdmin, (req, res) => {
    const db = getDb();
    const newShipment = { ...req.body, id: Math.random().toString(36).substring(2, 15), createdAt: new Date().toISOString() };
    db.shipments.push(newShipment);
    saveDb(db);
    res.json(newShipment);
  });

  app.put('/api/shipments/:id', isAdmin, (req, res) => {
    const db = getDb();
    const index = db.shipments.findIndex((s: any) => s.id === req.params.id);
    if (index === -1) {
      db.shipments.push({ ...req.body, id: req.params.id });
    } else {
      db.shipments[index] = { ...db.shipments[index], ...req.body };
    }
    saveDb(db);
    res.json(db.shipments[index === -1 ? db.shipments.length - 1 : index]);
  });

  app.delete('/api/shipments/:id', isAdmin, (req, res) => {
    const db = getDb();
    db.shipments = db.shipments.filter((s: any) => s.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  app.get('/api/shipments/:id/updates', (req, res) => {
    const db = getDb();
    const shipment = db.shipments.find((s: any) => s.id === req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json(shipment.updates || []);
  });

  app.post('/api/shipments/:id/updates', (req, res) => {
    const db = getDb();
    const index = db.shipments.findIndex((s: any) => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Shipment not found' });
    
    if (!db.shipments[index].updates) db.shipments[index].updates = [];
    const newUpdate = { ...req.body, id: Math.random().toString(36).substring(2, 15) };
    db.shipments[index].updates.push(newUpdate);
    
    // Also update the main shipment status
    if (req.body.status) {
      db.shipments[index].status = req.body.status;
    }
    
    saveDb(db);
    res.json(newUpdate);
  });

  // Flights API
  app.get('/api/flights', (req, res) => {
    const db = getDb();
    res.json(db.flights);
  });

  app.post('/api/flights', isAdmin, (req, res) => {
    const db = getDb();
    const newFlight = { ...req.body, id: Math.random().toString(36).substring(2, 15) };
    db.flights.push(newFlight);
    saveDb(db);
    res.json(newFlight);
  });

  app.put('/api/flights/:id', isAdmin, (req, res) => {
    const db = getDb();
    const index = db.flights.findIndex((f: any) => f.id === req.params.id);
    if (index === -1) {
      db.flights.push({ ...req.body, id: req.params.id });
    } else {
      db.flights[index] = { ...db.flights[index], ...req.body };
    }
    saveDb(db);
    res.json(db.flights[index === -1 ? db.flights.length - 1 : index]);
  });

  app.delete('/api/flights/:id', isAdmin, (req, res) => {
    const db = getDb();
    db.flights = db.flights.filter((f: any) => f.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  app.get('/api/flights/:id/updates', (req, res) => {
    const db = getDb();
    const flight = db.flights.find((f: any) => f.id === req.params.id);
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    res.json(flight.updates || []);
  });

  app.post('/api/flights/:id/updates', isAdmin, (req, res) => {
    const db = getDb();
    const index = db.flights.findIndex((f: any) => f.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Flight not found' });
    
    if (!db.flights[index].updates) db.flights[index].updates = [];
    const newUpdate = { ...req.body, id: Math.random().toString(36).substring(2, 15) };
    db.flights[index].updates.push(newUpdate);
    saveDb(db);
    res.json(newUpdate);
  });

  // Support Tickets API
  app.get('/api/supportTickets', (req, res) => {
    const db = getDb();
    res.json(db.supportTickets);
  });

  app.post('/api/supportTickets', (req, res) => {
    const db = getDb();
    const newTicket = { ...req.body, id: Math.random().toString(36).substring(2, 15), createdAt: new Date().toISOString() };
    db.supportTickets.push(newTicket);
    saveDb(db);
    res.json(newTicket);
  });

  app.put('/api/supportTickets/:id', (req, res) => {
    const db = getDb();
    const index = db.supportTickets.findIndex((t: any) => t.id === req.params.id);
    if (index === -1) {
      db.supportTickets.push({ ...req.body, id: req.params.id });
    } else {
      db.supportTickets[index] = { ...db.supportTickets[index], ...req.body };
    }
    saveDb(db);
    res.json(db.supportTickets[index === -1 ? db.supportTickets.length - 1 : index]);
  });

  app.delete('/api/supportTickets/:id', isAdmin, (req, res) => {
    const db = getDb();
    db.supportTickets = db.supportTickets.filter((t: any) => t.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Reviews API
  app.get('/api/reviews', (req, res) => {
    const db = getDb();
    res.json(db.reviews);
  });

  app.post('/api/reviews', (req, res) => {
    const db = getDb();
    const newReview = { ...req.body, id: Math.random().toString(36).substring(2, 15), createdAt: new Date().toISOString() };
    db.reviews.push(newReview);
    saveDb(db);
    res.json(newReview);
  });

  app.put('/api/reviews/:id', (req, res) => {
    const db = getDb();
    const index = db.reviews.findIndex((r: any) => r.id === req.params.id);
    if (index === -1) {
      db.reviews.push({ ...req.body, id: req.params.id });
    } else {
      db.reviews[index] = { ...db.reviews[index], ...req.body };
    }
    saveDb(db);
    res.json(db.reviews[index === -1 ? db.reviews.length - 1 : index]);
  });

  // Vite middleware for development
  try {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      } else {
        console.warn('Dist folder not found. API routes are still active.');
      }
    }
  } catch (err) {
    console.error('Error initializing Vite/Static middleware:', err);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    // Ensure default admin exists
    const db = getDb();
    const adminEmail = 'admin@example.com';
    if (!db.users.find((u: any) => u.email === adminEmail)) {
      const hashedPassword = await bcrypt.hash('Admin@12345', 10);
      db.users.push({
        uid: 'admin-uid',
        email: adminEmail,
        password: hashedPassword,
        name: 'System Administrator',
        role: 'admin',
        customerID: 'ADMIN-001',
        createdAt: new Date().toISOString()
      });
      saveDb(db);
      console.log('Default admin created: admin@example.com / Admin@12345');
    }
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
