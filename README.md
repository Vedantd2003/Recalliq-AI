# RecallIQ AI 🧠
### AI-Powered Meeting Memory Engine

> Not a summarizer. An operational intelligence system that extracts decisions, tracks accountability, predicts risk, and generates follow-ups from meeting transcripts.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

### 1. Clone & Install

```bash
# Install backend
cd recalliq-ai/backend
npm install
cp .env.example .env
# Fill in your .env values

# Install frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure Environment

**Backend `.env`:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recalliq-ai
JWT_SECRET=your_secret_min_32_chars_here
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
GEMINI_API_KEY=your_gemini_api_key_here
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development

```bash
# Terminal 1 - Backend
cd recalliq-ai/backend && npm run dev

# Terminal 2 - Frontend
cd recalliq-ai/frontend && npm run dev
```

Visit: http://localhost:5173

---

## 📁 Project Structure

```
recalliq-ai/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Auth CRUD
│   │   ├── meetingController.js # Meeting + AI analysis
│   │   ├── usageController.js   # Credit tracking
│   │   └── userController.js    # User management
│   ├── middleware/
│   │   ├── auth.js              # JWT + role-based auth
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── notFound.js          # 404 handler
│   │   └── validate.js          # Joi validation
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Meeting.js           # Meeting model
│   │   ├── Decision.js          # Decision model
│   │   ├── ActionItem.js        # Action item model
│   │   └── Usage.js             # Usage tracking
│   ├── routes/
│   │   ├── auth.js              # /api/auth/*
│   │   ├── meetings.js          # /api/meetings/*
│   │   ├── usage.js             # /api/usage/*
│   │   └── users.js             # /api/users/*
│   ├── services/
│   │   └── aiService.js         # Gemini API abstraction
│   ├── utils/
│   │   ├── jwt.js               # Token utilities
│   │   ├── logger.js            # Winston logger
│   │   └── response.js          # Response helpers
│   ├── validators/
│   │   └── schemas.js           # Joi validation schemas
│   ├── app.js                   # Express app
│   ├── server.js                # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── three/
    │   │   │   └── NeuralBrain.jsx    # Three.js neural brain
    │   │   ├── dashboard/
    │   │   │   └── DecisionTimeline.jsx # Animated timeline
    │   │   ├── layout/
    │   │   │   └── DashboardLayout.jsx  # Sidebar layout
    │   │   └── ui/
    │   │       └── index.jsx            # Reusable UI components
    │   ├── context/
    │   │   └── authStore.js             # Zustand auth state
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── MeetingsPage.jsx
    │   │   ├── NewMeetingPage.jsx
    │   │   ├── MeetingDetailPage.jsx
    │   │   ├── UsagePage.jsx
    │   │   └── ProfilePage.jsx
    │   ├── services/
    │   │   └── api.js               # Axios + interceptors
    │   ├── App.jsx                  # Routes
    │   ├── main.jsx
    │   └── index.css                # TailwindCSS + custom styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🔌 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh tokens |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |

### Meetings
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/meetings | Analyze meeting (AI) |
| GET | /api/meetings | List meetings |
| GET | /api/meetings/stats | Dashboard stats |
| GET | /api/meetings/:id | Get full meeting |
| DELETE | /api/meetings/:id | Archive meeting |
| PATCH | /api/meetings/:id/action-items/:itemId | Update action item |
| POST | /api/meetings/:id/regenerate-email | Regen email |

### Usage
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/usage | Usage history |
| GET | /api/usage/credits | Credit balance |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users/profile | Get profile |
| PATCH | /api/users/profile | Update profile |

---

## 🚢 Deploy to Render.com

This repo includes `render.yaml` (blueprint) that automatically creates:

- **Web service** `recalliq-api` (Node backend)
- **Static site** `recalliq-frontend` (Vite build output)

### Steps:

1. **Connect your GitHub repository** to Render.com
2. **Create a new Blueprint** from the `render.yaml` file
3. **Set the following environment variables** on the backend service:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `JWT_SECRET` - A secure random string (min 32 characters)
   - `JWT_REFRESH_SECRET` - Another secure random string (min 32 characters)
   - `FRONTEND_URL` - Your frontend URL (e.g., https://recalliq-frontend.onrender.com)
4. **Set `VITE_API_URL`** on the frontend service to: `https://recalliq-api.onrender.com/api`

### Docker (Optional)

```bash
docker compose up --build
```

Frontend: `http://localhost:5173`  
API health: `http://localhost:5000/health`

---

## 🔒 Security Features

- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Passwords hashed with bcrypt (12 rounds)
- Helmet.js for security headers
- Rate limiting on all API routes
- Input validation with Joi
- MongoDB injection protection via Mongoose
- CORS restricted to frontend URL
- Request size limited to 5MB

---

## 📦 Credits System

- New users get 100 free credits
- Each meeting analysis costs 10 credits
- Credits can be purchased (future feature)

---

## 🛠 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Google Gemini AI
- Winston Logger
- Joi Validation

**Frontend:**
- React 18 + Vite
- TailwindCSS
- Three.js (NeuralBrain visualization)
- Zustand (State management)
- Axios (API client)

---

## 📄 License

MIT License

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
