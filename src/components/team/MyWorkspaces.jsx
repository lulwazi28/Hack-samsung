import { useState } from 'react';
import { Building2, ArrowRight, CheckCircle2, Clock, XCircle, History, ShieldCheck, FileText } from 'lucide-react';
import { useHackathon } from '../../context/HackathonContext.jsx';

export default function MyWorkspaces({ onSelectWorkspace, setActiveTab }) {
  const { hackathons, applications } = useHackathon();
  const [activeSubTab, setActiveSubTab] = useState('current'); // 'current' | 'previous' | 'applications'

  const approvedWorkspaceIds = applications
    .filter(a => a.status === 'Approved')
    .map(a => a.workspaceId);

  // Active & Approved
  const currentWorkspaces = hackathons.filter(h =>
    h.status === 'active' && approvedWorkspaceIds.includes(h.id)
  );

  // Archived & Approved
  const previousWorkspaces = hackathons.filter(h =>
    h.status === 'archived' && approvedWorkspaceIds.includes(h.id)
  );

  const SUB_TABS = [
    { id: 'current', label: `Current Workspaces (${currentWorkspaces.length})` },
    { id: 'previous', label: `Previous Workspaces (${previousWorkspaces.length})` },
    { id: 'applications', label: `Applications (${applications.length})` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink mb-1">My Workspaces</h1>
        <p className="text-xs text-muted">Manage active hackathons, view application status, and review previous history.</p>
      </div>

      {/* Base Sub Tabs matching Setup.jsx style */}
      <div className="flex gap-1 bg-app border border-border rounded-md p-1 w-fit overflow-x-auto">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveSubTab(t.id)}
            className={`px-3.5 py-1.5 rounded text-xs font-display whitespace-nowrap transition-colors ${
              activeSubTab === t.id ? 'bg-card text-ink shadow-sm font-semibold' : 'text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CURRENT WORKSPACES */}
      {activeSubTab === 'current' && (
        <div>
          {currentWorkspaces.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
              <Building2 className="h-8 w-8 text-muted mx-auto mb-2" />
              <h3 className="font-display font-medium text-ink text-sm mb-1">No Active Workspaces Found</h3>
              <p className="text-xs text-muted max-w-sm mx-auto mb-4">
                You do not currently have approved access to any active hackathon workspace.
              </p>
              <button
                onClick={() => setActiveTab('discover')}
                className="px-4 py-2 bg-primary text-white text-xs font-display font-medium rounded-md hover:bg-primarydark transition-colors inline-flex items-center gap-1.5"
              >
                Discover & Apply for Hackathons
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-successlight text-success text-[11px] font-medium flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Approved Access
                      </span>
                      <span className="text-xs text-muted">{ws.startDate}</span>
                    </div>

                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{ws.organizer}</span>
                    <h2 className="text-base font-display font-medium text-ink mb-1">{ws.name}</h2>
                    <p className="text-xs text-muted mb-4">{ws.description}</p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted">Max team size: <strong className="text-ink">{ws.maxTeamSize}</strong></span>
                    <button
                      onClick={() => onSelectWorkspace(ws)}
                      className="px-3.5 py-1.5 bg-primary hover:bg-primarydark text-white rounded-md text-xs font-display font-medium transition-colors flex items-center gap-1"
                    >
                      Enter Workspace <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PREVIOUS WORKSPACES */}
      {activeSubTab === 'previous' && (
        <div>
          {previousWorkspaces.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
              <History className="h-8 w-8 text-muted mx-auto mb-2" />
              <h3 className="font-display font-medium text-ink text-sm mb-1">No Previous Workspaces</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Completed hackathons that you participated in will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previousWorkspaces.map((ws) => (
                <div key={ws.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-app text-muted text-[11px] font-medium">
                      Archived / Ended
                    </span>
                    <span className="text-xs text-muted">{ws.startDate}</span>
                  </div>
                  <h2 className="text-base font-display font-medium text-ink mb-1">{ws.name}</h2>
                  <p className="text-xs text-muted mb-3">{ws.description}</p>
                  <div className="text-xs text-muted pt-3 border-t border-border">
                    Organizer: <span className="font-medium text-ink">{ws.organizer}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPLICATIONS TRACKER */}
      {activeSubTab === 'applications' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-app/50 flex items-center justify-between">
            <h3 className="font-display font-semibold text-xs text-ink uppercase tracking-wider">Submitted Applications</h3>
            <span className="text-xs text-muted">{applications.length} Total</span>
          </div>

          {applications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">
              You haven't submitted any applications yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {applications.map((app) => {
                const ws = hackathons.find(h => h.id === app.workspaceId);
                return (
                  <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-display font-medium text-sm text-ink">{ws?.name || 'Hackathon Workspace'}</h4>
                        <span className="text-xs text-muted">• {app.appliedAt}</span>
                      </div>
                      <p className="text-xs text-muted mb-1">Organizer: {ws?.organizer || 'Organizer'}</p>
                      {app.message && (
                        <p className="text-xs text-ink/80 bg-app p-2 rounded border border-border max-w-xl">
                          "{app.message}"
                        </p>
                      )}
                    </div>

                    <div>
                      {app.status === 'Approved' && (
                        <span className="px-2.5 py-1 rounded bg-successlight text-success text-xs font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                        </span>
                      )}
                      {app.status === 'Pending' && (
                        <span className="px-2.5 py-1 rounded bg-warninglight text-warning text-xs font-medium flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Pending Approval
                        </span>
                      )}
                      {app.status === 'Declined' && (
                        <span className="px-2.5 py-1 rounded bg-dangerlight text-danger text-xs font-medium flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Declined
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
