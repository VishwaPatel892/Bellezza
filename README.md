# Bellezza — The Science Behind Your Glow

Bellezza is a full-stack, evidence-based skincare application featuring personalized skin assessment, ingredient intelligence, real product discovery & comparison, AI skincare assistant, routines, and progress tracking.

---

## Project Structure

The project is organized into two clean, independent directories:

```
Bellezza/
├── frontend/               # React Native / Expo mobile & web client
│   ├── app/                # Expo Router screens and navigation
│   │   ├── (auth)/         # Onboarding, login, registration
│   │   ├── (tabs)/         # Bottom navigation tabs (Home, Explore, Routine, Assistant, Profile)
│   │   ├── assessment.jsx  # 7-step personalized skin assessment & intelligence report
│   │   ├── comparison.jsx  # Side-by-side product comparison matrix
│   │   ├── journal.jsx     # Daily skin check-in & photo progress
│   │   ├── remedy-detail.jsx # Evidence-backed home remedies
│   │   └── _layout.js      # Root layout & providers
│   ├── src/                # Reusable components, hooks, services, utils, constants
│   │   ├── components/     # Cards, inputs, buttons, headers
│   │   ├── constants/      # Brand colors, typography, spacing, Indian market presets
│   │   ├── context/        # AuthContext for session management
│   │   ├── hooks/          # Custom hooks (useAuth)
│   │   ├── services/       # Frontend API client & service wrappers
│   │   └── utils/          # Storage, formatters, Yup validation schemas
│   ├── assets/             # Branding icons, images, splash screens
│   ├── app.json            # Expo configuration (permissions, plugins)
│   ├── eas.json            # EAS cloud build profiles
│   ├── package.json        # Frontend dependencies (Expo SDK 58, React Native 0.88)
│   └── .env                # EXPO_PUBLIC_API_URL
│
├── backend/                # Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── config/         # Database and environment configurations
│   │   ├── controllers/    # Route controllers (auth, user, product, ingredient, etc.)
│   │   ├── integrations/   # Open Beauty Facts, PubChem, PubMed, Weather
│   │   ├── middleware/     # JWT authentication, validation, error handling
│   │   ├── models/         # Mongoose schemas (User, Product, Ingredient, Remedy, etc.)
│   │   ├── routes/         # Express API route declarations
│   │   ├── services/       # Core business logic & database queries
│   │   ├── utils/          # Token generation, ingredient normalizer, response helpers
│   │   ├── app.js          # Express app configuration & middleware
│   │   └── server.js       # Server bootstrap & MongoDB connection
│   ├── package.json        # Backend dependencies (Express, Mongoose, JWT, bcryptjs)
│   ├── .env                # PORT, MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
│   └── test-*.js           # Full backend test suites
│
├── package.json            # Root workspace scripts (convenience runners)
└── .gitignore              # Repository ignore rules
```

---

## Quick Start

### 1. Run the Backend Server
```bash
cd backend
npm install
npm start
```
* The backend runs on `http://localhost:5000`
* Health check: `http://localhost:5000/api/health`

### 2. Run the Frontend (Mobile & Web)
```bash
cd frontend
npm install
npx expo start
```
* **Web:** Press `w` in the terminal to view in your browser (`http://localhost:8081`).
* **Android / iOS:** Scan the QR code or enter the dev server URL in the **Expo Go** app.

### 3. Or Run from the Project Root
```bash
# Start Frontend
npm run start:frontend

# Start Backend
npm run start:backend

# Run Backend Tests
npm run test:all
```

---

## Tech Stack

* **Frontend:** Expo SDK 58, React Native 0.88, React 19.3, Expo Router, Formik, Yup, Expo Secure Store, Expo Notifications.
* **Backend:** Node.js, Express.js, MongoDB Atlas / local MongoDB, Mongoose, JWT, bcryptjs.
* **Language:** JavaScript only (`.js` and `.jsx`).
