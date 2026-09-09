# MCQ Test System - Full Implementation Guide

Give these steps one by one, in order, to your AI IDE. Do not skip any.
Each step ends with a git commit instruction - commit after every step,
no matter how small. Backend is fully built first (steps 1-15), then
frontend is fully built after (steps 16-30+).

---

## The Idea (read this first, do not implement yet)

This is an MCQ (multiple choice) test conducting system for a fixed
group of teams (around 100), built with MERN stack (MongoDB, Express,
React, Node) and MongoDB Atlas free tier for the database.

There are two types of users:

**Admin** - one person (or a few) who sets up the test.
- Admin creates login credentials (username + password) for each team
  before the test starts. Teams do not self-register.
- Admin adds the MCQ questions with 4 options and marks the correct one.
- Admin can see which teams have submitted and which have not.
- Admin clicks a "Calculate Results" button after the test window is
  over, which scores every submission automatically by comparing
  submitted answers against correct answers.
- Ranking rule: higher score is better. If two teams have the same
  score, whoever finished in less time (measured from when they started
  the test to when they submitted) is ranked higher.
- Admin can download a PDF per team showing team name, every question
  with the answer that team selected, and total time taken.

**Team** - logs in with the credentials the admin created for them.
- Once a team logs in and starts the test, a timer of exactly 1 hour
  starts. This timer must be tracked by the backend (using a stored
  start time), not just the browser, so a page refresh or closing the
  tab does not reset it or give the team more time.
- Team answers MCQ questions one by one or on one page (implementation
  detail decided later), then clicks Submit.
- Once submitted, the team cannot submit again, cannot restart the
  test, and cannot get extra time.
- If the timer runs out and the team never clicks Submit, the test
  auto-submits whatever answers were selected so far.

**Data flow summary:**
1. Admin creates team credentials -> stored in database.
2. Admin creates questions -> stored in database.
3. Team logs in -> backend records start time -> team answers questions.
4. Team clicks submit (or timer runs out) -> answers + time taken sent
   to backend and stored, submission locked.
5. Admin clicks Calculate -> backend scores every submission and ranks
   them by score then by time.
6. Admin views results table and can download a PDF per team.

**Why this design is safe and correct:**
- All critical checks (timer expiry, one submission per team, correct
  scoring) happen on the backend, never trusted from the frontend
  alone, because frontend values can be manipulated by the user.
- Free MongoDB Atlas (M0 tier) is more than enough for ~100 teams,
  a handful of questions, and their submissions - this is a small
  amount of data (a few MB at most).

Two folders in the project: `backend/` and `frontend/`. Backend is
built completely first, tested, then frontend is built to consume it.

Now proceed to Step 1.

---

## Step 1: Root Project Setup [DONE]

Task:
1. Create root folder `mcq-test-system`. [x]
2. Add a `.gitignore` file in root excluding: `backend/node_modules/`,
   `frontend/node_modules/`, `backend/.env`, `frontend/.env`,
   `frontend/build/`, `*.log`, `.DS_Store`, `.vscode/`, `.idea/`. [x]
3. Run `git init` in root, then `git add .gitignore` and commit. [x]
4. Create empty folders `backend/` and `frontend/` inside root. [x]

Commit: `chore: init repo with gitignore and folder structure` [x]

---

## Step 2: Backend Skeleton [DONE]

Task:
1. Inside `backend/`, run `npm init -y`. [x]
2. Install: `express mongoose bcryptjs jsonwebtoken dotenv cors`. [x]
3. Install dev dependency: `nodemon`. [x]
4. Create `backend/server.js`: Express app, `cors()`, `express.json()`
   middleware, a `GET /` route returning `{status: "ok"}`, and
   `app.listen(process.env.PORT || 5000)`. [x]
5. Create `backend/.env` with `PORT=5000`, `MONGO_URI=`, `JWT_SECRET=`. [x]
6. Add `"dev": "nodemon server.js"` and `"start": "node server.js"`
   scripts to `backend/package.json`. [x]

