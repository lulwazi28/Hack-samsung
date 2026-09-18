

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
