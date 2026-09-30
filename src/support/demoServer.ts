import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Zero-dependency demo backend so the framework runs out of the box.
 *   Pages : /register, /login, /profile (profile requires a session)
 *   API   : POST /api/users, GET /api/users/:id
 *           POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
 * Disable with USE_DEMO_APP=false when testing your real application.
 */
export interface SeedUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'standard' | 'admin';
  locked: boolean;
}

interface StoredUser extends SeedUser {
  id: string;
  createdAt: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAGES: Record<string, string> = {
  '/register': 'register.html',
  '/login': 'login.html',
  '/profile': 'profile.html',
};

const users = new Map<string, StoredUser>();
const sessions = new Map<string, string>(); // token -> userId
let server: http.Server | undefined;

function seedUsers(seed: SeedUser[]): void {
  users.clear();
  sessions.clear();
  for (const s of seed) {
    const id = randomUUID();
    users.set(id, { ...s, email: s.email.toLowerCase(), id, createdAt: new Date().toISOString() });
  }
}

const findByEmail = (email: string) => [...users.values()].find((u) => u.email === email);

/** Registration view of a user - never includes the password. */
const toPublic = (u: StoredUser) => ({
  id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, createdAt: u.createdAt,
});

/** Auth view of a user - includes the role, never the password. */
const toAuthUser = (u: StoredUser) => ({
  id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role,
});

function sendJson(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown> | undefined> {
  try {
    const parsed = JSON.parse(await readBody(req));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function parseCookies(req: IncomingMessage): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) cookies[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return cookies;
}

/** Bearer token wins if present (no fallback to cookie); otherwise the session cookie. */
function tokenFrom(req: IncomingMessage): string | undefined {
  const auth = req.headers.authorization;
  if (auth !== undefined) return auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return parseCookies(req).session;
}

function sessionUser(req: IncomingMessage): StoredUser | undefined {
  const token = tokenFrom(req);
  const userId = token ? sessions.get(token) : undefined;
  return userId ? users.get(userId) : undefined;
}

function validateRegistration(p: Record<string, unknown>): { field: string; message: string }[] {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const errors: { field: string; message: string }[] = [];
  if (!str(p.firstName)) errors.push({ field: 'firstName', message: 'First name is required' });
  if (!str(p.lastName)) errors.push({ field: 'lastName', message: 'Last name is required' });
  if (!EMAIL_RE.test(str(p.email))) errors.push({ field: 'email', message: 'Enter a valid email address' });
  if (typeof p.password !== 'string' || p.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  if (p.acceptTerms !== true) errors.push({ field: 'acceptTerms', message: 'You must accept the terms' });
  return errors;
}

const INVALID_JSON = { error: 'INVALID_JSON', message: 'Request body must be valid JSON' };

async function handleApi(req: IncomingMessage, res: ServerResponse, url: string): Promise<void> {
  // ---------------- registration ----------------
  if (req.method === 'POST' && url === '/api/users') {
    const body = await readJson(req);
    if (!body) return sendJson(res, 400, INVALID_JSON);

    const errors = validateRegistration(body);
    if (errors.length) return sendJson(res, 400, { error: 'VALIDATION_ERROR', details: errors });

    const email = String(body.email).trim().toLowerCase();
    if (findByEmail(email)) {
      return sendJson(res, 409, {
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists',
      });
    }
    const user: StoredUser = {
      id: randomUUID(),
      firstName: String(body.firstName).trim(),
      lastName: String(body.lastName).trim(),
      email,
      password: String(body.password),
      role: 'standard',
      locked: false,
      createdAt: new Date().toISOString(),
    };
    users.set(user.id, user);
    return sendJson(res, 201, toPublic(user), { Location: `/api/users/${user.id}` });
  }

  const userMatch = url.match(/^\/api\/users\/([^/]+)$/);
  if (req.method === 'GET' && userMatch) {
    const user = users.get(decodeURIComponent(userMatch[1]));
    return user
      ? sendJson(res, 200, toPublic(user))
      : sendJson(res, 404, { error: 'USER_NOT_FOUND', message: 'User not found' });
  }

  // ---------------- authentication ----------------
  if (req.method === 'POST' && url === '/api/auth/login') {
    const body = await readJson(req);
    if (!body) return sendJson(res, 400, INVALID_JSON);

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const details: { field: string; message: string }[] = [];
    if (!email) details.push({ field: 'email', message: 'Email is required' });
    if (!password) details.push({ field: 'password', message: 'Password is required' });
    if (details.length) return sendJson(res, 400, { error: 'VALIDATION_ERROR', details });

    const user = findByEmail(email);
    if (!user || user.password !== password) {
      return sendJson(res, 401, { error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }
    if (user.locked) {
      return sendJson(res, 423, {
        error: 'ACCOUNT_LOCKED',
        message: 'Your account is locked. Please contact support.',
      });
    }
    const token = randomUUID();
    sessions.set(token, user.id);
    return sendJson(res, 200, { token, user: toAuthUser(user) }, {
      'Set-Cookie': `session=${token}; HttpOnly; Path=/; SameSite=Lax`,
    });
  }

  if (req.method === 'GET' && url === '/api/auth/me') {
    const user = sessionUser(req);
    return user
      ? sendJson(res, 200, toAuthUser(user))
      : sendJson(res, 401, { error: 'UNAUTHORIZED', message: 'Authentication required' });
  }

  if (req.method === 'POST' && url === '/api/auth/logout') {
    const token = tokenFrom(req);
    if (token) sessions.delete(token);
    res.writeHead(204, { 'Set-Cookie': 'session=; HttpOnly; Path=/; Max-Age=0' });
    return void res.end();
  }

  return sendJson(res, 404, { error: 'NOT_FOUND', message: 'Route not found' });
}

export async function startDemoServer(baseUrl: string, seed: SeedUser[]): Promise<void> {
  const port = Number(new URL(baseUrl).port || 80);
  const pagesDir = path.resolve(__dirname, '../../demo-app');
  seedUsers(seed);

  server = http.createServer((req, res) => {
    const url = (req.url ?? '/').split('?')[0];
    if (url.startsWith('/api/')) {
      handleApi(req, res, url).catch(() => sendJson(res, 500, { error: 'SERVER_ERROR' }));
    } else if (url === '/') {
      res.writeHead(302, { Location: '/login' });
      res.end();
    } else if (Object.prototype.hasOwnProperty.call(PAGES, url)) {
      if (url === '/profile' && !sessionUser(req)) {
        res.writeHead(302, { Location: '/login' }); // protected page
        return void res.end();
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(path.join(pagesDir, PAGES[url])).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise<void>((resolve, reject) => {
    server!.once('error', reject);
    server!.listen(port, resolve);
  });
  console.log(`\n  Demo app running at ${baseUrl} (pages: /register /login /profile, API: /api/...)\n`);
}

export async function stopDemoServer(): Promise<void> {
  if (!server) return;
  await new Promise<void>((resolve) => server!.close(() => resolve()));
}