Commit: `feat(backend): basic express server skeleton` [x]

---

## Step 3: MongoDB Atlas Connection

Task:
1. Create a free MongoDB Atlas account and free M0 cluster (manual step
   outside the IDE, done by you in the browser).
2. Create a database user and whitelist IP `0.0.0.0/0`.
3. Copy the connection string into `backend/.env` as `MONGO_URI`.
4. Create `backend/config/db.js` exporting `connectDB()` that connects
   using mongoose, logs success, or exits process on failure.
5. Call `connectDB()` in `server.js` before `app.listen`.

Commit: `feat(backend): mongodb atlas connection setup`

---

## Step 4: Database Models

Task: create these files under `backend/models/`.

**Admin.js** - `username` (String, unique), `passwordHash` (String).

**Team.js** - `teamName` (String), `username` (String, unique),
`passwordHash` (String), `createdAt` (Date, default now).

**Question.js** - `questionText` (String), `options` (Array of
String), `correctOption` (String).

**Submission.js**:
- `teamId` (ObjectId, ref Team)
- `answers` (Array of `{ questionId, selectedOption }`)
- `score` (Number, default null)
- `startTime` (Date)
- `endTime` (Date)
- `timeTakenMs` (Number)
- `submitted` (Boolean, default false)

Commit: `feat(backend): mongoose models for admin, team, question, submission`

---

## Step 5: JWT Auth Middleware

Task:
1. Create `backend/middleware/auth.js` exporting `verifyToken(req, res,
   next)`: reads `Authorization: Bearer <token>` header, verifies with
   `JWT_SECRET`, attaches `req.user = { id, role }`, else returns 401.
2. Create `backend/middleware/isAdmin.js` exporting middleware that
   checks `req.user.role === "admin"`, else returns 403.

Commit: `feat(backend): jwt auth and role middleware`

---

## Step 6: Admin Login + Seed Script

Task:
1. Create `backend/controllers/authController.js` with `adminLogin(req,
   res)`: find admin by username, compare password with bcrypt, on
   success sign JWT `{ id, role: "admin" }` expiry 8h, return token.
2. Create `backend/routes/authRoutes.js` with `POST /admin/login`.
3. Mount route in `server.js` at `/api/auth`.
4. Create `backend/seedAdmin.js`, a standalone script (run manually
   with `node seedAdmin.js`, not part of server startup) that inserts
   one admin user with a bcrypt-hashed password.

Commit: `feat(backend): admin login endpoint and seed script`

---

## Step 7: Team Login

Task:
1. Add `teamLogin(req, res)` to `authController.js`: find team by
   username, compare password with bcrypt, on success sign JWT `{ id,
   role: "team" }` expiry 2h, return token and teamName.
2. Add `POST /team/login` to `authRoutes.js`.

Commit: `feat(backend): team login endpoint`

---

## Step 8: Admin Creates Teams

Task:
1. Create `backend/controllers/adminController.js` with
   `createTeam(req, res)`: body `teamName, username, password`, hash
   password with bcrypt, save new Team, reject if username exists.
2. Create `backend/routes/adminRoutes.js`, mount `POST /create-team`
   protected by `verifyToken` + `isAdmin`.
3. Mount `adminRoutes.js` in `server.js` at `/api/admin`.

Commit: `feat(backend): admin create team endpoint`

---

## Step 9: Admin Lists Teams

Task:
1. Add `listTeams(req, res)` to `adminController.js`: return all teams
   with submission status (query Submission by teamId), never return
   `passwordHash`.
2. Add `GET /teams` route, protected.

Commit: `feat(backend): admin list teams with submission status`

---

## Step 10: Admin Manages Questions

Task:
1. Add to `adminController.js`: `addQuestion`, `getQuestions` (admin
   view, includes `correctOption`), `deleteQuestion`.
2. Add routes: `POST /questions`, `GET /questions`, `DELETE
   /questions/:id`, all protected.

Commit: `feat(backend): admin question management endpoints`

---

## Step 11: Test Start (Team Side)

