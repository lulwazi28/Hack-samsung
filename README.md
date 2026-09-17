# HackJudge: Hackathon Judging Platform

A light-theme, sidebar-navigation UI for the hackathon judging platform, built with React + Vite + Tailwind CSS.

## Design system

- **Light app background** (`app`) with white cards (`card`), a single **blue primary** brand color, and a dark navy **sidebar** used consistently across all three portals.
- **Semantic status pills** : green (`success`) for complete/active, amber (`warning`) for in progress, red (`danger`) for not submitted/errors, plus a neutral gray and a primary-tinted "new" pill.
- **Space Grotesk** for headings/labels, **Inter** for body text :same pairing as before.
- Shared building blocks live in `src/components/shared/`: `Sidebar`, `TopHeader`, `StatusPill`, `CircularProgress` (workload/completion rings), `CountdownBoxes` (boxed HH:MM:SS), and `BarRow` (horizontal bar for score visualizations).

## Sign in

One screen: a dark hero panel (brand + tagline) beside a light form (email, password, remember me / forgot password), with a row of role pills — Student, Judge, Organiser — at the bottom to pick which portal to land in. This is a front-end shell: submitting always "succeeds" after a short delay and routes to the matching portal; wire it up to a real auth endpoint before shipping.

## Student / Team portal (`/team`)

Sidebar: Dashboard, My Projects, Leaderboard, Announcements, Notifications, Profile.

- **Dashboard** : greeting, a dark "time remaining" card with boxed countdown digits, quick links, submission status, and a preview of recent announcements.
- **My Projects** : the submission flow as a 3-step wizard: Project Details → Upload Files → Review & Submit.
- **Leaderboard** : ranked table with medal styling for the top 3 and a pinned, highlighted row showing your own team's rank even when it's outside the top 5.
- **Announcements** / **Notifications** / **Profile** : straightforward list/detail pages.

## Judge portal (`/judge`)

Sidebar: Dashboard, My Evaluations, Notifications, Profile.

- **Dashboard** : a workload ring (evaluations completed vs. assigned) plus the assigned-teams list.
- **My Evaluations** : the same list as a full searchable/filterable table.
- **Score a team** (`/judge/team/:teamId`) : tabbed into Rubric / Project Preview / Comments. The rubric renders the six standardised criteria as a numbered list with a short description each, point-capped score buttons, and a live running total. "Save Progress" persists a partial evaluation; "Submit & Lock" requires every criterion scored, confirms the locked-in total, then disables the form — only an organiser can reopen it after that.

## Organiser portal (`/organiser`)

Sidebar: Dashboard, Competition Setup, Judging, Results, Audit Trail, Announcements, Notifications, Profile.

- **Dashboard** : quick stats and shortcuts into the three main areas below.
- **Competition Setup** : sub-tabs for **Teams** (add/remove, search/filter by status and category), **Judges** (add/remove, plus judge-to-team assignment management with an "auto-assign evenly" action), **Criteria** (the fixed six-criteria rubric, read-only), **Deadlines** (event name/round), and **Settings** (a couple of illustrative toggles).
- **Judging** : live monitoring: donut-style completion stats, a searchable/filterable team table (submission + judging status), and a judge workload table.
- **Results** : tabbed into **Overall Ranking** (podium + full table), **By Criterion** (a per-team breakdown), and **Visualisations** (horizontal bars showing average score per criterion). Note: per-criterion figures here are estimated proportionally from each team's total, since the mock data only tracks one total per judge — wire up real per-criterion scoring data to make this exact. **Export Results** builds and downloads a real CSV client-side.
- **Audit Trail** : a running log (team submissions, judge scores, organiser actions) with search and filters.
- **Announcements** : history of sent announcements plus a **Create Announcement** modal with title, message, and audience checkboxes (Teams / Judges / Organisers).

All organiser data (teams, judges, assignments, scores, audit log) is seeded from deterministic mock data in `src/data/organiserMockData.js` and held in `OrganiserLayout`'s state for the session, so edits in Setup are reflected immediately in Judging, Results, and the Audit Trail.

## Run it locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

## Structure

```
src/
  components/
    AuthPage.jsx           ← split hero/form sign-in with role pills
    shared/
      Sidebar.jsx           ← dark nav sidebar (used by all 3 portals)
      TopHeader.jsx         ← bell + avatar header bar
      StatusPill.jsx        ← success/warning/danger/neutral/primary pill
      CircularProgress.jsx  ← SVG progress ring
      CountdownBoxes.jsx    ← boxed HH:MM:SS display
      BarRow.jsx            ← horizontal bar for score visualizations
    team/                   ← Dashboard, Submission (wizard), Leaderboard,
                              Announcements, Notifications, Profile, TeamLayout
    judge/                  ← Dashboard, MyEvaluations, ScoreTeam,
                              Notifications, Profile, JudgeLayout
    organiser/              ← Dashboard, Setup, Judging, Results, AuditTrail,
                              Announcements, Notifications, Profile, OrganiserLayout
  data/
    rubric.js               ← shared six-criteria rubric
    organiserMockData.js    ← seed data + scoring/ranking helpers
  hooks/
    useCountdown.js         ← returns {hours, minutes, seconds} for CountdownBoxes
  App.jsx                   ← full route tree
  main.jsx
  index.css                 ← Tailwind + font imports
tailwind.config.js           ← light-theme tokens (app/card/sidebar/primary/status colors)
```
