# Internet Café Customer Management & Computer Usage Monitoring System

**Course:** Bachelor in Information Technology  
**Activity:** Proposed Information System for Internet Cafe Operations  
**Organization:** GSC Internet Café — General Santos, Philippines  

---

## 👥 Group Members

| Role     | Name          |
|----------|---------------|
| 👑 Leader | Charlie Ong   |
| 👤 Member | (Member name) |
| 👤 Member | (Member name) |

**Instructor:** Abejah Paculdo  
**Date Submitted:** July 31, 2026  

---

## 📋 Project Description

A web-based system designed to help internet café staff manage day-to-day operations including:

- Assigning customers to available computers
- Tracking session start and end times
- Automatic billing based on usage duration and session type
- Recording additional services (printing, scanning, headset/webcam rentals)
- Daily transaction records and revenue monitoring

---

## 🗂️ Folder Structure

```
InternetCafeSystem/
│
├── index.html          ← Main application page
├── css/
│   └── style.css       ← All styling
├── js/
│   └── script.js       ← Application logic
├── images/             ← Logo and background images
└── README.md           ← Project documentation
```

---

## 🖥️ System Features

### Dashboard
- Live stats: active sessions, available PCs, today's revenue, transaction count
- Visual computer status grid (green = available, red = occupied, yellow = maintenance)

### Sessions Module
- **Form 1 — Start Session:** Assign a customer to a PC, choose session type, add optional services
- **Form 2 — End Session & Payment:** Calculate bill, accept payment, compute change, record transaction

### Computers Module
- **Form 3 — Add/Update Computer:** Manage computer inventory with specs, type, and status
- Computer table with edit and delete actions

### Transactions Module
- Full transaction history with date filter
- Revenue totals per day or overall

---

## 💰 Pricing

| Session Type | Rate        |
|-------------|-------------|
| Regular     | ₱20 / hour  |
| Gaming      | ₱30 / hour  |
| Student     | ₱15 / hour  |

| Service          | Price      |
|-----------------|------------|
| Printing         | ₱5 / page  |
| Scanning         | ₱10 / page |
| Headset Rental   | ₱5         |
| Webcam Rental    | ₱10        |

---

## 🚀 How to Run

1. Open the project folder in **Visual Studio Code**
2. Install the **Live Server** extension (if not already installed)
3. Right-click `index.html` → **Open with Live Server**
4. The system will open in your default browser

Or simply double-click `index.html` to open it directly in a browser.

---

## 🔐 Demo Login

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

---

## 🛠️ Technologies Used

- **HTML5** — Structure and semantic markup
- **CSS3** — Dark-themed responsive styling with CSS variables
- **JavaScript (ES6+)** — All business logic, form handling, dynamic rendering

---

## 📌 Category

**CRM (Customer Relationship Management)** with characteristics of a **Transaction Processing System (TPS)**
