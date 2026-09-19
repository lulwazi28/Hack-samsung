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

        const demoProjects = [
          {
            id: 'demo-irrigation-system',
            name: 'AI Powered Irrigation System',
            oneLiner: 'Submitted by Young Innovators Squad',
            description: 'A smart irrigation solution that adjusts watering schedules using soil moisture, weather forecasts, and crop health data.',
            status: 'in-progress',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: {
              presentation: 'AI-Irrigation-Deck.pdf',
              video: 'irrigation-demo.mp4',
              documents: 'water-usage-brief.pdf',
              images: 'field-layout.png',
            },
            image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-urban-farms',
            name: 'Urban Harvest Monitor',
            oneLiner: 'Submitted by Green Grid Collective',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'urban-harvest.pdf', video: 'monitor-demo.mp4', documents: 'farm-assessment.pdf', images: 'sensor-map.png' },
            image: 'https://images.unsplash.com/photo-1464226184884-fa52ac9c0d84?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-solar-analytics',
            name: 'Solar Pulse Analytics',
            oneLiner: 'Submitted by Volt Forge',
            status: 'submitted',
            scores: { innovation: 2, problem: 2, technical: 2, functionality: 1, ux: 1, scalability: 1 },
            comments: 'Strong energy dashboard.',
            totalScore: 9,
            savedAt: null,
            files: { presentation: 'solar-pulse.pdf', video: 'analytics-demo.mp4', documents: 'grid-report.pdf', images: 'power-graph.png' },
            image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-mobility',
            name: 'SafeRoute AI',
            oneLiner: 'Submitted by City Motion Lab',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'saferoute.pdf', video: 'route-demo.mp4', documents: 'mobility-map.pdf', images: 'route-overview.png' },
            image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-health',
            name: 'CareCompass',
            oneLiner: 'Submitted by Healthwave Crew',
            status: 'in-progress',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'carecompass.pdf', video: 'care-demo.mp4', documents: 'patient-checklist.pdf', images: 'health-dashboard.png' },
            image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-education',
            name: 'Classroom IQ',
            oneLiner: 'Submitted by BrightNest Studio',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'classroom-iq.pdf', video: 'learning-demo.mp4', documents: 'teacher-brief.pdf', images: 'student-analytics.png' },
            image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-water',
            name: 'DropSense',
            oneLiner: 'Submitted by Riverbyte',
            status: 'submitted',
            scores: { innovation: 2, problem: 2, technical: 1, functionality: 2, ux: 1, scalability: 1 },
            comments: 'Excellent real-world impact and practical UX.',
            totalScore: 9,
            savedAt: null,
            files: { presentation: 'dropsense.pdf', video: 'water-demo.mp4', documents: 'resource-map.pdf', images: 'leak-graph.png' },
            image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-supply',
            name: 'ChainPilot',
            oneLiner: 'Submitted by Supply Hackers',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'chainpilot.pdf', video: 'logistics-demo.mp4', documents: 'warehouse-plan.pdf', images: 'tracking-board.png' },
            image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a6f2?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-fintech',
            name: 'PocketPilot',
            oneLiner: 'Submitted by Finance Future',
            status: 'in-progress',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'pocketpilot.pdf', video: 'budget-demo.mp4', documents: 'cashflow-brief.pdf', images: 'spending-map.png' },
            image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-safety',
            name: 'Hazard Lens',
            oneLiner: 'Submitted by Signal North',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'hazard-lens.pdf', video: 'hazard-demo.mp4', documents: 'site-report.pdf', images: 'risk-map.png' },
            image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-cycling',
            name: 'CommuteSense',
            oneLiner: 'Submitted by RouteSpark',
            status: 'submitted',
            scores: { innovation: 2, problem: 1, technical: 2, functionality: 2, ux: 1, scalability: 1 },
            comments: 'Very strong commuter value proposition.',
            totalScore: 9,
            savedAt: null,
            files: { presentation: 'commutesense.pdf', video: 'commute-demo.mp4', documents: 'traffic-brief.pdf', images: 'trip-heatmap.png' },
            image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-waste',
            name: 'Sortify AI',
            oneLiner: 'Submitted by Zero Waste Guild',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'sortify-ai.pdf', video: 'sorting-demo.mp4', documents: 'waste-report.pdf', images: 'recycling-board.png' },
            image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-forest',
            name: 'Canopy Watch',
            oneLiner: 'Submitted by Wild Signal Group',
            status: 'in-progress',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'canopy-watch.pdf', video: 'forest-demo.mp4', documents: 'tree-audit.pdf', images: 'forest-map.png' },
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-lab',
            name: 'LabLink',
            oneLiner: 'Submitted by Nova Research Unit',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'lablink.pdf', video: 'lab-demo.mp4', documents: 'research-plan.pdf', images: 'equipment-board.png' },
            image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-housing',
            name: 'HomeNest',
            oneLiner: 'Submitted by Brick & Byte',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'homenest.pdf', video: 'home-demo.mp4', documents: 'housing-brief.pdf', images: 'property-map.png' },
            image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-remote',
            name: 'RemoteFlow',
            oneLiner: 'Submitted by FieldSync Team',
            status: 'submitted',
            scores: { innovation: 1, problem: 2, technical: 2, functionality: 2, ux: 1, scalability: 1 },
            comments: 'Thoughtful workflow optimization for remote teams.',
            totalScore: 9,
            savedAt: null,
            files: { presentation: 'remoteflow.pdf', video: 'workflow-demo.mp4', documents: 'team-brief.pdf', images: 'operations-board.png' },
            image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-travel',
            name: 'TrailMate',
            oneLiner: 'Submitted by WanderWorks',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'trailmate.pdf', video: 'travel-demo.mp4', documents: 'route-plan.pdf', images: 'trail-map.png' },
            image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-voice',
            name: 'SpeakWell',
            oneLiner: 'Submitted by Language Loop',
            status: 'in-progress',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'speakwell.pdf', video: 'language-demo.mp4', documents: 'speech-map.pdf', images: 'voice-flow.png' },
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-farmtech',
            name: 'Harvest Lens',
            oneLiner: 'Submitted by Green Orbit',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'harvest-lens.pdf', video: 'field-demo.mp4', documents: 'crop-plan.pdf', images: 'terrain-map.png' },
            image: 'https://images.unsplash.com/photo-1464226184884-fa52ac9c0d84?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-logistics',
            name: 'FleetFlow',
            oneLiner: 'Submitted by Cargo Nova',
            status: 'submitted',
            scores: { innovation: 2, problem: 1, technical: 2, functionality: 2, ux: 1, scalability: 2 },
            comments: 'Excellent logistics planning and scaling potential.',
            totalScore: 10,
            savedAt: null,
            files: { presentation: 'fleetflow.pdf', video: 'fleet-demo.mp4', documents: 'route-brief.pdf', images: 'route-tracker.png' },
            image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'demo-retail',
            name: 'ShelfSense',
            oneLiner: 'Submitted by Retail Signal',
            status: 'pending',
            scores: {},
            comments: '',
            totalScore: 0,
            savedAt: null,
            files: { presentation: 'shelfsense.pdf', video: 'retail-demo.mp4', documents: 'inventory-brief.pdf', images: 'stock-board.png' },
            image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
          }
        ];

        setTeams([...mergedTeams, ...demoProjects]);
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
