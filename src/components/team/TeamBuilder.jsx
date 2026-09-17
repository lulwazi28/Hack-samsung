import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, UserPlus, Users, ArrowRight, Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import StudentHeader from './StudentHeader.jsx';
import StudentHome from './StudentHome.jsx';
import DiscoverHackathons from './DiscoverHackathons.jsx';
import MyWorkspaces from './MyWorkspaces.jsx';
import StudentProfile from './Profile.jsx';
import { useHackathon } from '../../context/HackathonContext.jsx';
import { supabase } from '../../lib/supabase.js';

const MOCK_STUDENTS = [
  { id: 'u1', name: 'Alice Chen', role: 'Frontend Developer', university: 'Stanford' },
  { id: 'u2', name: 'Bob Smith', role: 'Backend Engineer', university: 'MIT' },
  { id: 'u3', name: 'Charlie Liu', role: 'UI/UX Designer', university: 'Berkeley' },
  { id: 'u4', name: 'Devon Vance', role: 'ML Engineer', university: 'CMU' },
];

export default function TeamBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile, hasWorkspaceAccess, getApplicationForWorkspace } = useHackathon();

  // Sync user info from router navigation state or Supabase session
  useEffect(() => {
    async function syncProfile() {
      const stateStudent = location.state?.student;
      if (stateStudent && stateStudent.name) {
        updateProfile({
          ...profile,
          name: stateStudent.name,
          email: stateStudent.email || profile.email,
        });
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || profile.name;
          updateProfile({
            ...profile,
            name,
            email: user.email,
          });
        }
      } catch (err) {
        console.warn('Auth sync error:', err);
      }
    }
    syncProfile();
  }, [location.state]);

  // Tab State: 'home' | 'discover' | 'workspaces' | 'profile' | 'team-hub'
  const [activeTab, setActiveTab] = useState('home');

  // Selected workspace context when entering team-hub
  const [activeWorkspace, setActiveWorkspace] = useState(null);

  // Team Hub State
  const [teamName, setTeamName] = useState('');
  const [hasTeam, setHasTeam] = useState(false);
  const [teamMembers, setTeamMembers] = useState([{ name: `You (${profile?.name || 'Student'})`, role: 'Fullstack Developer' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredStudents, setRegisteredStudents] = useState(MOCK_STUDENTS);

  useEffect(() => {
    async function fetchApprovedStudents() {
      if (!activeWorkspace?.id) return;
      try {
        const { data, error } = await supabase
          .from('workspace_applications')
          .select('*')
          .eq('workspace_id', activeWorkspace.id)
          .eq('status', 'Approved');

        if (data && data.length > 0) {
          const formatted = data.map((app) => ({
            id: app.id,
            name: app.applicant_name,
            role: Array.isArray(app.applicant_skills) ? app.applicant_skills.join(', ') : (app.applicant_skills || 'Builder'),
            university: app.applicant_university || 'University',
          }));
          setRegisteredStudents(formatted);
        }
      } catch (err) {
        console.warn('Fallback to sample student roster:', err);
      }
    }
    fetchApprovedStudents();
  }, [activeWorkspace?.id]);

  const filteredStudents = registeredStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectWorkspace = (ws) => {
    setActiveWorkspace(ws);
    setActiveTab('team-hub');
  };

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setHasTeam(true);
  };

  const handleInvite = (student) => {
    const max = activeWorkspace?.maxTeamSize || 4;
    if (teamMembers.length >= max) {
      alert(`Max team size for ${activeWorkspace?.name} is ${max}`);
      return;
    }
    setTeamMembers([...teamMembers, { name: student.name, role: student.role }]);
  };

  // Check access control if attempting to view team-hub
  const currentApp = activeWorkspace ? getApplicationForWorkspace(activeWorkspace.id) : null;
  const isApproved = activeWorkspace ? hasWorkspaceAccess(activeWorkspace.id) : false;

  return (
    <div className="min-h-screen bg-app text-ink font-sans flex flex-col">
      {/* Navigation Header */}
      <StudentHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-8 py-8">
        {activeTab === 'home' && (
          <StudentHome
            setActiveTab={setActiveTab}
            onSelectWorkspace={handleSelectWorkspace}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverHackathons />
        )}

        {activeTab === 'workspaces' && (
          <MyWorkspaces
            setActiveTab={setActiveTab}
            onSelectWorkspace={handleSelectWorkspace}
          />
        )}

        {activeTab === 'profile' && (
          <StudentProfile />
        )}

        {/* TEAM HUB / WORKSPACE ACCESS */}
        {activeTab === 'team-hub' && (
          <div className="space-y-6">
            <button
              onClick={() => setActiveTab('workspaces')}
              className="text-xs text-muted hover:text-ink font-medium flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to My Workspaces
            </button>

            {!activeWorkspace ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <Users className="h-8 w-8 text-muted mx-auto mb-2" />
                <h3 className="text-base font-display font-medium text-ink mb-1">No Workspace Selected</h3>
                <p className="text-xs text-muted mb-4">Please select an active workspace from your workspaces tab.</p>
                <button
                  onClick={() => setActiveTab('workspaces')}
                  className="px-4 py-2 bg-primary text-white rounded-md text-xs font-display font-medium"
                >
                  View Workspaces
                </button>
              </div>
            ) : !isApproved ? (
              /* ACCESS CONTROL GUARD */
              <div className="bg-card border border-border rounded-xl p-8 text-center max-w-lg mx-auto">
                <div className="w-10 h-10 rounded-full bg-warninglight text-warning flex items-center justify-center mx-auto mb-3">
                  {currentApp?.status === 'Declined' ? (
                    <ShieldAlert className="h-5 w-5 text-danger" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>

                <h2 className="text-lg font-display font-semibold text-ink mb-1">
                  {currentApp?.status === 'Declined'
                    ? 'Application Declined'
                    : 'Workspace Access Pending'}
                </h2>

                <p className="text-xs text-muted mb-6">
                  {currentApp?.status === 'Declined'
                    ? `Your application for "${activeWorkspace.name}" was declined by the organizer.`
                    : currentApp?.status === 'Pending'
                    ? `Your application for "${activeWorkspace.name}" is currently pending organizer approval.`
                    : `You have not applied for "${activeWorkspace.name}" yet.`}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="px-4 py-2 bg-primary text-white rounded-md text-xs font-display font-medium hover:bg-primarydark transition-colors"
                  >
                    Discover Hackathons
                  </button>
                  <button
                    onClick={() => setActiveTab('workspaces')}
                    className="px-4 py-2 bg-app text-ink rounded-md text-xs font-display font-medium border border-border hover:bg-border/30 transition-colors"
                  >
                    Check Applications
                  </button>
                </div>
              </div>
            ) : !hasTeam ? (
              /* CREATE TEAM FLOW FOR APPROVED STUDENTS */
              <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-display font-semibold text-ink mb-1">Create Your Team</h2>
                <p className="text-xs text-muted mb-6">
                  You are an approved participant of <strong>{activeWorkspace.name}</strong>. Enter a team name to start inviting members.
                </p>

                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Team Name</label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Galaxy Innovators"
                      className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-primary hover:bg-primarydark text-white rounded-md text-xs font-display font-medium transition-colors"
                  >
                    Create Team & Continue
                  </button>
                </form>
              </div>
            ) : (
              /* ACTIVE TEAM ROSTER & STUDENT DIRECTORY */
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-xl p-5">
                  <div>
                    <span className="text-[10px] font-medium text-success uppercase tracking-wider px-2 py-0.5 bg-successlight rounded">
                      Team Active
                    </span>
                    <h2 className="text-xl font-display font-semibold text-ink mt-1">{teamName}</h2>
                    <p className="text-xs text-muted">
                      {activeWorkspace.name} • {teamMembers.length}/{activeWorkspace.maxTeamSize} Members
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/team')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primarydark text-white rounded-md text-xs font-display font-medium transition-colors"
                  >
                    Go to Team Dashboard <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Team Members */}
                  <div className="md:col-span-1 space-y-3">
                    <h3 className="font-display font-semibold text-xs text-muted uppercase tracking-wider">
                      Team Members ({teamMembers.length})
                    </h3>
                    <ul className="space-y-2">
                      {teamMembers.map((m, i) => (
                        <li key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                          <div>
                            <p className="text-xs font-medium text-ink">{m.name}</p>
                            <p className="text-[11px] text-muted">{m.role}</p>
                          </div>
                          {i === 0 && (
                            <span className="text-[10px] uppercase font-medium px-2 py-0.5 bg-primarylight text-primary rounded">
                              Leader
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Student Directory to Invite */}
                  <div className="md:col-span-2">
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-medium text-sm text-ink">Invite Student Builders</h3>
                        <span className="text-xs text-muted">Max size: {activeWorkspace.maxTeamSize}</span>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name or role..."
                          className="w-full pl-9 pr-3 py-1.5 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                        />
                      </div>

                      <ul className="space-y-2">
                        {filteredStudents.map((s) => {
                          const isMember = teamMembers.some(m => m.name === s.name);
                          return (
                            <li key={s.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-primarylight text-primary font-semibold flex items-center justify-center text-xs">
                                  {s.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-ink">{s.name}</p>
                                  <p className="text-[11px] text-muted">{s.role} • {s.university}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleInvite(s)}
                                disabled={isMember || teamMembers.length >= activeWorkspace.maxTeamSize}
                                className="px-2.5 py-1 rounded bg-primarylight text-primary hover:bg-primary/20 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                              >
                                <UserPlus className="h-3 w-3" />
                                {isMember ? 'Invited' : 'Invite'}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
