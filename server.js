import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json({ limit: '1mb' }));
const productsPath = path.join(__dirname, 'products.json');
const usersPath = path.join(__dirname, 'users.json');
const readProducts = () => JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const readUsers = () => { try { return JSON.parse(fs.readFileSync(usersPath, 'utf8')); } catch { return []; } };
const writeUsers = users => fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
const otpChallenges = new Map();
const sessions = new Map();
const otpExpiryMs = 5 * 60 * 1000;
const emailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const transporter = emailConfigured ? nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false') === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
}) : null;
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'VYNTRA API', emailConfigured }));
app.get('/api/products', (_req, res) => res.json(readProducts()));
app.get('/api/products/:id', (req, res) => {
  const item = readProducts().find(p => String(p.id) === req.params.id);
  if (!item) return res.status(404).json({ error: 'Product not found' });
  res.json(item);
});
app.post('/api/auth/request-otp', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const name = String(req.body.name || '').trim().slice(0, 80);
    const password = String(req.body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (!name) return res.status(400).json({ error: 'Enter your name to create an account.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
    const users = readUsers();
    if (users.some(u => u.email === email)) return res.status(409).json({ error: 'An account already exists. Please log in.' });
    if (!transporter) return res.status(503).json({ error: 'Email OTP is not configured. Add SMTP settings to server/.env and restart the API.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    otpChallenges.set(email, { otpHash: crypto.createHash('sha256').update(otp).digest('hex'), name, passwordHash, mode: 'signup', expiresAt: Date.now() + otpExpiryMs, attempts: 0 });
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER, to: email,
      subject: 'Verify your VYNTRA account',
      text: `Your VYNTRA email verification code is ${otp}. It expires in 5 minutes. If you did not request this, ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#21163f"><h1 style="color:#6d2be5">VYNTRA</h1><h2>Verify your email</h2><p>Enter this one-time code to finish creating your VYNTRA account:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#f4efff;padding:18px;text-align:center;border-radius:12px">${otp}</div><p>This code expires in <b>5 minutes</b>. Never share it with anyone.</p></div>`
    });
    res.json({ message: 'Verification code sent. Check your inbox; the code expires in 5 minutes.' });
  } catch (error) {
    console.error('OTP email failed:', error.message);
    res.status(500).json({ error: 'Could not send the email. Check SMTP settings and try again.' });
  }
});
app.post('/api/auth/verify-otp', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const challenge = otpChallenges.get(email);
  if (!challenge || Date.now() > challenge.expiresAt) { otpChallenges.delete(email); return res.status(400).json({ error: 'Code expired or not found. Request a new code.' }); }
  challenge.attempts += 1;
  if (challenge.attempts > 5) { otpChallenges.delete(email); return res.status(429).json({ error: 'Too many attempts. Request a new code.' }); }
  const submittedHash = crypto.createHash('sha256').update(otp).digest('hex');
  if (!/^\d{6}$/.test(otp) || submittedHash !== challenge.otpHash) return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
  const users = readUsers();
  if (users.some(u => u.email === email)) { otpChallenges.delete(email); return res.status(409).json({ error: 'An account already exists. Please log in.' }); }
  const user = { id: crypto.randomUUID(), email, name: challenge.name, passwordHash: challenge.passwordHash, createdAt: new Date().toISOString(), emailVerified: true };
  users.push(user); writeUsers(users); otpChallenges.delete(email);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  res.json({ message: 'Email verified. Your account is ready.', token, user: { id: user.id, email: user.email, name: user.name } });
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) return res.status(400).json({ error: 'Enter a valid email address and password.' });
    const user = readUsers().find(u => u.email === email);
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password.' });
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    res.json({ message: 'You are signed in.', token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login failed:', error.message);
    res.status(500).json({ error: 'Could not log in. Please try again.' });
  }
});
app.get('/api/auth/me', (req, res) => {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = sessions.get(token);
  if (!session || Date.now() > session.expiresAt) { sessions.delete(token); return res.status(401).json({ error: 'Please sign in again.' }); }
  const user = readUsers().find(u => u.id === session.userId);
  if (!user) return res.status(401).json({ error: 'Account not found.' });
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (_req, res) => {
  const index = path.join(__dirname, '../client/dist/index.html');
  if (fs.existsSync(index)) return res.sendFile(index);
  res.status(200).send('VYNTRA API is running. Start the frontend with: npm run dev --prefix client');
});
app.listen(PORT, () => console.log(`VYNTRA server running at http://localhost:${PORT}`));
