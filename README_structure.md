# Nyaya Saathi Project Structure Overview

This document provides a detailed overview of the project structure for the **Nyaya Saathi** application, a platform for rural empowerment and legal aid.

## Root Directory
- `backend/`: Node.js/Express server and database logic.
- `frontend/`: React/Vite client application.
- `nyaya-saathi/`: Potential legacy/reference directory.
- `drop_index.js`: Utility script for managing MongoDB indexes.
- `package.json`: Manages project-level dependencies and scripts.

---

## Backend (`/backend`)
The backend is built with **Node.js**, **Express**, and **MongoDB (Mongoose)**.

- **`server.js`**: Central server file containing API routes (Auth, Jobs, Schemes, Complaints, Notifications).
- **`models/`**: MongoDB schema definitions:
  - `Complaint.js`: Structure for legal/grievance submissions.
  - `Job.js`: Data model for rural job opportunities.
  - `Notification.js`: Real-time alerts for users.
  - `Scheme.js`: Welfare scheme details.
  - `User.js`: User profiles (Client, Employee, Admin).
- **`.env`**: Configuration for database connection and sensitive keys.

---

## Frontend (`/frontend`)
The frontend is a **React** single-page application (SPA) scaffolded with **Vite**.

- **`src/`**: Main source code:
  - **`Dashboard.jsx`**: The primary interface for users to interact with jobs, schemes, and complaints (69 KB - contains core logic).
  - **`Login.jsx`**: Handles authentication and role-based access.
  - **`App.jsx`**: Main navigation and routing setup.
  - **`translations.js`**: Support for multiple languages (crucial for rural demographics).
  - **`index.css` & `App.css`**: Global and component-specific styling.
- **`public/`**: Static assets like logos and icons.
- **`vite.config.js`**: Vite build configuration.

---

## Key Feature Flows
1. **User Authentication**: Handled via role-based logic in `/backend/server.js` and `/frontend/src/Login.jsx`.
2. **Dashboard Management**: Centralized in `/frontend/src/Dashboard.jsx`, interacting with CRUD operations for Jobs, Schemes, and Complaints.
3. **Data Persistence**: MongoDB stores all records via the models in `/backend/models/`.
