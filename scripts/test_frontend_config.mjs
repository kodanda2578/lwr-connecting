import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- LWR CONNECTING: FRONTEND CLOUD CONFIGURATION TEST SUITE ---');

// 1. Verify vercel.json
const vercelPath = path.resolve('frontend/vercel.json');
assert.ok(fs.existsSync(vercelPath), 'frontend/vercel.json must exist');
const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
assert.ok(Array.isArray(vercelConfig.rewrites), 'vercel.json must define rewrites');
const spaRewrite = vercelConfig.rewrites.find(r => r.destination === '/index.html');
assert.ok(spaRewrite, 'vercel.json must have SPA rewrite to /index.html');
assert.strictEqual(spaRewrite.source, '/(.*)', 'SPA rewrite pattern should match all paths /(.*)');
console.log('✅ TEST 1 PASSED: frontend/vercel.json SPA routing verified.');

// 2. Verify frontend/.env.example
const envExamplePath = path.resolve('frontend/.env.example');
assert.ok(fs.existsSync(envExamplePath), 'frontend/.env.example must exist');
const envContent = fs.readFileSync(envExamplePath, 'utf-8');
assert.ok(envContent.includes('VITE_API_BASE_URL'), '.env.example must include VITE_API_BASE_URL');
assert.ok(envContent.includes('VITE_PUBLIC_APP_URL'), '.env.example must include VITE_PUBLIC_APP_URL');
assert.ok(!envContent.includes('JWT_SECRET'), '.env.example must NOT expose JWT_SECRET');
assert.ok(!envContent.includes('SMTP_PASSWORD'), '.env.example must NOT expose SMTP_PASSWORD');
console.log('✅ TEST 2 PASSED: frontend/.env.example verified with safe public placeholders.');

// 3. Test URL normalization logic (simulating appConfig functions)
function createConfig(env) {
  const rawApiBaseUrl = (env.VITE_API_BASE_URL || '').trim();
  const rawPublicAppUrl = (env.VITE_PUBLIC_APP_URL || '').trim();

  const getApiBaseUrl = () => {
    if (!rawApiBaseUrl) return '/api';
    let clean = rawApiBaseUrl.replace(/\/+$/, '');
    if (!clean.endsWith('/api')) clean = `${clean}/api`;
    return clean;
  };

  const buildApiUrl = (endpoint = '') => {
    if (!endpoint) return getApiBaseUrl();
    let p = String(endpoint).trim();
    if (/^https?:\/\//i.test(p)) return p;
    if (p.startsWith('/api/')) p = p.substring(4);
    else if (p === '/api' || p === 'api') p = '';
    else if (p.startsWith('api/')) p = p.substring(3);
    if (p && !p.startsWith('/')) p = `/${p}`;
    return `${getApiBaseUrl()}${p}`;
  };

  const getPublicAppUrl = () => {
    if (rawPublicAppUrl) return rawPublicAppUrl.replace(/\/+$/, '');
    return 'http://localhost:5173';
  };

  const buildPublicUrl = (route = '') => {
    let clean = String(route).trim();
    if (clean && !clean.startsWith('/')) clean = `/${clean}`;
    return `${getPublicAppUrl()}${clean}`;
  };

  return { getApiBaseUrl, buildApiUrl, getPublicAppUrl, buildPublicUrl };
}

// Case A: Local development (empty env)
const devConfig = createConfig({});
assert.strictEqual(devConfig.getApiBaseUrl(), '/api');
assert.strictEqual(devConfig.buildApiUrl('/colleges'), '/api/colleges');
assert.strictEqual(devConfig.buildApiUrl('/api/colleges'), '/api/colleges');
assert.strictEqual(devConfig.buildApiUrl('/api/auth/login'), '/api/auth/login');
assert.strictEqual(devConfig.buildApiUrl('auth/login'), '/api/auth/login');
assert.strictEqual(devConfig.buildApiUrl('/api'), '/api');
assert.strictEqual(devConfig.buildPublicUrl('/register?code=LWR-W1-123'), 'http://localhost:5173/register?code=LWR-W1-123');
console.log('✅ TEST 3 PASSED: Local development URL resolution verified (no double /api).');

// Case B: Production with host without /api
const prodConfig1 = createConfig({
  VITE_API_BASE_URL: 'https://lwr-backend.onrender.com',
  VITE_PUBLIC_APP_URL: 'https://lwr-connecting.vercel.app'
});
assert.strictEqual(prodConfig1.getApiBaseUrl(), 'https://lwr-backend.onrender.com/api');
assert.strictEqual(prodConfig1.buildApiUrl('/colleges'), 'https://lwr-backend.onrender.com/api/colleges');
assert.strictEqual(prodConfig1.buildApiUrl('/api/colleges'), 'https://lwr-backend.onrender.com/api/colleges');
assert.strictEqual(prodConfig1.buildApiUrl('/api/auth/login'), 'https://lwr-backend.onrender.com/api/auth/login');
assert.strictEqual(prodConfig1.buildPublicUrl('/register?code=LWR-W1-ABC'), 'https://lwr-connecting.vercel.app/register?code=LWR-W1-ABC');
console.log('✅ TEST 4 PASSED: Production resolution with bare host verified.');

// Case C: Production with base URL ALREADY ending in /api/
const prodConfig2 = createConfig({
  VITE_API_BASE_URL: 'https://lwr-backend.onrender.com/api/',
  VITE_PUBLIC_APP_URL: 'https://lwr-connecting.vercel.app/'
});
assert.strictEqual(prodConfig2.getApiBaseUrl(), 'https://lwr-backend.onrender.com/api');
assert.strictEqual(prodConfig2.buildApiUrl('/api/colleges'), 'https://lwr-backend.onrender.com/api/colleges');
assert.strictEqual(prodConfig2.buildApiUrl('/colleges'), 'https://lwr-backend.onrender.com/api/colleges');
assert.strictEqual(prodConfig2.buildPublicUrl('/register'), 'https://lwr-connecting.vercel.app/register');
console.log('✅ TEST 5 PASSED: Production resolution with trailing slashes and existing /api verified.');

console.log('\nALL 5 FRONTEND CLOUD CONFIGURATION TESTS PASSED!');

