# MCQ Test System - Implementation Guide

MERN stack MCQ test platform with admin panel, team login, 1-hour timer,
auto-ranking (score first, time second), and PDF result generation.

## Tech Stack

- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB Atlas (free M0 tier)
- Auth: JWT
- PDF: pdfkit (or puppeteer)

## Folder Structure

```
mcq-test-system/
  backend/
    models/
      Admin.js
      Team.js
      Question.js
      Submission.js
    routes/
      authRoutes.js
      adminRoutes.js
      testRoutes.js
    middleware/
      auth.js
    controllers/
      authController.js
      adminController.js
      testController.js
    utils/
      generatePdf.js
    server.js
    .env
  frontend/
    src/
      pages/
        AdminLogin.jsx
        AdminDashboard.jsx
        CreateTeam.jsx
        ViewResults.jsx
        TeamLogin.jsx
        TestPage.jsx
        SubmittedPage.jsx
      services/
        api.js
      App.jsx
```

## Step 1: Setup Project

1. Create root folder `mcq-test-system`.
2. Inside it run `npx create-react-app frontend` for frontend.
3. Create `backend` folder, run `npm init -y` inside it.
4. Install backend packages:
   `npm install express mongoose bcryptjs jsonwebtoken dotenv cors pdfkit`
5. Install dev package: `npm install -D nodemon`

## Step 2: MongoDB Atlas Setup

1. Create free account on MongoDB Atlas.
2. Create free M0 cluster.
3. Create database user (username/password).
4. Whitelist IP `0.0.0.0/0` for access from anywhere (fine for this scale).
5. Copy connection string, put in backend `.env` as `MONGO_URI`.

## Step 3: Define Models

**Admin.js** - fields: username, passwordHash

**Team.js** - fields: teamName, username, passwordHash, createdAt

**Question.js** - fields: questionText, options (array), correctOption

**Submission.js** - fields:
- teamId (ref Team)
- answers: array of { questionId, selectedOption }
- score (Number, default null)
- startTime (Date)
- endTime (Date)
- timeTakenMs (Number)
- submitted (Boolean, default false)

## Step 4: Auth Routes

1. `POST /api/admin/login` - checks admin credentials, returns JWT with role=admin.
2. `POST /api/team/login` - checks team credentials, returns JWT with role=team.
3. Middleware `auth.js` - verifies JWT, attaches `req.user` with id and role.
4. Middleware `isAdmin` - blocks non-admin roles from admin-only routes.

## Step 5: Admin Panel Routes

1. `POST /api/admin/create-team` - admin creates team with teamName, username, password (hash with bcrypt before saving).
2. `GET /api/admin/teams` - list all teams and their submission status.
3. `POST /api/admin/questions` - admin adds/uploads questions.
4. `GET /api/admin/results` - fetch all submissions, sorted by score DESC then timeTakenMs ASC.
5. `POST /api/admin/calculate/:teamId` (or calculate for all) - runs scoring logic described in Step 7.

## Step 6: Test Flow Routes (Team side)

1. `GET /api/test/start` - team requests to start test.
   - Check Submission collection for this teamId.
   - If no submission record exists, create one with `startTime = Date.now()`, `submitted = false`.
   - If a record exists and `submitted = true`, reject with "already submitted".
   - If a record exists and not submitted, return existing `startTime` (so refresh does not reset timer).
2. `GET /api/test/questions` - return all questions without `correctOption` field.
3. `POST /api/test/submit` - body: `{ answers }`.
   - Reject if `submitted = true` already (idempotency check).
   - Set `endTime = Date.now()`.
   - Compute `timeTakenMs = endTime - startTime`.
   - Save answers, set `submitted = true`.
   - Do NOT calculate score here yet (score is calculated by admin action in Step 7), just store raw answers.
4. Optional: `POST /api/test/autosave` - save partial answers every 30 seconds as backup, does not set submitted flag.

## Step 7: Score Calculation Logic (Admin triggered)

1. Admin clicks "Calculate Results" button in dashboard.
2. Backend endpoint loops through all submissions where `submitted = true`.
3. For each submission, compare each `answers[i].selectedOption` against `Question.correctOption`.
4. Count correct answers, multiply by marks-per-question to get `score`.
5. Save `score` back into the Submission document.
6. After all scores calculated, sort list by:
   - `score` descending
   - if `score` is equal, `timeTakenMs` ascending
7. Assign rank based on this sorted order and return to frontend.

## Step 8: Timer Logic (Frontend)

1. On test page load, fetch `startTime` from `/api/test/start`.
2. Calculate `remainingMs = startTime + 3600000 - Date.now()`.
3. Run countdown using `setInterval` every 1000ms, updating display.
4. If `remainingMs <= 0`, auto-call the submit function immediately.
5. Never rely only on frontend timer for validity - backend must independently check `Date.now() - startTime > 3600000` and reject submissions after that window if you want strict enforcement.

## Step 9: PDF Generation

1. Create `utils/generatePdf.js` using `pdfkit`.
2. Endpoint `GET /api/admin/pdf/:teamId` (or per-team download after submission).
3. PDF content:
   - Team name
   - Each question text with the option the team selected
   - Time taken (formatted as mm:ss)
4. Generate PDF in-memory and stream directly in response (do not store 100 files permanently on free hosting disk).

Example approach:
```
const doc = new PDFDocument();
res.setHeader("Content-Type", "application/pdf");
doc.pipe(res);
doc.text(`Team: ${team.teamName}`);
submission.answers.forEach((a, i) => {
  doc.text(`Q${i+1}: ${a.questionText} - Selected: ${a.selectedOption}`);
});
doc.text(`Time Taken: ${formatTime(submission.timeTakenMs)}`);
doc.end();
```

## Step 10: Frontend Pages

1. **AdminLogin.jsx** - simple login form, stores JWT in localStorage on success.
2. **AdminDashboard.jsx** - links to Create Team, Add Questions, View Results.
3. **CreateTeam.jsx** - form to create team credentials.
4. **ViewResults.jsx** - table of teams with score, time, rank, "Calculate" button, PDF download link per row.
5. **TeamLogin.jsx** - team login form.
6. **TestPage.jsx** - shows timer, questions with radio button options, Submit button.
7. **SubmittedPage.jsx** - shown after submission, simple "Test submitted" message.

## Step 11: Route Protection

1. Store JWT in localStorage after login.
2. Attach JWT in `Authorization: Bearer <token>` header on every API call.
3. On frontend, redirect to login if no token or token expired.
4. Backend middleware rejects requests without valid token on protected routes.

## Step 12: Testing Before Going Live

1. Create 2-3 dummy teams and test full flow: login, start, answer, submit, auto-submit on timeout.
2. Test double-login same team from two tabs - second should still see same startTime, and after submit, both should be blocked from re-submitting.
3. Test admin Calculate button gives correct ranking with same-score-different-time teams.
4. Test PDF generation output content matches actual submitted answers.

## Step 13: Deployment

1. Backend: deploy to Render or Railway free tier.
2. Frontend: deploy to Vercel or Netlify free tier.
3. Set environment variables (`MONGO_URI`, `JWT_SECRET`) on the hosting platform, not in code.
4. Update frontend API base URL to point to deployed backend URL.
5. Whitelist deployed backend's outbound IP in MongoDB Atlas network access if using a fixed IP, otherwise keep `0.0.0.0/0` for free tier ease.

## Notes

- 100 users is light load, free tier resources are sufficient.
- Always validate time and submission status on backend, never trust frontend alone.
- Hash all passwords with bcrypt before saving to database.
