/**
 * login.js — Login page logic
 * Internet Café Customer Management & Computer Usage Monitoring System
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, skip the login page and go to dashboard
  if (sessionStorage.getItem('loggedIn') === 'true') {
    window.location.href = 'dashboard.html';
    return;
  }

  // Pre-fill username if "Remember Me" was checked before
  const saved = localStorage.getItem('rememberedUser');
  if (saved) {
    document.getElementById('loginUser').value = saved;
    document.getElementById('rememberMe').checked = true;
  }
});

function handleLogin(event) {
  event.preventDefault();

  const user     = document.getElementById('loginUser').value.trim();
  const pass     = document.getElementById('loginPass').value;
  const remember = document.getElementById('rememberMe').checked;
  const errorEl  = document.getElementById('loginError');

  errorEl.textContent = '';

  if (!user) {
    errorEl.textContent = 'Please enter your username.';
    return;
  }
  if (!pass) {
    errorEl.textContent = 'Please enter your password.';
    return;
  }

  if (user === 'admin' && pass === 'admin123') {
    if (remember) {
      localStorage.setItem('rememberedUser', user);
    } else {
      localStorage.removeItem('rememberedUser');
    }
    sessionStorage.setItem('loggedIn', 'true');
    sessionStorage.setItem('flashMsg', 'Welcome back, Admin!');
    window.location.href = 'dashboard.html';
  } else {
    errorEl.textContent = 'Invalid username or password. Try: admin / admin123';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
  }
}

function togglePassword() {
  const input = document.getElementById('loginPass');
  input.type  = input.type === 'password' ? 'text' : 'password';
}
