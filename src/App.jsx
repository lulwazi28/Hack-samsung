import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage.jsx';

import TeamLayout from './components/team/TeamLayout.jsx';
import TeamDashboard from './components/team/Dashboard.jsx';
import TeamSubmission from './components/team/Submission.jsx';
import TeamLeaderboard from './components/team/Leaderboard.jsx';
import TeamAnnouncements from './components/team/Announcements.jsx';
import TeamNotifications from './components/team/Notifications.jsx';
import TeamProfile from './components/team/Profile.jsx';

import JudgeLayout from './components/judge/JudgeLayout.jsx';
import JudgeDashboard from './components/judge/Dashboard.jsx';
import MyEvaluations from './components/judge/MyEvaluations.jsx';
import ScoreTeam from './components/judge/ScoreTeam.jsx';
import JudgeNotifications from './components/judge/Notifications.jsx';
import JudgeProfile from './components/judge/Profile.jsx';

import OrganiserLayout from './components/organiser/OrganiserLayout.jsx';
import OrganiserDashboard from './components/organiser/Dashboard.jsx';
import Setup from './components/organiser/Setup.jsx';
import Judging from './components/organiser/Judging.jsx';
import Results from './components/organiser/Results.jsx';
import AuditTrail from './components/organiser/AuditTrail.jsx';
import OrganiserAnnouncements from './components/organiser/Announcements.jsx';
import OrganiserNotifications from './components/organiser/Notifications.jsx';
import OrganiserProfile from './components/organiser/Profile.jsx';

import OrganiserWorkspaces from './components/organiser/Workspaces.jsx';
import TeamBuilder from './components/team/TeamBuilder.jsx';
import { HackathonProvider } from './context/HackathonContext.jsx';

export default function App() {
  return (
    <HackathonProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route path="/team/builder" element={<TeamBuilder />} />
        <Route path="/team" element={<TeamLayout />}>
          <Route index element={<TeamDashboard />} />
          <Route path="submission" element={<TeamSubmission />} />
          <Route path="leaderboard" element={<TeamLeaderboard />} />
          <Route path="announcements" element={<TeamAnnouncements />} />
          <Route path="notifications" element={<TeamNotifications />} />
          <Route path="profile" element={<TeamProfile />} />
        </Route>

        <Route path="/judge" element={<JudgeLayout />}>
          <Route index element={<JudgeDashboard />} />
          <Route path="evaluations" element={<MyEvaluations />} />
          <Route path="team/:teamId" element={<ScoreTeam />} />
          <Route path="notifications" element={<JudgeNotifications />} />
          <Route path="profile" element={<JudgeProfile />} />
        </Route>

        <Route path="/organiser/workspaces" element={<OrganiserWorkspaces />} />
        <Route path="/organiser" element={<OrganiserLayout />}>
          <Route index element={<OrganiserDashboard />} />
          <Route path="setup" element={<Setup />} />
          <Route path="judging" element={<Judging />} />
          <Route path="results" element={<Results />} />
          <Route path="audit-trail" element={<AuditTrail />} />
          <Route path="announcements" element={<OrganiserAnnouncements />} />
          <Route path="notifications" element={<OrganiserNotifications />} />
          <Route path="profile" element={<OrganiserProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </HackathonProvider>
);
}
