<div align="center">

<br/>

```
 ██████╗ ██████╗ ██████╗ ███████╗██╗   ██╗███████╗██╗  ██╗████████╗ ██████╗ ██████╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝██║   ██║██╔════╝██║ ██╔╝╚══██╔══╝██╔═══██╗██╔══██╗
██║     ██║   ██║██║  ██║█████╗  ██║   ██║█████╗  █████╔╝    ██║   ██║   ██║██████╔╝
██║     ██║   ██║██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██╔═██╗    ██║   ██║   ██║██╔══██╗
╚██████╗╚██████╔╝██████╔╝███████╗ ╚████╔╝ ███████╗██║  ██╗   ██║   ╚██████╔╝██║  ██║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
```

**Master DSA. Ace Interviews. Ship Code.**

*An immersive, AI-powered platform for competitive programmers and interview candidates.*

<br/>

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/AI-Gemini_2.0-4285F4?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-a78bfa?style=for-the-badge)

<br/>

</div>

---

## ⚡ What is CodeVektor?

CodeVektor is a full-stack DSA and interview prep platform that combines a real-time code judge, AI-powered code review, and deep progress analytics — all wrapped in a dark, glassmorphic UI driven by GSAP animations.

Whether you're grinding LeetCode-style problems, practicing mock interviews, or tracking your daily streak, CodeVektor gives you everything in one place.

---

## 🔥 Features

| Feature | Description |
|---|---|
| 🧠 **AI Code Reviewer** | Instant analysis via Gemini 2.0 Flash — complexity, quality, and interview-style feedback |
| ⚡ **Real-time Judge** | Isolated code execution across JS, Python, Java, C++ with hidden test case validation |
| 📊 **Contribution Heatmap** | GitHub-style activity heatmap built live from submission history |
| 🔥 **Streak Tracking** | Timezone-safe daily streak with live UI updates on every accepted solve |
| 🎨 **Integrated Whiteboard** | Embedded Excalidraw for sketching logic before writing a single line of code |
| 📝 **Revision Logger** | Tag problems for review, track notes, and resurface weak topics |
| 🏆 **Dashboard Analytics** | Solve time, active coding time, difficulty breakdown, and rank progression |
| 🌑 **Immersive UI** | GSAP-animated dark theme with glassmorphism and glowing accents |

---

## 🛠️ Tech Stack

**Frontend**

![React](https://img.shields.io/badge/React.js-Vite-61DAFB?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-Animations-88CE02?style=flat-square)
![Excalidraw](https://img.shields.io/badge/Excalidraw-Whiteboard-6965DB?style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-Analytics-FF6384?style=flat-square)

**Backend**

![Node](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)

---

## 🚀 Getting Started

### Prerequisites

- Node.js **v18+**
- MongoDB (local or Atlas)
- Google Gemini API Key → [Get one here](https://makersuite.google.com/app/apikey)

### 1 · Clone

```bash
git clone https://github.com/rajjj108/codevektor.git
cd codevektor
```

### 2 · Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3 · Configure Environment

**`server/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key

# Optional — Redis job queue
REDIS_URL=redis://localhost:6379
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4 · Run

```bash
# Terminal 1 — Backend + Judge Worker
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

> App runs at **http://localhost:5173**

---

## 🗂️ Project Structure

```
CodeVektor/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── api/               # Axios config & endpoint definitions
│       ├── components/        # Dashboard, Editor, AI Review, Heatmap…
│       ├── pages/             # Route-level views
│       └── utils/             # Auth helpers, formatters
│
├── server/                    # Express backend
│   ├── controllers/           # Submissions, Auth, Dashboard, AI
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routers
│   ├── utils/                 # Streak helpers, Gemini fallback logic
│   ├── server.js              # Entry point
│   └── judgeWorker.js         # Background code runner
│
└── README.md
```

---

## 🛡️ Security Notes

- Never commit `.env` files — add them to `.gitignore` before your first push
- All code execution runs in **isolated Docker sandboxes** — no host access
- JWT tokens are short-lived; refresh logic is handled client-side

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

[ISC](https://choosealicense.com/licenses/isc/) © CodeVektor

---

<div align="center">

Built with 🔥 by developers who know the grind.

*If this helped you land an offer, drop a ⭐*

</div>