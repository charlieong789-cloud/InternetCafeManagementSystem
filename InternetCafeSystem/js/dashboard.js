'use strict';

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  setInterval(renderDashboard, 30000);
});

function renderDashboard() {
  const computers = getComputers();
  const sessions = getActiveSessions();
  const transactions = getTransactions();
  const today = new Date();
  const todaysTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.date);
    return date.toDateString() === today.toDateString();
  });

  document.getElementById('statActive').textContent = sessions.length;
  document.getElementById('statAvail').textContent = computers.filter(computer => computer.status === 'available').length;
  document.getElementById('statToday').textContent = `₱${todaysTransactions.reduce((sum, transaction) => sum + (Number(transaction.total) || 0), 0).toFixed(2)}`;
  document.getElementById('statTxn').textContent = todaysTransactions.length;

  renderPcGrid(computers);
  renderActiveSessions(sessions, computers);
}

function renderPcGrid(computers) {
  const grid = document.getElementById('pcGrid');
  if (computers.length === 0) {
    grid.innerHTML = '<p class="no-data">No computers added yet.</p>';
    return;
  }

  grid.innerHTML = computers.map(computer => {
    const destination = computer.status === 'available'
      ? `form-start-session.html?pc=${computer.id}`
      : computer.status === 'occupied'
        ? `form-end-session.html?pc=${computer.id}`
        : `form-computer.html?edit=${computer.id}`;

    return `
    <a class="pc-card ${computer.status}" href="${destination}">
      <span class="pc-icon">🖥️</span>
      <span class="pc-label">PC ${computer.number}</span>
      <span class="pc-status">${computer.status.replace('_', ' ')}</span>
    </a>
  `;
  }).join('');
}

function renderActiveSessions(sessions, computers) {
  const tbody = document.getElementById('activeSessionsBody');
  if (sessions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="no-data">No active sessions.</td></tr>';
    return;
  }

  tbody.innerHTML = sessions.map(session => {
    const computer = computers.find(item => item.id === session.pcId);
    const durationMin = Math.ceil((new Date() - new Date(session.startTime)) / 60000);
    const rate = RATES[session.sessionType] || 20;
    const estimatedBill = (rate * durationMin / 60).toFixed(2);

    return `
      <tr>
        <td><a href="form-end-session.html?pc=${session.pcId}"><strong>PC ${session.pcNumber}</strong></a></td>
        <td>${session.customerName}</td>
        <td>${session.sessionType}</td>
        <td>${formatTime(session.startTime)}</td>
        <td>${formatDuration(durationMin)}</td>
        <td>₱${estimatedBill}</td>
        <td>${session.services.length ? session.services.join(', ') : 'None'}</td>
      </tr>
    `;
  }).join('');
}
