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
cd backend
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
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
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
│   │   └── aiService.js         # Anthropic API abstraction
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
    │   │   │   └── DecisionTimeline.jsx # GSAP animated timeline
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

## 🚢 Production Deployment

### Backend (Node.js)

```bash
# Set NODE_ENV=production in .env
npm start

# Or with PM2
pm2 start server.js --name recalliq-api -i max
```

### Frontend (Static)

```bash
npm run build
# Serve /dist with nginx or Vercel/Netlify
```

### Nginx Config (Production)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    root /var/www/recalliq/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker (Optional)

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

---

## 🔒 Security Best Practices

- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Passwords hashed with bcrypt (12 rounds)
- Helmet.js for security headers
- Rate limiting on all API routes
- Stricter auth rate limiting (20 req/15min)
- Input validation with Joi
- MongoDB injection protection via Mongoose
- CORS restricted to frontend URL
- Request size limited to 5MB

---

## 🎮 Git & Deployment Commands

```bash
# Initialize git
git init
git add .
git commit -m "feat: initial RecallIQ AI MERN stack"
git branch -M main
git remote add origin https://github.com/yourusername/recalliq-ai
git push -u origin main
```

---

## 📦 Zip for Download

```bash
# From project root
zip -r recalliq-ai.zip recalliq-ai/ \
  --exclude "*/node_modules/*" \
  --exclude "*/.git/*" \
  --exclude "*/dist/*" \
  --exclude "*/logs/*"
```
