import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Settings, Gavel, Trophy, History, Megaphone, Bell, User, ArrowLeft
} from 'lucide-react';
import Sidebar from '../shared/Sidebar.jsx';
import TopHeader from '../shared/TopHeader.jsx';
import { supabase } from '../../lib/supabase.js';

const NAV_ITEMS = [
  { to: '/organiser', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/organiser/setup', label: 'Competition Setup', icon: Settings },
  { to: '/organiser/judging', label: 'Judging', icon: Gavel },
  { to: '/organiser/results', label: 'Results', icon: Trophy },
  { to: '/organiser/audit-trail', label: 'Audit Trail', icon: History },
  { to: '/organiser/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/organiser/notifications', label: 'Notifications', icon: Bell },
  { to: '/organiser/profile', label: 'Profile', icon: User },
];

export default function OrganiserLayout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeWorkspaceId = searchParams.get('ws') || localStorage.getItem('hj_active_workspace_id') || 'ws-1';

  const [organiser, setOrganiser] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState(null);

  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [eventDetails, setEventDetails] = useState({
    eventName: 'Autumn Build 2026',
    roundLabel: 'Round 2 — live judging',
    max_team_size: 4,
    late_submissions: false,
    public_leaderboard: true,
  });
  const [auditLog, setAuditLog] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      setOrganiser({ email: session.user.email });

      // Save active workspace ID
      localStorage.setItem('hj_active_workspace_id', activeWorkspaceId);

      // Fetch Workspace record
      const { data: wsData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', activeWorkspaceId)
        .maybeSingle();

      if (wsData) {
        setActiveWorkspace(wsData);
      } else {
        setActiveWorkspace({ id: activeWorkspaceId, name: 'Autumn Build 2026' });
      }

      // Fetch all workspace-scoped entities
      const [teamsRes, judgesRes, assignmentsRes, eventRes, auditRes, announceRes, notifRes] = await Promise.all([
        supabase.from('teams').select('*').eq('workspace_id', activeWorkspaceId),
        supabase.from('judges').select('*').eq('workspace_id', activeWorkspaceId),
        supabase.from('assignments').select('*').eq('workspace_id', activeWorkspaceId),
        supabase.from('event_details').select('*').eq('workspace_id', activeWorkspaceId).maybeSingle(),
        supabase.from('audit_log').select('*').eq('workspace_id', activeWorkspaceId).order('time', { ascending: false }),
        supabase.from('announcements').select('*').eq('workspace_id', activeWorkspaceId).order('time', { ascending: false }),
        supabase.from('notifications').select('*').eq('workspace_id', activeWorkspaceId).order('time', { ascending: false }),
      ]);

      if (teamsRes.data && teamsRes.data.length > 0) setTeams(teamsRes.data);
      if (judgesRes.data && judgesRes.data.length > 0) setJudges(judgesRes.data);
      if (assignmentsRes.data && assignmentsRes.data.length > 0) setAssignments(assignmentsRes.data);
      if (eventRes.data) setEventDetails(eventRes.data);
      if (auditRes.data && auditRes.data.length > 0) setAuditLog(auditRes.data);
      if (announceRes.data && announceRes.data.length > 0) setAnnouncements(announceRes.data);
      if (notifRes.data && notifRes.data.length > 0) setNotifications(notifRes.data);

      setLoading(false);
    }

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/');
      } else if (session) {
        setOrganiser({ email: session.user.email });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, activeWorkspaceId]);

  async function logAction(user, action, details) {
    const entry = {
      workspace_id: activeWorkspaceId,
      time: new Date().toISOString(),
      user: user || organiser?.email || 'Organiser',
      action,
      details
    };
    setAuditLog((log) => [entry, ...log]);
    await supabase.from('audit_log').insert(entry);
  }

  async function addTeam(name) {
    const id = `t-new-${Date.now()}`;
    const code = `T-${String(teams.length + 1).padStart(3, '0')}`;
    const newTeam = {
      id,
      workspace_id: activeWorkspaceId,
      code,
      name: name.trim(),
      category: 'Open Innovation',
      oneLiner: 'No summary submitted yet.',
      submitted: false
    };

    setTeams((ts) => [...ts, newTeam]);
    await supabase.from('teams').insert(newTeam);
    logAction('Organiser', 'Team Added', name.trim());
  }

  async function removeTeam(id, name) {
    setTeams((ts) => ts.filter((t) => t.id !== id));
    setAssignments((as) => as.filter((a) => a.teamId !== id));

    await supabase.from('teams').delete().eq('id', id);
    logAction('Organiser', 'Team Removed', name);
  }

  async function addJudge(judgeInput) {
    const n = judges.length + 1;
    const id = `j-new-${Date.now()}`;
    const code = typeof judgeInput === 'string' ? judgeInput : judgeInput?.code;
    const finalCode = code?.trim() || `J-${String(n).padStart(2, '0')}`;

    const name = typeof judgeInput === 'object' && judgeInput?.name ? judgeInput.name.trim() : `Judge ${finalCode}`;
    const email = typeof judgeInput === 'object' && judgeInput?.email ? judgeInput.email.trim() : `judge.${finalCode.toLowerCase()}@hackathon.com`;
    const password = typeof judgeInput === 'object' && judgeInput?.password ? judgeInput.password.trim() : 'JudgePass2026!';
    const title = typeof judgeInput === 'object' && judgeInput?.title ? judgeInput.title.trim() : 'Official Judge';

    const newJudge = {
      id,
      workspace_id: activeWorkspaceId,
      code: finalCode,
      name,
      email,
      password,
      title
    };

    setJudges((js) => [...js, newJudge]);
    await supabase.from('judges').insert(newJudge);
    logAction('Organiser', 'Judge Added', `${name} (${finalCode})`);
  }

  async function removeJudge(id, code) {
    setJudges((js) => js.filter((j) => j.id !== id));
    setAssignments((as) => as.filter((a) => a.judgeId !== id));

    await supabase.from('judges').delete().eq('id', id);
    logAction('Organiser', 'Judge Removed', code);
  }

  async function assignJudgeToTeam(judgeId, teamId) {
    if (assignments.some((a) => a.judgeId === judgeId && a.teamId === teamId)) return;

    const newAssignment = {
      workspace_id: activeWorkspaceId,
      judgeId,
      teamId,
      status: 'pending',
      total: 0
    };
    setAssignments((as) => [...as, newAssignment]);

    await supabase.from('assignments').insert(newAssignment);
    const team = teams.find((t) => t.id === teamId);
    logAction('Organiser', 'Judge Assigned', team?.name || teamId);
  }

  async function unassignJudgeFromTeam(judgeId, teamId) {
    setAssignments((as) => as.filter((a) => !(a.judgeId === judgeId && a.teamId === teamId)));
    await supabase.from('assignments').delete().match({ judgeId, teamId });
  }

  async function autoAssignJudges() {
    if (teams.length === 0 || judges.length === 0) return;
    let newAssignments = [];
    teams.forEach((t, i) => {
      const j1 = judges[i % judges.length];
      const j2 = judges[(i + 1) % judges.length];
      if (j1) newAssignments.push({ workspace_id: activeWorkspaceId, judgeId: j1.id, teamId: t.id, status: 'pending', total: 0 });
      if (j2 && j1.id !== j2.id) newAssignments.push({ workspace_id: activeWorkspaceId, judgeId: j2.id, teamId: t.id, status: 'pending', total: 0 });
    });

    setAssignments(newAssignments);
    await supabase.from('assignments').delete().eq('workspace_id', activeWorkspaceId);
    await supabase.from('assignments').insert(newAssignments);
    logAction('Organiser', 'Assignments Reset', 'Auto-assigned evenly');
  }

  async function updateEventDetails(patch) {
    setEventDetails((e) => ({ ...e, ...patch }));
    await supabase.from('event_details').upsert({ workspace_id: activeWorkspaceId, ...eventDetails, ...patch });
  }

  async function postAnnouncement(title, message, audience) {
    const item = {
      workspace_id: activeWorkspaceId,
      title,
      message,
      audience,
      time: new Date().toISOString()
    };
    setAnnouncements(prev => [item, ...prev]);
    await supabase.from('announcements').insert(item);
    logAction('Organiser', 'Broadcast Sent', title);
  }

  async function postNotification(text, icon = 'bell') {
    const item = {
      workspace_id: activeWorkspaceId,
      text,
      icon,
      unread: true,
      time: new Date().toISOString()
    };
    setNotifications(prev => [item, ...prev]);
    await supabase.from('notifications').insert(item);
  }

  if (loading || !organiser) {
    return <div className="min-h-screen flex items-center justify-center bg-app text-muted text-sm font-display">Loading Organiser Portal...</div>;
  }

  return (
    <div className="min-h-screen flex bg-app font-sans text-ink">
      <Sidebar items={NAV_ITEMS} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader initials="OR" unread={notifications.filter(n => n.unread).length}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/organiser/workspaces')} className="text-xs font-semibold text-muted hover:text-ink transition-colors flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Workspaces
            </button>
            <span className="text-muted/40">|</span>
            <span className="text-xs font-semibold text-primary font-display">
              {activeWorkspace?.name || 'Autumn Build 2026'}
            </span>
          </div>
        </TopHeader>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <Outlet
              context={{
                teams, judges, assignments, eventDetails, auditLog, announcements, notifications,
                addTeam, removeTeam, addJudge, removeJudge,
                assignJudgeToTeam, unassignJudgeFromTeam, autoAssignJudges,
                updateEventDetails, logAction, postAnnouncement, postNotification,
                organiser, activeWorkspaceId, activeWorkspace
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
