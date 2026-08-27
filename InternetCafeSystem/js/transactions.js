/**
 * transactions.js — Transaction Records page logic
 * Internet Café Customer Management & Computer Usage Monitoring System
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  renderTransactionsPage();
  // Show flash message if redirected here
  const flash = sessionStorage.getItem('flashMsg');
  if (flash) {
    sessionStorage.removeItem('flashMsg');
    showFlashBanner(flash);
  }
});

function renderTransactionsPage() {
  updateSummaryStats();
  renderTransactionsTable();
}

// ── Summary stats ──────────────────────────────────────────
function updateSummaryStats() {
  const transactions  = getTransactions();
  const today         = new Date().toDateString();
  const todayTxns     = transactions.filter(t => new Date(t.date).toDateString() === today);
  const totalRevenue  = transactions.reduce((s, t) => s + t.totalBill, 0);
  const todayRevenue  = todayTxns.reduce((s, t) => s + t.totalBill, 0);

  setText('totalTxns',    transactions.length);
  setText('todayTxns',    todayTxns.length);
  setText('totalRevenue', `₱${totalRevenue.toFixed(0)}`);
  setText('todayRevenue', `₱${todayRevenue.toFixed(0)}`);
}

// ── Filter ─────────────────────────────────────────────────
function filterTransactions() {
  const dateVal = document.getElementById('filterDate').value;
  const transactions = getTransactions();

  if (!dateVal) { renderTransactionsTable(transactions); return; }

  const filtered = transactions.filter(t => {
    const d   = new Date(t.date);
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return iso === dateVal;
  });
  renderTransactionsTable(filtered);
}

function clearFilter() {
  document.getElementById('filterDate').value = '';
  renderTransactionsTable(getTransactions());
}

// ── Render table ───────────────────────────────────────────
function renderTransactionsTable(data) {
  const tbody = document.getElementById('transactionsBody');
  if (!tbody) return;

  const list = data !== undefined ? data : getTransactions();

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="no-data">No transactions recorded yet.</td></tr>';
    setText('filteredTotal', '₱0.00');
    return;
  }

  tbody.innerHTML = list.map(t => `
    <tr>
      <td>${t.id}</td>
      <td>${formatDateTime(t.date)}</td>
      <td>${t.customer}</td>
      <td>PC ${t.pcNumber}</td>
      <td>${t.sessionType}</td>
      <td>${formatDuration(t.durationMin)}</td>
      <td>${t.services.length ? t.services.join(', ') : '—'}</td>
      <td><strong>₱${t.totalBill.toFixed(2)}</strong></td>
      <td>₱${t.amountPaid.toFixed(2)}</td>
      <td>₱${t.change.toFixed(2)}</td>
    </tr>
  `).join('');

  const total = list.reduce((s, t) => s + t.totalBill, 0);
  setText('filteredTotal', `₱${total.toFixed(2)}`);
}

// ── Helpers ────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function showFlashBanner(msg) {
  const banner = document.createElement('div');
  banner.className = 'flash-banner';
  banner.textContent = msg;
  document.querySelector('.main-content').prepend(banner);
  setTimeout(() => banner.remove(), 4000);
}
