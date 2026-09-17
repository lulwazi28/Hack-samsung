import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardList, Bell, User } from 'lucide-react';
import Sidebar from '../shared/Sidebar.jsx';
import TopHeader from '../shared/TopHeader.jsx';
import { supabase } from '../../lib/supabase.js';

const NAV_ITEMS = [
  { to: '/judge', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/judge/evaluations', label: 'My Evaluations', icon: ClipboardList },
  { to: '/judge/notifications', label: 'Notifications', icon: Bell },
  { to: '/judge/profile', label: 'Profile', icon: User },
];

export default function JudgeLayout() {
  const location = useLocation();
  const rawJudge = location.state?.judge || { id: 'j-demo', name: 'Demo Judge', code: 'J-01' };
  const judge = {
    ...rawJudge,
    judgeId: rawJudge.code || rawJudge.judgeId || 'J-01',
    name: rawJudge.name || rawJudge.email || 'Judge',
  };

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignedTeams() {
      setLoading(true);
      try {
        // Fetch teams (scoped to workspace if available)
        let query = supabase.from('teams').select('*');
        if (judge.workspace_id) {
          query = query.eq('workspace_id', judge.workspace_id);
        }
        const { data: teamsData, error: teamsErr } = await query;
        if (teamsErr) throw teamsErr;

        // Fetch existing assignments for this judge
        const { data: assignmentsData, error: assignErr } = await supabase
          .from('assignments')
          .select('*')
          .eq('judge_id', judge.id);

        if (assignErr) console.warn('Assignments fetch warning:', assignErr);

        const assignmentMap = new Map((assignmentsData || []).map((a) => [a.team_id, a]));

        // Merge teams with assignment data
        const mergedTeams = (teamsData || []).map((t) => {
          const assign = assignmentMap.get(t.id);
          return {
            id: t.id,
            name: t.name,
            oneLiner: t.one_liner || t.oneLiner || 'No description provided.',
            description: t.description || '',
            status: assign?.status || 'pending',
            scores: assign?.scores || {},
            comments: assign?.comments || '',
            totalScore: assign?.total_score || 0,
            savedAt: assign?.created_at || null,
            files: {
              presentation: t.presentation_url || 'presentation.pdf',
              video: t.video_url || 'demo.mp4',
              documents: 'spec.pdf',
              images: 'screenshot.png',
            },
          };
        });

        setTeams(mergedTeams);
      } catch (err) {
        console.error('Error loading judge workspace teams:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignedTeams();
  }, [judge.id, judge.workspace_id]);

  async function updateTeam(teamId, patch) {
    // Update local state immediately
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, ...patch } : t))
    );

    // Calculate total score if scores are patched
    const updatedTeam = teams.find((t) => t.id === teamId);
    const newScores = patch.scores || updatedTeam?.scores || {};
    const totalScore = Object.values(newScores).reduce((sum, v) => sum + (Number(v) || 0), 0);

    // Upsert into Supabase assignments table
    try {
      const payload = {
        workspace_id: judge.workspace_id || null,
        judge_id: judge.id,
        team_id: teamId,
        scores: newScores,
        comments: patch.comments !== undefined ? patch.comments : (updatedTeam?.comments || ''),
        status: patch.status || updatedTeam?.status || 'in-progress',
        total_score: totalScore,
      };

      const { error } = await supabase
        .from('assignments')
        .upsert(payload, { onConflict: 'judge_id,team_id' });

      if (error) {
        console.error('Error saving evaluation to Supabase:', error);
      }
    } catch (e) {
      console.error('Failed to update assignment:', e);
    }
  }

  const initials = judge.name
    ? judge.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'J';

  return (
    <div className="min-h-screen flex bg-app font-sans text-ink">
      <Sidebar items={NAV_ITEMS} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader initials={initials} unread={1} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {loading ? (
              <div className="py-12 text-center text-sm text-muted">Loading assigned evaluations...</div>
            ) : (
              <Outlet context={{ judge, teams, updateTeam }} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
