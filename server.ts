import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure database directory exists
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'sitr_database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database Helper
interface DbSchema {
  reports: Array<{
    id: string;
    type: string;
    location: string;
    incident_date?: string;
    incident_period?: string;
    victim_name?: string;
    description: string;
    severity: string;
    status: string;
    created_at: string;
    notes?: string;
    detected_keywords?: string[];
  }>;
}

function readDatabase(): DbSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.reports)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  return { reports: [] };
}

function writeDatabase(data: DbSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing to database:', err);
  }
}

// Middleware
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  const db = readDatabase();
  res.json({
    status: 'ok',
    database: 'local_file_db',
    reports_count: db.reports.length,
    timestamp: new Date().toISOString(),
  });
});

// GET all reports
app.get('/api/reports', (req, res) => {
  const db = readDatabase();
  res.json({ success: true, reports: db.reports });
});

// POST new report
app.post('/api/reports', (req, res) => {
  const { type, location, incident_date, incident_period, victim_name, description, severity, detected_keywords } = req.body;

  if (!description || !type || !location) {
    return res.status(400).json({ success: false, error: 'بيانات البلاغ غير مكتملة' });
  }

  const db = readDatabase();
  const newReport = {
    id: 'SITR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    type: type || 'verbal',
    location: location || 'ساحة',
    incident_date: incident_date || new Date().toISOString().slice(0, 10),
    incident_period: incident_period || 'الصباحية',
    victim_name: victim_name?.trim() ? victim_name.trim() : undefined,
    description: description.trim(),
    severity: severity || 'low',
    status: 'new',
    created_at: new Date().toISOString(),
    notes: '',
    detected_keywords: Array.isArray(detected_keywords) ? detected_keywords : [],
  };

  db.reports.unshift(newReport);
  writeDatabase(db);

  res.status(201).json({ success: true, report: newReport });
});

// PATCH update status & notes
app.patch('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const db = readDatabase();
  const index = db.reports.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'البلاغ غير موجود' });
  }

  if (status) db.reports[index].status = status;
  if (notes !== undefined) db.reports[index].notes = notes;

  writeDatabase(db);
  res.json({ success: true, report: db.reports[index] });
});

// DELETE single report
app.delete('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const initialCount = db.reports.length;
  db.reports = db.reports.filter((r) => r.id !== id);

  if (db.reports.length === initialCount) {
    return res.status(404).json({ success: false, error: 'البلاغ غير موجود' });
  }

  writeDatabase(db);
  res.json({ success: true, message: 'تم حذف البلاغ بنجاح' });
});

// DELETE all reports
app.delete('/api/reports', (req, res) => {
  const db = { reports: [] };
  writeDatabase(db);
  res.json({ success: true, message: 'تم تفريغ قاعدة البيانات بالكامل' });
});

// POST Login Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const inputCred = (email || '').trim().toLowerCase();
  const inputPassword = (password || '').trim();

  // Toriss Administration verification (Username or email)
  const isTorissAdmin = (
    inputCred === 'toriss' ||
    inputCred === 'info@toriss@college.com' ||
    inputCred === 'info@torisscollege.com' ||
    inputCred === 'info.toriss@college.com' ||
    inputCred === 'toriss@college.com' ||
    inputCred === 'info@toriss.college.com' ||
    inputCred === 'info@toriss.college'
  ) && (
    inputPassword === 'Torisscollege@2013@' ||
    inputPassword === 'Torisscollege@2013'
  );

  if (isTorissAdmin) {
    return res.json({
      success: true,
      user: {
        id: 'admin-toriss-college',
        email: 'Toriss',
        name: 'إدارة كلية طوريس (Toriss College)',
        role: 'admin',
      },
    });
  }

  // School Counselor
  if (
    (inputCred === 'counselor@sitr.school' && inputPassword === 'sitr2026') ||
    (inputCred === 'admin@sitr.school' && inputPassword === 'sitr2026')
  ) {
    return res.json({
      success: true,
      user: {
        id: 'admin-001',
        email: email.trim(),
        name: 'أ. نادية المنصوري (المرشد الطلابي)',
        role: 'school_counselor',
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم وكلمة المرور.',
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
