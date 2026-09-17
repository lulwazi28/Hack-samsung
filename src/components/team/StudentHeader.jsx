import { useNavigate } from 'react-router-dom';
import { Compass, Briefcase, Home, LogOut, User, Bell } from 'lucide-react';
import samsungLogo from '../../../assets/Samsung Logo - White - 13357x2048 - zonalogo.com.png';
import { supabase } from '../../lib/supabase.js';
import { useHackathon } from '../../context/HackathonContext.jsx';

export default function StudentHeader({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { profile } = useHackathon();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover Hackathons', icon: Compass },
    { id: 'workspaces', label: 'My Workspaces', icon: Briefcase },
  ];

  return (
    <header className="bg-card border-b border-border px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 text-ink">
      {/* Samsung Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-sidebar px-2.5 py-1 rounded">
            <img src={samsungLogo} alt="Samsung" className="h-4 object-contain" />
          </div>
          <span className="font-display font-semibold text-base text-ink">
            HackJudge
          </span>
          <span className="text-xs text-muted border-l border-border pl-2.5">Student Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-1 bg-app border border-border rounded-lg p-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium font-display transition-colors ${
                active
                  ? 'bg-card text-ink shadow-sm font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Profile & User Controls */}
      <div className="flex items-center gap-3">
        {/* Profile Avatar Widget */}
        <button
          onClick={() => setActiveTab('profile')}
          title="Edit Profile"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-xs ${
            activeTab === 'profile'
              ? 'border-primary bg-primarylight text-primary font-semibold'
              : 'border-border bg-card hover:bg-app text-ink'
          }`}
        >
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
              {profile?.name?.charAt(0) || 'S'}
            </div>
          )}
          <span className="font-medium max-w-[120px] truncate hidden sm:inline">
            {profile?.name || 'Profile'}
          </span>
          <User className="h-3.5 w-3.5 text-muted" />
        </button>

        <div className="w-px h-4 bg-border"></div>

        <button
          onClick={handleLogout}
          className="text-xs text-muted hover:text-ink transition-colors flex items-center gap-1"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
