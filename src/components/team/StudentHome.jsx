import { ArrowRight, Compass, CheckCircle2, Clock, Building2, User, ShieldCheck } from 'lucide-react';
import { useHackathon } from '../../context/HackathonContext.jsx';
import samsungLogo from '../../../assets/Samsung Logo - White - 13357x2048 - zonalogo.com.png';

export default function StudentHome({ setActiveTab, onSelectWorkspace }) {
  const { profile, hackathons, applications } = useHackathon();

  const approvedApps = applications.filter(a => a.status === 'Approved');
  const pendingApps = applications.filter(a => a.status === 'Pending');

  // Workspaces approved and active
  const activeWorkspaces = hackathons.filter(h =>
    h.status === 'active' && approvedApps.some(a => a.workspaceId === h.id)
  );

  return (
    <div className="space-y-6">
      {/* Simple Clean Hero Banner */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-sidebar px-2 py-0.5 rounded">
              <img src={samsungLogo} alt="Samsung" className="h-3.5 object-contain" />
            </div>
            <span className="text-xs text-muted font-medium">Developer Workspace</span>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2">
            Welcome back, {profile?.name || 'Student'}
          </h1>
          <p className="text-muted text-sm max-w-xl">
            Build projects, join student teams, and submit your entries to official Samsung hackathons.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('discover')}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primarydark text-white rounded-md text-xs font-display font-semibold transition-colors"
          >
            <Compass className="h-4 w-4" />
            Discover Hackathons
          </button>

          <button
            onClick={() => setActiveTab('workspaces')}
            className="flex items-center gap-2 px-4 py-2 bg-app hover:bg-border/50 text-ink border border-border rounded-md text-xs font-display font-medium transition-colors"
          >
            <Building2 className="h-4 w-4 text-muted" />
            My Workspaces ({activeWorkspaces.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 px-3.5 py-2 bg-app hover:bg-border/50 text-muted hover:text-ink border border-border rounded-md text-xs font-display transition-colors"
          >
            <User className="h-4 w-4" />
            Profile
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primarylight flex items-center justify-center text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Active Workspaces</p>
            <p className="text-xl font-bold text-ink font-display">{activeWorkspaces.length}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-warninglight flex items-center justify-center text-warning">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Pending Applications</p>
            <p className="text-xl font-bold text-ink font-display">{pendingApps.length}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-successlight flex items-center justify-center text-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Approved Hackathons</p>
            <p className="text-xl font-bold text-ink font-display">{approvedApps.length}</p>
          </div>
        </div>
      </div>

      {/* Active Workspaces Overview */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-display font-semibold text-ink">Your Active Workspaces</h2>
            <p className="text-xs text-muted">Hackathons you are approved for and currently participating in.</p>
          </div>
          <button
            onClick={() => setActiveTab('workspaces')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View all ({activeWorkspaces.length}) <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {activeWorkspaces.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-8 text-center bg-app/40">
            <Building2 className="h-8 w-8 text-muted mx-auto mb-2" />
            <h3 className="font-display font-medium text-ink text-sm mb-1">No Active Workspaces Yet</h3>
            <p className="text-xs text-muted max-w-md mx-auto mb-4">
              Apply to active hackathons to gain access to workspaces, form teams, and submit your projects.
            </p>
            <button
              onClick={() => setActiveTab('discover')}
              className="px-4 py-2 bg-primary text-white text-xs font-display font-medium rounded-md hover:bg-primarydark transition-colors inline-flex items-center gap-1.5"
            >
              <Compass className="h-4 w-4" />
              Discover Hackathons
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeWorkspaces.map((ws) => (
              <div
                key={ws.id}
                className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-successlight text-success rounded flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Approved Participant
                    </span>
                    <span className="text-xs text-muted">{ws.startDate}</span>
                  </div>
                  <h3 className="font-display font-medium text-ink text-base mb-1">{ws.name}</h3>
                  <p className="text-xs text-muted line-clamp-2 mb-4">{ws.description}</p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted">Max team size: <strong className="text-ink">{ws.maxTeamSize}</strong></span>
                  <button
                    onClick={() => onSelectWorkspace(ws)}
                    className="px-3 py-1.5 bg-primary hover:bg-primarydark text-white rounded-md text-xs font-display font-medium transition-colors flex items-center gap-1"
                  >
                    Enter Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
