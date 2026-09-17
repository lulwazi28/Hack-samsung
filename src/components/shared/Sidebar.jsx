import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import samsungLogo from '../../../assets/Samsung Logo - White - 13357x2048 - zonalogo.com.png';
import sidebarBg from '../../../assets/Sidebar-bg.jpg';
import { supabase } from '../../lib/supabase.js';

export default function Sidebar({ items }) {
  const navigate = useNavigate();

  async function handleLogOut() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <aside 
      className="w-64 shrink-0 bg-sidebar text-white flex flex-col h-screen sticky top-0 bg-cover bg-center"
      style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url("${sidebarBg}")` }}
    >
      <div className="flex flex-col items-start gap-3 px-6 py-6">
        <img src={samsungLogo} alt="Samsung" className="h-6 object-contain" />
        <div className="pt-3 border-t border-white/20 w-full">
          <p className="font-display font-semibold text-sm leading-tight mb-1">HackJudge</p>
          <p className="text-xs text-sidebarmuted leading-tight">Autumn Build 2026</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-display transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-sidebarmuted hover:bg-sidebarhover hover:text-white'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-display text-sidebarmuted hover:bg-sidebarhover hover:text-white transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}
