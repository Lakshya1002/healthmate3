# 💊 HealthMate - Personal Medicine & Health Tracker

**HealthMate** is a modern, full-stack web application designed to help users effortlessly track their daily medications. Built with a clean and responsive interface, it provides a seamless experience on both desktop and mobile devices.

This project was developed to showcase proficiency in the **MERN** stack (MySQL, Express, React, Node.js) and modern frontend design principles.

---

## ✨ Features

- **Intuitive Dashboard**: At-a-glance overview of your active and archived medications.
- **Multi-Page Navigation**: A seamless single-page application (SPA) experience with distinct pages for different tasks.
- **Focused "Add Medicine" Workflow**: A dedicated page with a multi-step form and a live preview to add or update medication details.
- **Advanced Filtering & Search**: Instantly search your regimen and switch between active and past medications with tabbed navigation.
- **Dual View Modes**: Toggle between a compact list view and a detailed grid view to organize your dashboard.
- **Fully Responsive**: Meticulously designed to provide a perfect user experience on any device, from mobile phones to desktops.
- **Modern UI/UX**: Built with a professional design system, smooth animations using Framer Motion, and user-friendly modals for a polished feel.

---

## ⚙️ Local Development Setup

Follow these steps to get the project running on your local machine.

---

### 1. Prerequisites

Make sure you have the following installed:

- [Node.js & npm](https://nodejs.org) (LTS version recommended)  
- [Git](https://git-scm.com)  
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)  
- [VS Code](https://code.visualstudio.com/) (or any preferred editor)

---

### 2. Initial Setup

#### A. Clone the Repository

```bash
git clone https://github.com/your-username/HealthMate.git
cd HealthMate
````


#### B. Set Up the Database

1. Start your local MySQL server.
2. Open your SQL client (e.g., MySQL Workbench, DBeaver, or command line).
3. Run the `create tables.sql` script located in the root directory to create the `healthmate` database and its tables.

---

### 3. Backend Setup

#### A. Navigate to Backend

```bash
cd backend
```

#### B. Install Production Dependencies

```bash
npm install express mysql2 cors dotenv
```

#### C. Install Development Dependencies

```bash
npm install -D nodemon
```

#### D. Create `.env` File

Create a `.env` file in the `backend` folder and add the following:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=healthmate
```

*(Replace `your_mysql_password` with your actual MySQL password)*

#### E. Start Backend Server

```bash
npm run dev
```

> Backend server will be running at: `http://localhost:5000`

---

### 4. Frontend Setup

#### A. Navigate to Frontend

```bash
cd ../frontend
```

#### B. Install Production Dependencies

```bash
npm install react react-dom axios framer-motion lucide-react react-hot-toast
```

#### C. Install Development Dependencies

```bash
npm install -D vite @vitejs/plugin-react eslint
```

#### D. Start Frontend Server

```bash
npm run dev
```

> Frontend will be running at: `http://localhost:5173`

---

