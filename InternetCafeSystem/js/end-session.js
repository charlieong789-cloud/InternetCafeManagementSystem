/**
 * end-session.js — End Session & Payment form logic
 * Internet Café Customer Management & Computer Usage Monitoring System
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  populateEndPcDropdown();
  const pcId = new URLSearchParams(window.location.search).get('pc');
  if (pcId && document.querySelector(`#endPcSelect option[value="${pcId}"]`)) {
    document.getElementById('endPcSelect').value = pcId;
    previewBill();
  }
  renderActiveSessionsTable();
  // Show flash message if redirected here
  const flash = sessionStorage.getItem('flashMsg');
  if (flash) { sessionStorage.removeItem('flashMsg'); }
  // Refresh durations every 30 sec
  setInterval(() => { renderActiveSessionsTable(); }, 30000);
});

// ── Populate active sessions dropdown ─────────────────────
function populateEndPcDropdown() {
  const select   = document.getElementById('endPcSelect');
  const sessions = getActiveSessions();

  select.innerHTML = '<option value="">-- Select PC --</option>';
  if (sessions.length === 0) {
    select.innerHTML += '<option value="" disabled>No active sessions</option>';
    return;
  }
  sessions.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.pcId;
    opt.textContent = `PC ${s.pcNumber} — ${s.customerName}`;
    select.appendChild(opt);
  });
}

// ── Bill Preview ───────────────────────────────────────────
function previewBill() {
  const pcId     = parseInt(document.getElementById('endPcSelect').value);
  const sessions = getActiveSessions();
  const session  = sessions.find(s => s.pcId === pcId);
  const preview  = document.getElementById('billPreview');

  if (!session) {
    preview.innerHTML = '<p>Select an active session above to preview the bill.</p>';
    preview.dataset.total = '0';
    return;
  }

  const now         = new Date();
  const durationMin = Math.ceil((now - new Date(session.startTime)) / 60000);
  const durationHr  = durationMin / 60;
  const rate        = RATES[session.sessionType] || 20;

  // Open time: bill by exact minutes (rate / 60 per minute), rounded to 2 decimals
  const usageFee    = parseFloat((rate * durationHr).toFixed(2));
  const servicesFee = session.services.reduce((sum, s) => sum + (SERVICE_PRICES[s] || 0), 0);
  const extraPages  = parseInt(document.getElementById('extraPages').value) || 0;
  const extraFee    = extraPages * 5;
  const totalBill   = parseFloat((usageFee + servicesFee + extraFee).toFixed(2));

  preview.dataset.total = totalBill;

  const isOpen     = session.isOpenTime || session.sessionType === 'open';
  const typeLabel  = isOpen ? '⏱️ Open Time' : session.sessionType;
  const rateLabel  = isOpen
    ? `₱${rate}/hr (₱${(rate/60).toFixed(2)}/min)`
    : `₱${rate}/hr`;

  let html = `
    <div class="bill-line"><span>Customer</span><span>${session.customerName}</span></div>
    <div class="bill-line"><span>PC #${session.pcNumber} — ${typeLabel}</span><span>${rateLabel}</span></div>
    <div class="bill-line"><span>Start Time</span><span>${formatTime(session.startTime)}</span></div>
    <div class="bill-line"><span>Duration: ${formatDuration(durationMin)}</span><span>₱${usageFee.toFixed(2)}</span></div>`;

  if (servicesFee > 0) {
    html += `<div class="bill-line"><span>Services: ${session.services.join(', ')}</span><span>₱${servicesFee.toFixed(2)}</span></div>`;
  }
  if (extraFee > 0) {
    html += `<div class="bill-line"><span>Extra Pages (${extraPages} × ₱5)</span><span>₱${extraFee.toFixed(2)}</span></div>`;
  }
  html += `<div class="bill-line bill-total"><span>TOTAL DUE</span><span>₱${totalBill.toFixed(2)}</span></div>`;

  preview.innerHTML = html;
  calcChange();
}

// ── Change calculation ─────────────────────────────────────
function calcChange() {
  const total   = parseFloat(document.getElementById('billPreview').dataset.total) || 0;
  const paid    = parseFloat(document.getElementById('amountPaid').value) || 0;
  const change  = paid - total;
  const display = document.getElementById('changeDisplay');
  display.value = change >= 0 ? `₱ ${change.toFixed(2)}` : 'Insufficient';
  display.style.color = change >= 0 ? '#0f4c5c' : '#dc2626';
}

// ── Submit ─────────────────────────────────────────────────
function endSession(event) {
  event.preventDefault();

  const pcId       = parseInt(document.getElementById('endPcSelect').value);
  const extraPages = parseInt(document.getElementById('extraPages').value) || 0;
  const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
  const errorEl    = document.getElementById('formError');

  errorEl.textContent = '';

  let sessions = getActiveSessions();
  const session = sessions.find(s => s.pcId === pcId);

  if (!session) {
    errorEl.textContent = 'No active session found for the selected PC.';
    return;
  }

  const endTime     = new Date();
  const durationMin = Math.ceil((endTime - new Date(session.startTime)) / 60000);
  const durationHr  = durationMin / 60;
  const rate        = RATES[session.sessionType] || 20;
  const usageFee    = parseFloat((rate * durationHr).toFixed(2));
  const servicesFee = session.services.reduce((sum, s) => sum + (SERVICE_PRICES[s] || 0), 0);
  const extraFee    = extraPages * 5;
  const totalBill   = parseFloat((usageFee + servicesFee + extraFee).toFixed(2));
  const change      = parseFloat((amountPaid - totalBill).toFixed(2));

  if (amountPaid < totalBill) {
    errorEl.textContent = `Insufficient payment. Total is ₱${totalBill.toFixed(2)} but ₱${amountPaid.toFixed(2)} was entered.`;
    return;
  }

  // Record transaction
  let transactions = getTransactions();
  let counter      = getTxnCounter();
  transactions.push({
    id:          counter++,
    date:        endTime.toISOString(),
    customer:    session.customerName,
    pcNumber:    session.pcNumber,
    sessionType: session.sessionType,
    durationMin,
    services:    [...session.services],
    totalBill,
    amountPaid,
    change
  });
  setTransactions(transactions);
  setTxnCounter(counter);

  // Free computer
  const computers = getComputers();
  const computer  = computers.find(c => c.id === pcId);
  if (computer) { computer.status = 'available'; setComputers(computers); }

  // Remove session
  sessions = sessions.filter(s => s.pcId !== pcId);
  setActiveSessions(sessions);

  // Redirect to transactions with flash
  sessionStorage.setItem('flashMsg',
    `✅ Payment processed! PC ${session.pcNumber} — ₱${totalBill.toFixed(2)} total, ₱${change.toFixed(2)} change.`
  );
  window.location.href = 'transactions.html';
}

function resetEndForm() {
  document.getElementById('billPreview').innerHTML = '<p>Select an active session above to preview the bill.</p>';
  document.getElementById('billPreview').dataset.total = '0';
  document.getElementById('changeDisplay').value = '₱ 0.00';
  document.getElementById('changeDisplay').style.color = '#0f4c5c';
}

// ── Active Sessions reference table ───────────────────────
function renderActiveSessionsTable() {
  const tbody    = document.getElementById('activeSessionsBody');
  if (!tbody) return;

  const sessions = getActiveSessions();
  if (sessions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="no-data">No active sessions.</td></tr>';
    return;
  }

  tbody.innerHTML = sessions.map(s => {
    const durationMin = Math.ceil((new Date() - new Date(s.startTime)) / 60000);
    const rate        = RATES[s.sessionType] || 20;
    const estBill     = (rate * durationMin / 60).toFixed(2);
    return `
      <tr>
        <td><strong>PC ${s.pcNumber}</strong></td>
        <td>${s.customerName}</td>
        <td>${s.sessionType}</td>
        <td>${formatTime(s.startTime)}</td>
        <td>${formatDuration(durationMin)}</td>
        <td>₱${estBill}</td>
        <td>${s.services.length ? s.services.join(', ') : '—'}</td>
      </tr>`;
  }).join('');
}