Task:
1. Create `backend/controllers/testController.js` with `startTest(req,
   res)`: `req.user.id` is teamId from JWT.
   - Find Submission by teamId.
   - If none exists, create one with `startTime = Date.now()`,
     `submitted = false`.
   - If exists and `submitted = true`, return 403 "already submitted".
   - If exists and not submitted, return the existing `startTime`
     unchanged (so refresh does not reset the timer).
2. Create `backend/routes/testRoutes.js`, mount `GET /start` protected
   by `verifyToken`, checking `req.user.role === "team"`.
3. Mount `testRoutes.js` at `/api/test` in `server.js`.

Commit: `feat(backend): start test endpoint with startTime persistence`

---

## Step 12: Team Fetches Questions

Task:
1. Add `getTestQuestions(req, res)` to `testController.js`: return all
   questions with `correctOption` field stripped out before sending.
2. Add `GET /questions` route in `testRoutes.js`, protected, team role.

Commit: `feat(backend): team-facing questions endpoint without answers`

---

## Step 13: Submit Test

Task:
1. Add `submitTest(req, res)` to `testController.js`:
   - Find Submission by teamId.
   - If `submitted = true` already, return 403 "already submitted".
   - Set `endTime = Date.now()`, `timeTakenMs = endTime - startTime`.
   - Save `answers` array from request body.
   - Set `submitted = true`.
2. Add optional `autosaveAnswers(req, res)`: saves `answers` into the
   submission without setting `submitted`, used for periodic backup
   saves from frontend, does not touch `endTime`.
3. Add `POST /submit` and `POST /autosave` routes in `testRoutes.js`,
   protected, team role.

Commit: `feat(backend): submit and autosave endpoints with idempotency`

---

## Step 14: Score Calculation and Ranking

Task:
1. Add `calculateResults(req, res)` to `adminController.js`:
   - Loop all submissions where `submitted = true`.
   - For each, compare each `answers[i].selectedOption` to the
     matching `Question.correctOption`, count correct answers,
     compute `score`.
   - Save `score` back to the submission.
   - Fetch all scored submissions, sort by `score` DESC, then
     `timeTakenMs` ASC for ties, assign `rank` in the response (rank
     is computed on read, not stored).
   - Return the sorted list with teamName, score, timeTakenMs, rank.
2. Add `POST /calculate-results` and `GET /results` routes in
   `adminRoutes.js`, protected.

Commit: `feat(backend): score calculation and ranking logic`

---

## Step 15: PDF Generation

Task:
1. Install `pdfkit` in backend.
2. Create `backend/utils/generatePdf.js` exporting
   `generateTeamPdf(res, team, submission, questions)`: streams a PDF
   directly to `res` (do not save to disk), containing team name, each
   question text with the answer that team selected, and total time
   taken formatted as mm:ss.
3. Add `downloadTeamPdf(req, res)` to `adminController.js` using this
   util.
4. Add `GET /pdf/:teamId` route in `adminRoutes.js`, protected.
5. Add a global error handler middleware at the end of `server.js`.

Commit: `feat(backend): pdf generation and global error handler`

---

## Step 16: Backend Full Verification (backend is now complete)

Task:
1. Confirm every route from steps 6-15 is correctly mounted in
   `server.js` under `/api/auth`, `/api/admin`, `/api/test`.
2. Manually test every endpoint with Postman or Thunder Client:
   - Seed one admin, login as admin.
   - Create 2-3 dummy teams, login as each team.
   - Add 5 dummy questions.
   - Start test for a team, fetch questions, submit answers.
   - Try submitting again for the same team, confirm it is rejected.
   - Run calculate-results, confirm scores and ranking are correct.
   - Download PDF for one team, confirm content is correct.
3. Fix any bugs found before moving to frontend.

Commit: `test(backend): verified all endpoints manually, backend complete`

---

## Step 17: Frontend Skeleton

