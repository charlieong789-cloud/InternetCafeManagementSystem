/**
 * computer.js — Computer management form logic
 * Internet Café Customer Management & Computer Usage Monitoring System
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  renderComputersTable();

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('edit');
  if (editId) {
    const id = parseInt(editId, 10);
    setTimeout(() => {
      const computers = getComputers();
      const c = computers.find(c => parseInt(c.id, 10) === id);
      if (c) {
        document.getElementById('pcNumber').value  = c.number;
        document.getElementById('pcType').value    = c.type;
        document.getElementById('pcStatus').value  = c.status;
        document.getElementById('pcRemarks').value = c.remarks || '';
        document.getElementById('editId').value    = c.id;
        document.getElementById('formHeading').textContent = `✏️ Edit PC ${c.number}`;
        document.getElementById('saveBtn').textContent     = '💾 Update Computer';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
  }
});

// ── Save (add or update) ───────────────────────────────────
function saveComputer(event) {
  event.preventDefault();

  const editId  = parseInt(document.getElementById('editId').value) || null;
  const number  = parseInt(document.getElementById('pcNumber').value);
  const type    = document.getElementById('pcType').value;
  const status  = document.getElementById('pcStatus').value;
  const remarks = document.getElementById('pcRemarks').value.trim();
  const errorEl = document.getElementById('formError');

  errorEl.textContent = '';

  if (!number || number < 1 || number > 99) {
    errorEl.textContent = 'PC number must be between 1 and 99.';
    return;
  }
  if (!type) {
    errorEl.textContent = 'Please select a PC type.';
    return;
  }

  let computers = getComputers();

  if (editId) {
    const idx = computers.findIndex(c => parseInt(c.id, 10) === editId);
    if (idx !== -1) {
      computers[idx] = { ...computers[idx], number, type, status, remarks };
    }
    setComputers(computers);
    sessionStorage.setItem('flashMsg', `✅ PC ${number} updated successfully.`);
  } else {
    if (computers.find(c => c.number === number)) {
      errorEl.textContent = `PC ${number} already exists. Use a different number or edit the existing one.`;
      return;
    }
    const newId = computers.length ? Math.max(...computers.map(c => c.id)) + 1 : 1;
    computers.push({ id: newId, number, type, status, remarks });
    setComputers(computers);
    sessionStorage.setItem('flashMsg', `✅ PC ${number} added to inventory.`);
  }

  resetComputerForm();
  renderComputersTable();
  showInlineSuccess(editId ? `PC ${number} updated.` : `PC ${number} added.`);
}

// ── Reset form ─────────────────────────────────────────────
function resetComputerForm() {
  document.getElementById('computerForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('formHeading').textContent = '➕ Add New Computer';
  document.getElementById('saveBtn').textContent = '💾 Save Computer';
  document.getElementById('formError').textContent = '';
  // Remove edit param from URL
  history.replaceState(null, '', 'form-computer.html');
}

// ── Load computer into form for editing ───────────────────
function loadComputerForEdit(id) {
  const numId = parseInt(id, 10);
  const c = getComputers().find(c => parseInt(c.id, 10) === numId);
  if (!c) return;

  document.getElementById('editId').value    = c.id;
  document.getElementById('pcNumber').value  = c.number;
  document.getElementById('pcType').value    = c.type;
  document.getElementById('pcStatus').value  = c.status;
  document.getElementById('pcRemarks').value = c.remarks || '';

  document.getElementById('formHeading').textContent = `✏️ Edit PC ${c.number}`;
  document.getElementById('saveBtn').textContent = '💾 Update Computer';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Delete computer ────────────────────────────────────────
function deleteComputer(id) {
  const computers = getComputers();
  const numId = parseInt(id, 10);
  const c = computers.find(c => parseInt(c.id, 10) === numId);
  if (!c) return;

  const activeSessions = getActiveSessions();
  if (activeSessions.find(s => parseInt(s.pcId, 10) === numId)) {
    showToast(`PC ${c.number} is currently in use. End the session first.`, 'error');
    return;
  }
  if (!confirm(`Delete PC ${c.number}? This cannot be undone.`)) return;

  setComputers(computers.filter(c => parseInt(c.id, 10) !== numId));
  renderComputersTable();
  showInlineSuccess(`PC ${c.number} deleted.`);
}

// ── Render inventory table ─────────────────────────────────
function renderComputersTable() {
  const tbody     = document.getElementById('computersBody');
  const computers = getComputers();

  if (computers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-data">No computers added yet.</td></tr>';
    return;
  }

  const typeColor = { gaming:'badge-occupied', student:'badge-reserved', regular:'badge-available', maintenance:'badge-maintenance' };

  tbody.innerHTML = computers.map(c => `
    <tr>
      <td><strong>PC ${c.number}</strong></td>
      <td><span class="badge ${typeColor[c.type] || 'badge-available'}">${c.type}</span></td>
      <td><span class="badge badge-${c.status}">${c.status.replace('_',' ')}</span></td>
      <td>${c.remarks || '—'}</td>
      <td>
        <button class="btn-icon" onclick="loadComputerForEdit(${c.id})" title="Edit">✏️</button>
        <button class="btn-icon" onclick="deleteComputer(${c.id})" title="Delete">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// ── Inline success banner ──────────────────────────────────
function showInlineSuccess(msg) {
  const el = document.getElementById('formError');
  el.textContent = msg;
  el.style.color = '#15803d';
  setTimeout(() => { el.textContent = ''; el.style.color = ''; }, 3000);
}
