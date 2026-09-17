import { useState, useEffect } from 'react';
import { Calendar, Users, Send, CheckCircle2, Clock, XCircle, Search, Sparkles } from 'lucide-react';
import { useHackathon } from '../../context/HackathonContext.jsx';

export default function DiscoverHackathons() {
  const { hackathons, refreshWorkspaces, applyToHackathon, getApplicationForWorkspace, profile } = useHackathon();
  const [search, setSearch] = useState('');
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [applicationMsg, setApplicationMsg] = useState('');
  const [submittedAppId, setSubmittedAppId] = useState(null);

  useEffect(() => {
    if (refreshWorkspaces) {
      refreshWorkspaces();
    }
  }, []);

  const activeHackathons = hackathons.filter(h =>
    h.status === 'active' &&
    (h.name.toLowerCase().includes(search.toLowerCase()) ||
     h.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
     h.organizer.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!selectedHackathon) return;

    const res = applyToHackathon(selectedHackathon.id, applicationMsg);
    setSubmittedAppId(res?.id);
    setApplicationMsg('');
    setTimeout(() => {
      setSelectedHackathon(null);
      setSubmittedAppId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-semibold text-ink">Discover Hackathons</h1>
          <p className="text-xs text-muted">Explore active hackathons and apply to join a workspace.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-card border border-border rounded-md text-xs text-ink placeholder:text-muted focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeHackathons.map((h) => {
          const app = getApplicationForWorkspace(h.id);
          const hasApplied = Boolean(app);

          return (
            <div
              key={h.id}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                      {h.organizer}
                    </span>
                    <h2 className="text-lg font-display font-semibold text-ink mt-0.5">{h.name}</h2>
                  </div>

                  {app ? (
                    app.status === 'Approved' ? (
                      <span className="px-2 py-0.5 rounded bg-successlight text-success text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Approved
                      </span>
                    ) : app.status === 'Declined' ? (
                      <span className="px-2 py-0.5 rounded bg-dangerlight text-danger text-xs font-medium flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Declined
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-warninglight text-warning text-xs font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Pending Review
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-primarylight text-primary text-xs font-medium">
                      Open
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted mb-4">{h.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {h.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-app text-muted text-[11px] font-medium border border-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted mb-5 bg-app p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>{h.startDate} - {h.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>Max {h.maxTeamSize} / team</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-warning" />
                    <span>Deadline: <strong>{h.deadline}</strong></span>
                  </div>
                </div>
              </div>

              <div>
                {hasApplied ? (
                  <button
                    disabled
                    className="w-full py-2 px-3 rounded-md text-xs font-medium bg-app text-muted border border-border cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {app.status === 'Approved' && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    {app.status === 'Declined' && <XCircle className="h-3.5 w-3.5 text-danger" />}
                    {app.status === 'Pending' && <Clock className="h-3.5 w-3.5 text-warning" />}
                    Application Status: {app.status}
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedHackathon(h)}
                    className="w-full py-2 px-3 rounded-md text-xs font-display font-medium bg-primary hover:bg-primarydark text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Apply for Workspace Access
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Modal */}
      {selectedHackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-medium text-ink text-base">Apply for {selectedHackathon.name}</h3>
              <button
                onClick={() => setSelectedHackathon(null)}
                className="text-muted hover:text-ink transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-4 space-y-4">
              <div className="p-3 bg-primarylight border border-primary/20 rounded-md text-xs text-primary font-medium flex items-start gap-2">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  Organizers will review your profile (Bio, University, Tech Stack, Skills, GitHub) along with your application note.
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Applying Student</label>
                <div className="p-2.5 bg-app border border-border rounded-md text-xs text-ink font-medium">
                  {profile.name} • {profile.university || 'Student'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Why do you want to participate? (Optional note)
                </label>
                <textarea
                  rows={3}
                  value={applicationMsg}
                  onChange={(e) => setApplicationMsg(e.target.value)}
                  placeholder="Share a brief note about your interest..."
                  className="w-full p-2.5 bg-card border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedHackathon(null)}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(submittedAppId)}
                  className="px-4 py-1.5 bg-primary hover:bg-primarydark text-white rounded-md text-xs font-display font-medium transition-colors flex items-center gap-1.5"
                >
                  {submittedAppId ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Submitted!
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