Task:
1. Inside `frontend/`, run `npx create-react-app .`.
2. Install `axios` and `react-router-dom`.
3. Create `frontend/.env` with `REACT_APP_API_URL=http://localhost:5000/api`.
4. Create `frontend/src/services/api.js`: an axios instance using
   `REACT_APP_API_URL`, with a request interceptor that attaches the
   JWT from localStorage to every request's `Authorization` header.
5. Set up `App.jsx` with `react-router-dom` routes (empty placeholder
   components for now): `/admin/login`, `/admin/dashboard`,
   `/admin/teams`, `/admin/questions`, `/admin/results`, `/team/login`,
   `/test`, `/submitted`.

Commit: `feat(frontend): react app skeleton with routing and api service`

---

## Step 18: Admin Login Page

Task:
1. Create `frontend/src/pages/AdminLogin.jsx`: form (username,
   password), calls `/auth/admin/login`, stores JWT and role
   `"admin"` in localStorage on success, redirects to
   `/admin/dashboard`.
2. Wire the route in `App.jsx`.

Commit: `feat(frontend): admin login page`

---

## Step 19: Route Protection Helper

Task:
1. Create `frontend/src/components/ProtectedRoute.jsx`: a wrapper
   component that checks localStorage for a token and expected role,
   redirects to the correct login page if missing or mismatched,
   otherwise renders the child route.
2. Wrap all admin and team routes in `App.jsx` with this component,
   passing the required role (`"admin"` or `"team"`).

Commit: `feat(frontend): protected route wrapper for admin and team pages`

---

## Step 20: Admin Dashboard

Task:
1. Create `frontend/src/pages/AdminDashboard.jsx`: simple page with
   navigation links to Create/Manage Teams, Manage Questions, View
   Results, and a Logout button that clears localStorage.
2. Wire route.

Commit: `feat(frontend): admin dashboard page`

---

## Step 21: Admin - Create/List Teams Page

Task:
1. Create `frontend/src/pages/ManageTeams.jsx`:
   - Form to create a team (teamName, username, password), calls
     `/admin/create-team`.
   - Below the form, a table listing all teams from `/admin/teams`
     with their submission status (submitted / not submitted).
2. Wire route.

Commit: `feat(frontend): admin manage teams page`

---

## Step 22: Admin - Manage Questions Page

Task:
1. Create `frontend/src/pages/ManageQuestions.jsx`:
   - Form to add a question: text field, 4 option fields, a way to
     mark which option is correct, calls `/admin/questions` (POST).
   - List of existing questions fetched from `/admin/questions` (GET),
     each with a delete button calling `/admin/questions/:id` (DELETE).
2. Wire route.

Commit: `feat(frontend): admin manage questions page`

---

## Step 23: Admin - View Results Page

Task:
1. Create `frontend/src/pages/ViewResults.jsx`:
   - "Calculate Results" button calling `/admin/calculate-results`.
   - Table showing rank, team name, score, time taken (formatted as
     mm:ss), submitted status, fetched from `/admin/results`.
   - "Download PDF" button per row linking to `/admin/pdf/:teamId`.
2. Wire route.

Commit: `feat(frontend): admin view results page with calculate and pdf download`

---

## Step 24: Team Login Page

Task:
1. Create `frontend/src/pages/TeamLogin.jsx`: form (username,
   password), calls `/auth/team/login`, stores JWT, role `"team"`, and
   teamName in localStorage on success, redirects to `/test`.
2. Wire route.

Commit: `feat(frontend): team login page`

---

## Step 25: Test Page - Fetch Data and Timer

Task:
1. Create `frontend/src/pages/TestPage.jsx`:
   - On mount, call `/test/start`. If backend responds "already
     submitted", redirect immediately to `/submitted`.
   - Store the returned `startTime`.
   - Call `/test/questions` to load all questions into state.
   - Compute `remainingMs = startTime + 3600000 - Date.now()`.
   - Run a `setInterval` every 1000ms updating a countdown display
     (mm:ss format).
2. Wire route (protected, team role).

Commit: `feat(frontend): test page with server-synced countdown timer`

---

## Step 26: Test Page - Answering Questions

