/**
 * start-session.js — Start Session form logic
 * Internet Café Customer Management & Computer Usage Monitoring System
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  populatePcDropdown();

  const pcSelect = document.getElementById('pcSelect');
  const pcIdParam = new URLSearchParams(window.location.search).get('pc');

  if (pcIdParam) {
    const pcIdNum = parseInt(pcIdParam, 10);
    let found = false;
    for (let i = 0; i < pcSelect.options.length; i++) {
      if (parseInt(pcSelect.options[i].value, 10) === pcIdNum) {
        pcSelect.selectedIndex = i;
        pcSelect.disabled = true;
        pcSelect.title = 'Assigned from the dashboard';
        found = true;
        break;
      }
    }

    if (found) {
      // Pre-fill session type from PC's type
      onPcChange();

      const pc = getComputers().find(c => c.id === pcIdNum);
      if (pc) {
        const banner = document.createElement('div');
        banner.className = 'flash-banner';
        banner.textContent = `🖥️ PC ${pc.number} is pre-selected from the dashboard.`;
        const formCard = document.querySelector('.card');
        if (formCard) formCard.insertBefore(banner, formCard.firstChild);
      }
    }
  }

  renderAvailablePcsTable();
});

// ── When PC selection changes, lock session type to PC's type ─
function onPcChange() {
  const pcSelect   = document.getElementById('pcSelect');
  const typeSelect = document.getElementById('sessionType');
  const hint       = document.getElementById('sessionTypeHint');
  const openBtn    = document.getElementById('openTimeBtn');
  const pcId       = parseInt(pcSelect.value, 10);

  if (!pcId) {
    typeSelect.value    = '';
    typeSelect.disabled = true;
    openBtn.disabled    = true;
    openBtn.classList.remove('btn-primary');
    openBtn.classList.add('btn-outline');
    hint.textContent    = 'Select a computer to set the session type';
    return;
  }

  const pc = getComputers().find(c => parseInt(c.id, 10) === pcId);
  if (!pc) return;

  // Lock to PC's type
  typeSelect.value    = pc.type in RATES ? pc.type : 'open';
  typeSelect.disabled = true;
  openBtn.disabled    = false;

  // Reset Open Time button state
  openBtn.classList.remove('btn-primary');
  openBtn.classList.add('btn-outline');
  openBtn.textContent = '⏱️ Open Time';

  const rateMap = { regular: '₱20/hr', gaming: '₱30/hr', student: '₱15/hr', open: 'per minute' };
  hint.textContent = `Type locked to PC ${pc.number} — ${pc.type} (${rateMap[pc.type] || ''})`;
}

// ── Toggle Open Time override ──────────────────────────────
function toggleOpenTime() {
  const typeSelect = document.getElementById('sessionType');
  const openBtn    = document.getElementById('openTimeBtn');
  const hint       = document.getElementById('sessionTypeHint');
  const pcSelect   = document.getElementById('pcSelect');
  const pcId       = parseInt(pcSelect.value, 10);
  const pc         = getComputers().find(c => parseInt(c.id, 10) === pcId);

  if (typeSelect.value === 'open') {
    // Revert back to PC's original type
    typeSelect.value = pc ? (pc.type in RATES ? pc.type : 'regular') : 'regular';
    openBtn.classList.remove('btn-primary');
    openBtn.classList.add('btn-outline');
    openBtn.textContent = '⏱️ Open Time';
    const rateMap = { regular: '₱20/hr', gaming: '₱30/hr', student: '₱15/hr' };
    hint.textContent = `Type locked to PC ${pc ? pc.number : ''} — ${typeSelect.value} (${rateMap[typeSelect.value] || ''})`;
  } else {
    // Switch to Open Time
    typeSelect.value = 'open';
    openBtn.classList.remove('btn-outline');
    openBtn.classList.add('btn-primary');
    openBtn.textContent = '✕ Cancel Open Time';
    hint.textContent = '⏱️ Open Time — billing by exact minutes used';
  }
}

// ── Reset form ─────────────────────────────────────────────
function resetSessionForm() {
  document.getElementById('startSessionForm').reset();
  const typeSelect = document.getElementById('sessionType');
  const openBtn    = document.getElementById('openTimeBtn');
  typeSelect.value    = '';
  typeSelect.disabled = true;
  openBtn.disabled    = true;
  openBtn.classList.remove('btn-primary');
  openBtn.classList.add('btn-outline');
  openBtn.textContent = '⏱️ Open Time';
  document.getElementById('sessionTypeHint').textContent = 'Select a computer to set the session type';
  document.getElementById('formError').textContent = '';
}

// ── Populate PC dropdown ───────────────────────────────────
function populatePcDropdown() {
  const select    = document.getElementById('pcSelect');
  const computers = getComputers().filter(c => c.status === 'available');

  select.innerHTML = '<option value="">-- Select Available PC --</option>';
  if (computers.length === 0) {
    select.innerHTML += '<option value="" disabled>No available PCs right now</option>';
    return;
  }
  computers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;   // number — browser stores as string automatically
    opt.textContent = `PC ${c.number} — ${c.type.charAt(0).toUpperCase() + c.type.slice(1)} (₱${RATES[c.type]}/hr)`;
    select.appendChild(opt);
  });
}

// ── Submit ─────────────────────────────────────────────────
function startSession(event) {
  event.preventDefault();

  const custName    = document.getElementById('custName').value.trim();
  const pcId        = parseInt(document.getElementById('pcSelect').value);
  const sessionType = document.getElementById('sessionType').value;
  const notes       = document.getElementById('sessionNotes').value.trim();
  const errorEl     = document.getElementById('formError');

  errorEl.textContent = '';

  // Validation
  if (!custName || custName.length < 2) {
    errorEl.textContent = 'Customer name must be at least 2 characters.';
    return;
  }
  if (!pcId) {
    errorEl.textContent = 'Please select an available computer.';
    return;
  }
  if (!sessionType) {
    errorEl.textContent = 'Please select a session type.';
    return;
  }
  const computers = getComputers();
  const computer  = computers.find(c => c.id === pcId);
  if (!computer || computer.status !== 'available') {
    errorEl.textContent = 'Selected computer is no longer available.';
    return;
  }

  const services = Array.from(document.querySelectorAll('input[name="service"]:checked'))
    .map(cb => cb.value);

  // Mark computer occupied
  computer.status = 'occupied';
  setComputers(computers);

  // Add session
  const sessions = getActiveSessions();
  sessions.push({
    pcId,
    pcNumber:     computer.number,
    customerName: custName,
    sessionType,                         // from form, not from pc.type
    isOpenTime:   sessionType === 'open',
    startTime:    new Date().toISOString(),
    services,
    notes
  });
  setActiveSessions(sessions);

  const typeLabel = sessionType === 'open' ? 'Open Time' : sessionType;
  sessionStorage.setItem('flashMsg', `✅ Session started! PC ${computer.number} assigned to ${custName} (${typeLabel}).`);
  window.location.href = 'dashboard.html';
}

// ── Available PCs reference table ─────────────────────────
function renderAvailablePcsTable() {
  const tbody = document.getElementById('availablePcsBody');
  if (!tbody) return;

  const available = getComputers().filter(c => c.status === 'available');
  if (available.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="no-data">No available computers right now.</td></tr>';
    return;
  }

  tbody.innerHTML = available.map(c => `
    <tr>
      <td><strong>PC ${c.number}</strong></td>
      <td><span class="badge badge-available">${c.type}</span></td>
      <td>₱${RATES[c.type] || 20}/hr &nbsp;<span style="color:#6b7280;font-size:12px">(or Open Time)</span></td>
    </tr>
  `).join('');
}
