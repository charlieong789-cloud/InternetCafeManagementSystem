/**
 * shared.js — Shared state, utilities, and helpers
 * Internet Café Customer Management & Computer Usage Monitoring System
 *
 * Group Leader : Charlie Ong
 * Instructor   : Abejah Paculdo
 * Course       : Bachelor in Information Technology
 * Submitted    : July 31, 2026
 */

'use strict';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const RATES = { regular: 20, gaming: 30, student: 15, open: 20 };
const SERVICE_PRICES = { printing: 5, scanning: 10, headset: 5, webcam: 10 };

// ═══════════════════════════════════════════════════════════
// STATE — sessionStorage
// ═══════════════════════════════════════════════════════════

function loadState(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (key === 'activeSessions') return parsed.map(s => ({ ...s, startTime: new Date(s.startTime) }));
    if (key === 'transactions')   return parsed.map(t => ({ ...t, date: new Date(t.date) }));
    return parsed;
  } catch { return fallback; }
}

function saveState(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function getComputers()      { return loadState('computers', []); }
function getActiveSessions() { return loadState('activeSessions', []); }
function getTransactions()   { return loadState('transactions', []); }
function getTxnCounter()     { return loadState('txnCounter', 1); }

function setComputers(v)      { saveState('computers', v); }
function setActiveSessions(v) { saveState('activeSessions', v); }
function setTransactions(v)   { saveState('transactions', v); }
function setTxnCounter(v)     { saveState('txnCounter', v); }

function seedDefaultComputersIfNeeded() {
  if (getComputers().length > 0) return;
  setComputers([
    { id:1,  number:1,  type:'regular',     spec:'Intel Core i3, 4GB RAM, 500GB HDD',  status:'available',   remarks:'' },
    { id:2,  number:2,  type:'regular',     spec:'Intel Core i3, 4GB RAM, 500GB HDD',  status:'available',   remarks:'' },
    { id:3,  number:3,  type:'gaming',      spec:'Intel Core i7, 16GB RAM, RTX 3060',  status:'available',   remarks:'' },
    { id:4,  number:4,  type:'gaming',      spec:'Intel Core i7, 16GB RAM, RTX 3060',  status:'available',   remarks:'' },
    { id:5,  number:5,  type:'gaming',      spec:'AMD Ryzen 5, 16GB RAM, RX 6600',     status:'available',   remarks:'' },
    { id:6,  number:6,  type:'student',     spec:'Intel Celeron, 4GB RAM, 256GB SSD',  status:'available',   remarks:'' },
    { id:7,  number:7,  type:'student',     spec:'Intel Celeron, 4GB RAM, 256GB SSD',  status:'available',   remarks:'' },
    { id:8,  number:8,  type:'regular',     spec:'Intel Core i5, 8GB RAM, 1TB HDD',    status:'available',   remarks:'' },
    { id:9,  number:9,  type:'regular',     spec:'Intel Core i5, 8GB RAM, 1TB HDD',    status:'available',   remarks:'' },
    { id:10, number:10, type:'maintenance', spec:'Intel Core i5, 8GB RAM',             status:'maintenance', remarks:'GPU fan replaced' },
  ]);
}

// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date) {
  return new Date(date).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hrs  = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// ═══════════════════════════════════════════════════════════
// AUTH HELPERS
// ═══════════════════════════════════════════════════════════

function isLoggedIn() {
  return sessionStorage.getItem('loggedIn') === 'true';
}

function doLogout() {
  sessionStorage.removeItem('loggedIn');
  sessionStorage.setItem('flashMsg', 'You have been logged out.');
  window.location.href = 'index.html';
}

/**
 * Inject a single Login / Logout button into every element
 * with id="authBtn" on the page.
 */
function injectAuthButton() {
  const targets = document.querySelectorAll('#authBtn');
  targets.forEach(el => {
    if (isLoggedIn()) {
      el.textContent = 'Logout';
      el.className   = 'btn btn-sm btn-logout';
      el.onclick     = doLogout;
      el.removeAttribute('href');
    } else {
      el.textContent = 'Login';
      el.className   = 'btn btn-sm';
      el.href        = 'form-login.html';
      el.onclick     = null;
    }
  });
}



/**
 * Show a brief toast notification.
 * @param {string} msg
 * @param {'success'|'error'|'info'} type
 */
function showToast(msg, type = 'success') {
  const old = document.getElementById('sysToast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id        = 'sysToast';
  toast.className = `sys-toast sys-toast--${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('sys-toast--show'));
  setTimeout(() => {
    toast.classList.remove('sys-toast--show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ═══════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════

function injectFooter() {
  const footer = document.getElementById('sharedFooter');
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-inner">
      <p class="footer-title">Developed by Charlie Ong</p>
      <p class="footer-course">Bachelor of Science in Information Technology</p>
    </div>`;
}

// ═══════════════════════════════════════════════════════════
// FLASH BANNER  (cross-page redirect messages)
// ═══════════════════════════════════════════════════════════

function showFlashIfAny() {
  const msg = sessionStorage.getItem('flashMsg');
  if (!msg) return;
  sessionStorage.removeItem('flashMsg');

  const banner = document.createElement('div');
  banner.className = 'flash-banner';
  banner.textContent = msg;

  const content = document.querySelector('.main-content') || document.body;
  content.prepend(banner);
  setTimeout(() => banner.remove(), 4000);
}

// ═══════════════════════════════════════════════════════════
// AUTO-RUN
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  seedDefaultComputersIfNeeded();
  injectFooter();
  injectAuthButton();
  showFlashIfAny();
});
