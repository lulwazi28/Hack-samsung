import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Trophy, Megaphone, Bell, User } from 'lucide-react';
import Sidebar from '../shared/Sidebar.jsx';
import TopHeader from '../shared/TopHeader.jsx';

const NAV_ITEMS = [
  { to: '/team', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/team/submission', label: 'My Projects', icon: FolderKanban },
  { to: '/team/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/team/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/team/notifications', label: 'Notifications', icon: Bell },
  { to: '/team/profile', label: 'Profile', icon: User },
];

export default function TeamLayout() {
  const location = useLocation();
  const team = location.state?.team || { name: 'Your team', code: 'T-000' };

  return (
    <div className="min-h-screen flex bg-app font-sans text-ink">
      <Sidebar items={NAV_ITEMS} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader initials={team.code.slice(-2)} unread={2} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <Outlet context={{ team }} />
          </div>
        </main>
      </div>
    </div>
  );
}
