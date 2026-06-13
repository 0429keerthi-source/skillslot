# SkillSlot MVP — Starter Code

A student-first freelance marketplace where students earn from skills and get discovered by startups.

---

## Setup in 5 steps

### 1. Install dependencies
npm install

### 2. Set up Firebase
- Go to firebase.google.com → create project "skillslot"
- Click Web app → copy config
- Open src/firebase/config.js → paste your values
- Enable: Authentication (Email/Password), Firestore (test mode), Storage (test mode)

### 3. Run the app
npm start → opens at http://localhost:3000

---

## All screens built

| Screen | File | Who sees it |
|--------|------|-------------|
| Splash | SplashScreen.js | Everyone |
| Role select | RoleSelectScreen.js | Everyone |
| Student signup | SignupScreen.js | Students |
| Startup signup | StartupSignupScreen.js | Startups |
| Login | LoginScreen.js | Everyone |
| Student dashboard | HomeScreen.js | Students |
| Startup dashboard | StartupHomeScreen.js | Startups |

## Coming in Week 3–4
- Post a gig (students)
- Browse marketplace
- Post a project (startups)
- Browse students (startups)
- Razorpay payments

---

## User flows

### Student flow
Splash → Role select → Student signup (4 steps) → Student dashboard

### Startup flow
Splash → Role select → Startup signup (3 steps) → Startup dashboard

### Login flow
Splash → Login → Student OR Startup dashboard (auto-detected)

---

## Firestore database structure

students/
  {uid}/
    name, email, college, skills, bio, city
    rating, jobsDone, totalEarned, skillCoins
    profileComplete, createdAt

startups/
  {uid}/
    companyName, email, type, industry, city
    website, description, hiringFor, budget
    role, verified, plan, projectsPosted, studentsHired
    createdAt