Task:
1. In `TestPage.jsx`, render each question with its 4 options as
   radio buttons.
2. Store selected answers in component state, keyed by questionId,
   e.g. `{ [questionId]: selectedOption }`.
3. Show a progress indicator (e.g. "3 of 10 answered").

Commit: `feat(frontend): question rendering and answer selection state`

---

## Step 27: Test Page - Autosave

Task:
1. In `TestPage.jsx`, add a `setInterval` running every 30 seconds
   that sends the current answers state to `/test/autosave`, as a
   silent background call (no visible loading state needed, just a
   small "saved" indicator if desired).
2. Clear this interval on component unmount.

Commit: `feat(frontend): periodic autosave of answers during test`

---

## Step 28: Test Page - Submit

Task:
1. In `TestPage.jsx`, add a Submit button that:
   - Converts the answers state object into the array format the
     backend expects: `[{ questionId, selectedOption }]`.
   - Calls `/test/submit`.
   - Redirects to `/submitted` on success.
   - Disables itself immediately after click to prevent double-submit
     from the UI (backend still enforces this independently).
2. Wire the countdown from Step 25: when `remainingMs <= 0`, trigger
   this same submit function automatically.

Commit: `feat(frontend): manual and auto-submit on timeout`

---

## Step 29: Submitted Confirmation Page

Task:
1. Create `frontend/src/pages/SubmittedPage.jsx`: displays "Test
   submitted successfully", clears any local test-specific state (not
   the login token), no way to navigate back into the test.
2. Wire route.

Commit: `feat(frontend): submitted confirmation page`

---

## Step 30: End-to-End Testing

Task:
1. Using the admin UI, create 3 dummy teams and 5 dummy questions.
2. Run the full flow for each team: login, start, answer some
   questions, submit.
3. Refresh the test page mid-test for one team, confirm the timer
   continues correctly from the server `startTime` and does not reset.
4. Open the same team's test in two tabs, confirm both show the same
   timer, and after submitting in one tab, the other is blocked from
   submitting again.
5. Let one team's timer run out without clicking submit, confirm
   auto-submit fires with whatever answers were selected.
6. In admin, click Calculate Results, confirm ranking is correct
   (score desc, time asc for ties).
7. Download PDF for at least one team, confirm the content (name,
   answers, time) matches what was actually submitted.

Commit: `test: verified full end-to-end flow across login, timer, submit, ranking, pdf`

---

## Step 31: Deployment Prep

Task:
1. Add `frontend/.env.production` with `REACT_APP_API_URL` pointing to
   a placeholder for the future deployed backend URL.
2. Add a root-level `README.md` with local run instructions: backend
   `npm run dev` inside `backend/`, frontend `npm start` inside
   `frontend/`, and the required `.env` variables for both.
3. Double check `.gitignore` is correctly excluding `node_modules`,
   `.env`, and `build` in both folders (confirm with `git status`
   showing none of these tracked).

Commit: `chore: deployment prep and local run instructions`

---

## Step 32: Deploy

Task:
1. Deploy `backend/` to Render or Railway free tier, set `MONGO_URI`
   and `JWT_SECRET` as environment variables in the hosting dashboard
   (not committed to git).
2. Deploy `frontend/` to Vercel or Netlify free tier, set
   `REACT_APP_API_URL` to the live backend URL.
3. Update MongoDB Atlas network access if the hosting provider gives a
   fixed IP, otherwise `0.0.0.0/0` is fine at this scale.
4. Run one final live end-to-end test with a real dummy team against
   the deployed system.

Commit: `chore: deployed backend and frontend, verified live end-to-end flow`

---

## Rules to follow throughout every step

1. The backend is always the source of truth for timer expiry and
   submission status - the frontend timer is only a display, never
   the actual enforcement.
2. A team can never submit more than once - this is checked on the
   backend (`submitted` flag) regardless of what the frontend does.
3. Passwords are never stored in plain text - always bcrypt hash
   before saving.
4. `.env` files are never committed to git.
5. Commit after every single step above, even ones that feel small.
