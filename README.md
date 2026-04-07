---

                    # 🚧 BuildAI - Smart Construction Planning Platform 🤖🏗️

          > *“Planning construction shouldn't feel like guesswork — BuildAI makes it intelligent.”*

---

## 👥 Team Details

* **Team Name:** 🔴 *Among Us*
* **Team Leader:** 👑 *Raghav Mohan Gupta (You)*
* 🧠 Developed & Presented at: **KIET Hackathon (AI Arena Theme)**
  *(Previously showcased in KIET AI Arena Hackathon for validation & exposure 💪)*

---

## 🌟 Project Overview

**BuildAI** is an AI-powered construction planning platform designed to simplify and optimize the entire construction lifecycle — from **cost estimation** to **timeline prediction** and even **automated architectural floor plans**.

💡 Whether you're a homeowner, contractor, or planner — BuildAI removes uncertainty and replaces it with intelligent insights.

---

## 🚀 Key Features

### 🧠 AI-Powered Predictions

* 💰 **Cost Calculator** – Accurate construction cost estimation
* ⏳ **Timeline Predictor** – AI-based duration prediction using Groq
* 👷 **Worker Estimator** – Calculates required manpower

---

### 🏠 Architectural Intelligence

* 🧾 **AI Floor Plan Generator** (Gemini AI)
* 🛋️ **Fully Furnished Layouts** with real-world elements
* 🧭 **Vastu-Compliant Designs**

---

### 👤 Role-Based System

* 👨‍💻 **User** – Create & manage projects
* 🛠️ **Contractor** – Handle assigned projects
* 🧑‍💼 **Admin** – Platform & user management

---

## 🛠️ Tech Stack

| Layer       | Technology            |
| ----------- | --------------------- |
| ⚙️ Backend  | Python, Flask, SQLite |
| 🎨 Frontend | React, Vite           |
| 🤖 AI APIs  | Groq AI, Gemini AI    |
| 💅 Styling  | Tailwind CSS          |

---

## ⚡ Getting Started

### 🔧 Prerequisites

* Python 3.8+
* Node.js 16+
* npm / yarn

---

### 🖥️ Installation Guide

#### 1️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
python3 -m app
```

🔗 Runs on: [http://localhost:5000](http://localhost:5000)

---

#### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

🔗 Runs on: [http://localhost:5173](http://localhost:5173)

---

#### 3️⃣ Launch App

```bash
open http://localhost:5173
```

---

## 🔐 Default Login Credentials

| Role          | Email                                                   | Password      |
| ------------- | ------------------------------------------------------- | ------------- |
| 👤 User       | [user@buildai.com](mailto:user@buildai.com)             | user123       |
| 🧑‍💼 Admin   | [admin@buildai.com](mailto:admin@buildai.com)           | admin123      |
| 👷 Contractor | [contractor@buildai.com](mailto:contractor@buildai.com) | contractor123 |

---

## 📂 Project Structure

```
BuildAI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── services/
│   │       ├── architect.py
│   │       └── prediction.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## 🔌 API Endpoints

### 🔐 Authentication

* `POST /api/login`
* `POST /api/register`

### 📁 Projects

* `GET /api/projects`
* `POST /api/projects`
* `GET /api/projects/<id>`

### 🤖 AI Services

* `POST /api/predict`
* `POST /api/architect`

---

## 📖 Usage Guide

### 🏗️ Create a Project

1. Login
2. Click **New Project**
3. Enter plot details
4. Select features
5. Submit

---

### 📊 Get Predictions

1. Go to **Prediction Tab**
2. Enter details
3. Click **Predict**
4. View cost, time & workforce

---

### 🏠 Generate Floor Plan

1. Open **Architect Tab**
2. Enter room requirements
3. Click **Generate Layout**
4. Get AI-generated plan

---

## 🧩 Floor Plan Highlights

* 📏 Room dimensions & labels
* 🛋️ Furniture placement
* 🚿 Fixtures (toilet, sink, kitchen)
* 🧭 Direction compass
* 🌳 Garden & parking
* 🌑 Depth & shadow effects

---

## ⚠️ Troubleshooting

### 🚫 Port Already in Use

```bash
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

---

### 📦 Install Dependencies

```bash
cd backend
pip install -r requirements.txt

cd frontend
npm install
```

---

### 🗑️ Reset Database

```bash
rm backend/instance/buildai.db
python3 -m app
```

---

## 🗄️ Database Schema

* 👤 `users` – account & roles
* 📁 `projects` – construction data
* 📊 `predictions` – AI results

---

## 🔒 License

🚫 Private Project – All Rights Reserved

---

## 💬 Final Note

💡 *BuildAI is not just a project — it's a step toward transforming how construction planning works using AI.*

🚀 Built with passion by **Team Among Us**
🔥 Ready to disrupt traditional construction workflows

---
