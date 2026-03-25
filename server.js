require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const morgan = require('morgan');
const winston = require('winston');
const admin = require('firebase-admin');

// ── LOGGING SYSTEM ──
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) })
  ]
});

const app = express();
const PORT = process.env.PORT || 5000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

// ── SECURITY & MIDDLEWARE ──
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many requests. Please try again after 15 minutes." }
});

// ── FIREBASE INIT ──
let db = null;
try {
  // If the user provides a service account file
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    logger.info('🔥 Connected to Firebase Firestore Database');
  } else {
    logger.warn('⚠️ No serviceAccountKey.json found. Falling back to local submissions.json file.');
  }
} catch (error) {
  logger.error('❌ Firebase Init Error:', error.message);
}

// ── VALIDATION SCHEMA ──
const validateSubmission = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    service: Joi.string().allow(''),
    budget: Joi.string().allow(''),
    message: Joi.string().max(1000).allow('')
  });
  return schema.validate(data);
};

// ── API: Fetch Submissions (Admin) ──
app.get('/api/submissions', async (req, res) => {
  try {
    let results = [];
    if (db) {
      const snapshot = await db.collection('leads').orderBy('date', 'desc').get();
      snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
    } else {
      if (!fs.existsSync(SUBMISSIONS_FILE)) fs.writeFileSync(SUBMISSIONS_FILE, '[]');
      const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
      results = JSON.parse(data);
      // Sort new to old locally
      results.sort((a,b) => new Date(b.date) - new Date(a.date));
    }
    res.json(results);
  } catch (error) {
    logger.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ── API: Submit Form ──
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { error } = validateSubmission(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name, email, phone, service, budget, message } = req.body;
  const newSubmission = { 
    name, email, phone, service, budget, message, 
    date: new Date().toISOString() 
  };

  try {
    // 1. Storage
    if (db) {
      await db.collection('leads').add(newSubmission);
    } else {
      newSubmission.id = Date.now().toString();
      const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
      const submissions = JSON.parse(data);
      submissions.push(newSubmission);
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
    }

    logger.info(`📧 Lead Captured: ${name}`);

    // 2. Email Notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
      const emailBody = `<h3>New Project Request</h3><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone}</p><p><b>Service:</b> ${service}</p><p><b>Message:</b> ${message}</p>`;
      
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.NOTIFY_EMAIL || process.env.EMAIL_USER,
        subject: `⚡ New Lead: ${name}`,
        html: emailBody
      }).then(() => logger.info('✅ Email Sent')).catch(e => logger.error('❌ Email Failed', e));
    }

    res.status(200).json({ message: 'Success! Your message has been sent.' });
  } catch (error) {
    logger.error('Processing error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ── API: Update Lead Status (Admin) ──
app.put('/api/submissions/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., 'New', 'Contacted', 'Closed'
  
  try {
    if (db) {
      await db.collection('leads').doc(id).update({ status });
    } else {
      const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
      const submissions = JSON.parse(data);
      const index = submissions.findIndex(s => s.id === id);
      if (index !== -1) {
        submissions[index].status = status;
        fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
      }
    }
    logger.info(`✅ Lead ${id} status updated to: ${status}`);
    res.status(200).json({ message: 'Status updated' });
  } catch (error) {
    logger.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Explicit Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

app.listen(PORT, () => {
  logger.info(`🔥 Firebase-Optimized Backend Live: http://localhost:${PORT}`);
  logger.info(`📊 Admin View: http://localhost:${PORT}/admin.html`);
});
