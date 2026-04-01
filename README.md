# ⚖️ Nyaya Saathi: Empowering Every Citizen

**Nyaya Saathi** is a comprehensive, role-based platform designed to bridge the gap between citizens and critical resources. It provides a secure, easy-to-use interface for legal aid, government scheme information, and seasonal job opportunities.

---

## 🚀 Key Features

### 🏢 Three Interactive Portals
-   **Client Portal**: Log in to register legal complaints, track the status of applications, and apply for high-demand seasonal or daily wage jobs.
-   **Employee Portal**: Post job listings with specific worker limits, manage ongoing projects, and review detailed applicant profiles in real-time.
-   **Admin Portal**: Oversee user management, monitor login activity across the platform, and ensure smooth operations.

### 🛡️ Secure Demo Authentication
To facilitate seamless demonstrations, we have implemented a **Robust Demo Authentication** system. 
-   Bypasses complex OAuth configurations using pre-defined roles.
-   Generates high-security JWT (JSON Web Tokens) for session management.
-   Automatically populates demo profiles with avatars and verified statuses.

### 📊 Modern Tech Stack
-   **Frontend**: React.js with Vite for lightning-fast performance.
-   **Styling**: Custom, premium CSS design with smooth micro-animations and a responsive layout.
-   **Backend**: Node.js & Express 5.0 (Experimental) for high-performance API handling.
-   **Database**: MongoDB Atlas with Mongoose for resilient data persistence.

---

## 🛠️ Setup & Installation

### 1. Project Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) and [npm](https://www.npmjs.com/) installed on your machine.

### 2. Install Dependencies
Run the installation script in the root directory to set up both frontend and backend:
```bash
npm run install:all
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory with the following variables:
```env
MONGO_URI=your_mongodb_cluster_uri

---

## 🎨 Premium UI Components
The project features a state-of-the-art **Dashboard Interface**:
-   **Profile Dropdown**: A centralized menu to switch between "Client," "Employee," and "Admin" views instantly.
-   **Job Tracking**: Real-time vacancy indicators (`15 spots left`) and visual "Job Full" badges.
-   **Applicant View**: Detailed candidate cards including photos, names, emails, and verification badges for employers.

---

## 👨‍💻 Development & Fixes
We have addressed several critical development hurdles:
-   **Express 5.0 Fix**: Resolved specific path-to-regexp errors with a unique catch-all middleware for SPA compatibility.
-   **Role Synchronization**: Fixed schema enum mismatches to ensure "Client" and "Employee" classifications are saved correctly.
-   **API Resilience**: Implemented error-handling wrappers to ensure 100% frontend stability even during high-load API events.

---

**© 2026 Nyaya Saathi Team. All Rights Reserved.**
