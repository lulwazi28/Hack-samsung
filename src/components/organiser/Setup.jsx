import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Github, Linkedin, Twitter, Globe, CheckCircle2, XCircle, Clock, GraduationCap, Code, Award, ExternalLink } from 'lucide-react';
import { assignmentsForTeam } from '../../lib/scoring.js';
import { RUBRIC, RUBRIC_TOTAL } from '../../data/rubric.js';
import StatusPill from '../shared/StatusPill.jsx';
import { useHackathon } from '../../context/HackathonContext.jsx';

const SUB_TABS = ['Applications', 'Teams', 'Judges', 'Criteria', 'Deadlines', 'Settings'];
const CATEGORIES = ['Environment', 'Education', 'Health', 'Technology', 'Fintech'];

function ConfirmRemove({ label, onConfirm, onCancel }) {
  return (
    <span className="flex items-center gap-2 text-xs">
      <span className="text-muted">Remove {label}?</span>
      <button type="button" onClick={onConfirm} className="text-danger font-display hover:underline">Confirm</button>
      <button type="button" onClick={onCancel} className="text-muted font-display hover:underline">Cancel</button>
    </span>
  );
}

function ApplicationsTab() {
  const { applications, updateApplicationStatus } = useHackathon();
  const [selectedApp, setSelectedApp] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Student Workspace Applications</h2>
          <p className="text-xs text-muted">Review student profiles, skills, and GitHub links to approve workspace access.</p>
        </div>
        <span className="text-xs bg-app px-3 py-1 rounded-full border border-border text-muted font-medium">
          {applications.length} Applicants Total
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl text-xs text-muted">
          No student applications submitted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => {
            const sp = app.studentProfile || {};
            return (
              <div key={app.id} className="border border-border rounded-2xl p-5 bg-card shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
                <div>
                  {/* Top Bar with Avatar & Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {sp.avatar ? (
                        <img src={sp.avatar} alt={sp.name} className="w-11 h-11 rounded-full object-cover border border-primary/30 shadow-sm" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                          {sp.name?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-display font-semibold text-ink text-sm">{sp.name || 'Applicant'}</h3>
                        <p className="text-xs text-muted flex items-center gap-1">
                          <GraduationCap className="h-3 w-3 text-primary" /> {sp.university || 'University Student'}
                        </p>
                      </div>
                    </div>

                    {app.status === 'Approved' && (
                      <span className="px-2.5 py-1 rounded-full bg-successlight text-success text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                      </span>
                    )}
                    {app.status === 'Declined' && (
                      <span className="px-2.5 py-1 rounded-full bg-dangerlight text-danger text-xs font-semibold flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Declined
                      </span>
                    )}
                    {app.status === 'Pending' && (
                      <span className="px-2.5 py-1 rounded-full bg-warninglight text-warning text-xs font-semibold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Pending
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {sp.bio && (
                    <p className="text-xs text-ink/80 bg-app p-3 rounded-xl border border-border/50 mb-3 line-clamp-3">
                      "{sp.bio}"
                    </p>
                  )}

                  {/* Application Note */}
                  {app.message && (
                    <div className="text-xs text-muted mb-4">
                      <span className="font-semibold text-ink">Application Note:</span> {app.message}
                    </div>
                  )}

                  {/* Tech Stack & Skills */}
                  <div className="space-y-2 mb-4">
                    {sp.techStack && sp.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {sp.techStack.map((tech) => (
                          <span key={tech} className="px-2 py-0.5 rounded bg-primarylight text-primary text-[10px] font-medium border border-primary/20">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {sp.skills && sp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {sp.skills.map((skill) => (
                          <span key={skill} className="px-2 py-0.5 rounded bg-successlight text-success text-[10px] font-medium border border-success/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center gap-3 pt-3 border-t border-border text-xs text-muted mb-4">
                    {sp.github && (
                      <a href={sp.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-ink hover:text-primary font-medium">
                        <Github className="h-3.5 w-3.5" /> GitHub <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    {sp.socials?.linkedin && (
                      <a href={sp.socials.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                      </a>
                    )}
                    {sp.socials?.portfolio && (
                      <a href={sp.socials.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-600 hover:underline">
                        <Globe className="h-3.5 w-3.5" /> Portfolio
                      </a>
                    )}
                  </div>
                </div>

                {/* Approve & Decline Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => updateApplicationStatus(app.id, 'Declined')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      app.status === 'Declined'
                        ? 'bg-dangerlight text-danger border border-danger/30'
                        : 'bg-app text-muted hover:text-danger hover:bg-dangerlight'
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Decline
                  </button>

                  <button
                    onClick={() => updateApplicationStatus(app.id, 'Approved')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      app.status === 'Approved'
                        ? 'bg-success text-white'
                        : 'bg-primary hover:bg-primarydark text-white shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Grant Access
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeamsTab({ teams, addTeam, removeTeam }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [removing, setRemoving] = useState(null);

  const rows = teams
    .map((t, i) => ({ ...t, category: CATEGORIES[i % CATEGORIES.length] }))
    .filter((t) => {
      const matchesSearch = !search.trim() || t.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === 'All Statuses' || (statusFilter === 'Active') === t.submitted;
      const matchesCategory = categoryFilter === 'All Categories' || t.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-semibold">Manage Teams</h2>
          <p className="text-sm text-muted">Students create their own teams up to the limit defined in Settings. Review and approve them here.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-border rounded-md px-3 py-2 text-sm text-muted outline-none focus:ring-2 focus:ring-primary/30">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Pending</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white border border-border rounded-md px-3 py-2 text-sm text-muted outline-none focus:ring-2 focus:ring-primary/30">
          <option>All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
              <th className="px-5 py-3 font-display font-semibold">Team Name</th>
              <th className="px-5 py-3 font-display font-semibold">Category</th>
              <th className="px-5 py-3 font-display font-semibold">Status</th>
              <th className="px-5 py-3 font-display font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="px-5 py-3 font-display font-medium">{t.name}</td>
                <td className="px-5 py-3 text-muted">{t.category}</td>
                <td className="px-5 py-3"><StatusPill tone={t.submitted ? 'success' : 'neutral'}>{t.submitted ? 'Active' : 'Pending'}</StatusPill></td>
                <td className="px-5 py-3 text-right">
                  {t.submitted ? (
                     removing === t.id ? (
                       <ConfirmRemove label={t.name} onConfirm={() => { removeTeam(t.id, t.name); setRemoving(null); }} onCancel={() => setRemoving(null)} />
                     ) : (
                       <button type="button" onClick={() => setRemoving(t.id)} className="text-xs text-muted hover:text-danger transition-colors">Remove</button>
                     )
                  ) : (
                     <div className="flex items-center justify-end gap-2">
                       <button type="button" className="text-xs text-muted hover:text-danger transition-colors">Reject</button>
                       <button type="button" className="text-xs text-primary font-medium hover:underline">Approve</button>
                     </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JudgesTab({ teams, judges, assignments, addJudge, removeJudge, assignJudgeToTeam, unassignJudgeFromTeam, autoAssignJudges }) {
  const [showModal, setShowModal] = useState(false);
  const [judgeForm, setJudgeForm] = useState({
    name: '',
    email: '',
    password: '',
    code: '',
    title: '',
  });
  const [removing, setRemoving] = useState(null);
  const [confirmingAuto, setConfirmingAuto] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});

  const toggleShowPassword = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!judgeForm.name.trim() || !judgeForm.email.trim()) return;

    addJudge(judgeForm);
    setJudgeForm({ name: '', email: '', password: '', code: '', title: '' });
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-ink text-base">Manage Workspace Judges</h2>
            <p className="text-xs text-muted">Judges added here are scoped exclusively to this workspace and can log in to evaluate assigned teams.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-md font-display text-xs font-semibold text-white bg-primary hover:bg-primarydark transition-colors flex items-center gap-1.5 shadow-sm"
          >
            + Add Judge
          </button>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide bg-app/50">
                <th className="px-5 py-3 font-display font-semibold">Judge Name & Code</th>
                <th className="px-5 py-3 font-display font-semibold">Login Email</th>
                <th className="px-5 py-3 font-display font-semibold">Login Password</th>
                <th className="px-5 py-3 font-display font-semibold">Title / Org</th>
                <th className="px-5 py-3 font-display font-semibold">Assigned</th>
                <th className="px-5 py-3 font-display font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {judges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-xs text-muted">
                    No judges added to this workspace yet. Click "+ Add Judge" above.
                  </td>
                </tr>
              ) : (
                judges.map((j) => {
                  const count = assignments.filter((a) => a.judgeId === j.id).length;
                  const isVisible = showPasswords[j.id];
                  return (
                    <tr key={j.id} className="hover:bg-app/30 transition-colors">
                      <td className="px-5 py-3.5 font-display font-medium">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink">{j.name || `Judge ${j.code}`}</span>
                          <span className="px-2 py-0.5 rounded bg-primarylight text-primary text-[10px] font-bold font-mono">
                            {j.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-ink font-mono">{j.email || `judge.${j.code?.toLowerCase()}@hackathon.com`}</td>
                      <td className="px-5 py-3.5 text-xs text-muted font-mono">
                        <div className="flex items-center gap-2">
                          <span>{isVisible ? (j.password || 'JudgePass2026!') : '••••••••'}</span>
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(j.id)}
                            className="text-[10px] text-primary hover:underline font-sans"
                          >
                            {isVisible ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted">{j.title || 'Official Judge'}</td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-ink">{count} team{count !== 1 ? 's' : ''}</td>
                      <td className="px-5 py-3.5 text-right">
                        {removing === j.id ? (
                          <ConfirmRemove label={j.name || j.code} onConfirm={() => { removeJudge(j.id, j.code); setRemoving(null); }} onCancel={() => setRemoving(null)} />
                        ) : (
                          <button type="button" onClick={() => setRemoving(j.id)} className="text-xs text-muted hover:text-danger transition-colors font-medium">
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Judge Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-semibold text-ink text-base">Add Workspace Judge</h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink text-sm">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Judge Name *</label>
                <input
                  type="text"
                  required
                  value={judgeForm.name}
                  onChange={(e) => setJudgeForm({ ...judgeForm, name: e.target.value })}
                  placeholder="e.g. Dr. Sarah Connor"
                  className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Login Email *</label>
                <input
                  type="email"
                  required
                  value={judgeForm.email}
                  onChange={(e) => setJudgeForm({ ...judgeForm, email: e.target.value })}
                  placeholder="e.g. sarah.judge@samsung.com"
                  className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Login Password *</label>
                <input
                  type="text"
                  required
                  value={judgeForm.password}
                  onChange={(e) => setJudgeForm({ ...judgeForm, password: e.target.value })}
                  placeholder="e.g. SecureJudge2026!"
                  className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Judge Code</label>
                  <input
                    type="text"
                    value={judgeForm.code}
                    onChange={(e) => setJudgeForm({ ...judgeForm, code: e.target.value })}
                    placeholder="e.g. J-01"
                    className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Title / Organization</label>
                  <input
                    type="text"
                    value={judgeForm.title}
                    onChange={(e) => setJudgeForm({ ...judgeForm, title: e.target.value })}
                    placeholder="e.g. AI Architect, Samsung"
                    className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md text-xs font-medium text-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md text-xs font-display font-semibold hover:bg-primarydark transition-colors"
                >
                  Add Judge to Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Judge-to-team Assignments</h2>
          {confirmingAuto ? (
            <span className="flex items-center gap-3 text-xs">
              <span className="text-muted">This resets pairings and clears reassigned scores.</span>
              <button type="button" onClick={() => { autoAssignJudges(); setConfirmingAuto(false); }} className="text-primary font-display hover:underline">Confirm</button>
              <button type="button" onClick={() => setConfirmingAuto(false)} className="text-muted font-display hover:underline">Cancel</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmingAuto(true)} className="text-sm font-display px-3.5 py-1.5 rounded-md border border-border hover:bg-app transition-colors">
              Auto-assign evenly
            </button>
          )}
        </div>
        <ul className="divide-y divide-border border border-border rounded-xl px-5 max-h-96 overflow-y-auto">
          {teams.map((t) => {
            const teamAssignments = assignmentsForTeam(assignments, t.id);
            const assignedIds = new Set(teamAssignments.map((a) => a.judgeId));
            const available = judges.filter((j) => !assignedIds.has(j.id));
            return (
              <li key={t.id} className="py-3">
                <p className="font-display text-sm mb-2">{t.name}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {teamAssignments.map((a) => {
                    const judge = judges.find((j) => j.id === a.judgeId);
                    if (!judge) return null;
                    return (
                      <span key={a.judgeId} className="flex items-center gap-1.5 text-xs bg-app border border-border rounded-full pl-3 pr-1.5 py-1">
                        {judge.code}
                        <button type="button" onClick={() => unassignJudgeFromTeam(a.judgeId, t.id)} className="text-muted hover:text-danger transition-colors leading-none">×</button>
                      </span>
                    );
                  })}
                  {available.length > 0 && (
                    <select
                      defaultValue=""
                      onChange={(e) => { if (e.target.value) assignJudgeToTeam(e.target.value, t.id); e.target.value = ''; }}
                      className="text-xs bg-app border border-border rounded-full px-2.5 py-1 text-muted outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">+ Add judge</option>
                      {available.map((j) => <option key={j.id} value={j.id}>{j.code}</option>)}
                    </select>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function CriteriaTab({ criteria = [], addCriteria, updateCriteria, removeCriteria }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [deletingCriteria, setDeletingCriteria] = useState(null);

  const [label, setLabel] = useState('');
  const [maxPts, setMaxPts] = useState(2);

  const totalPts = criteria.reduce((sum, c) => sum + Number(c.max || 0), 0);

  const handleOpenAdd = () => {
    setLabel('');
    setMaxPts(2);
    setShowAddModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCriteria(c);
    setLabel(c.label);
    setMaxPts(c.max);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    await addCriteria(label.trim(), maxPts);
    setShowAddModal(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCriteria || !label.trim()) return;
    await updateCriteria(editingCriteria.id, label.trim(), maxPts);
    setEditingCriteria(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCriteria) return;
    await removeCriteria(deletingCriteria.id, deletingCriteria.label);
    setDeletingCriteria(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">Judging Criteria & Rubric</h2>
          <p className="text-xs text-muted">Customize criteria and max points for judge evaluation.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1"
        >
          + Add Criterion
        </button>
      </div>

      <div className="border border-border rounded-xl px-5 bg-card">
        {criteria.length === 0 ? (
          <p className="text-xs text-muted py-6 text-center">No criteria added yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {criteria.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium text-ink">{c.label}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted tabular-nums text-xs bg-app px-2.5 py-1 rounded-md border border-border">
                    {c.max} pt{c.max > 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="text-muted hover:text-primary text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCriteria(c)}
                    className="text-muted hover:text-danger text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between text-sm py-3.5 border-t border-border mt-1">
          <span className="font-display font-semibold text-ink">Total Max Score</span>
          <span className="font-display font-semibold tabular-nums text-primary text-base">{totalPts} pts</span>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingCriteria) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-display font-semibold text-lg text-ink">
              {editingCriteria ? 'Edit Criterion' : 'Add New Judging Criterion'}
            </h3>
            <form onSubmit={editingCriteria ? handleSaveEdit : handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1 font-medium">Criterion Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Implementation"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1 font-medium">Max Points</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={maxPts}
                  onChange={(e) => setMaxPts(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingCriteria(null); }}
                  className="px-4 py-2 text-xs font-medium text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  {editingCriteria ? 'Save Changes' : 'Create Criterion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCriteria && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center">
            <h3 className="font-display font-semibold text-base text-ink">Delete Criterion?</h3>
            <p className="text-xs text-muted">Are you sure you want to remove "{deletingCriteria.label}"?</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCriteria(null)}
                className="px-4 py-2 text-xs font-medium text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-danger text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-danger/90"
              >
                Delete Criterion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeadlinesTab({ eventDetails, updateEventDetails }) {
  const [formState, setFormState] = useState({
    eventName: eventDetails.eventName || '',
    roundLabel: eventDetails.roundLabel || '',
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setFormState({
      eventName: eventDetails.eventName || '',
      roundLabel: eventDetails.roundLabel || '',
    });
  }, [eventDetails]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEventDetails(formState);
      setFeedback({ type: 'success', text: 'Event & Deadlines updated successfully in Cloud DB!' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Error saving changes to database.' });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-md space-y-4">
      <div>
        <h2 className="font-display font-semibold text-lg text-ink mb-1">Event & Deadlines</h2>
        <p className="text-xs text-muted mb-4">Basic event details shown across every portal.</p>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs font-medium ${feedback.type === 'success' ? 'bg-successlight text-success border border-success/30' : 'bg-dangerlight text-danger border border-danger/30'}`}>
          {feedback.text}
        </div>
      )}

      <div>
        <label className="block text-xs text-muted mb-1.5 font-medium">Event Name</label>
        <input
          type="text"
          value={formState.eventName}
          onChange={(e) => setFormState(prev => ({ ...prev, eventName: e.target.value }))}
          className="w-full bg-white border border-border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="block text-xs text-muted mb-1.5 font-medium font-medium">Current Round Label</label>
        <input
          type="text"
          value={formState.roundLabel}
          onChange={(e) => setFormState(prev => ({ ...prev, roundLabel: e.target.value }))}
          className="w-full bg-white border border-border rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white font-semibold text-xs px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

function SettingsTab({ eventDetails, updateEventDetails }) {
  const [formState, setFormState] = useState({
    late_submissions: eventDetails.late_submissions || false,
    public_leaderboard: eventDetails.public_leaderboard !== false,
    max_team_size: eventDetails.max_team_size || 4,
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setFormState({
      late_submissions: eventDetails.late_submissions || false,
      public_leaderboard: eventDetails.public_leaderboard !== false,
      max_team_size: eventDetails.max_team_size || 4,
    });
  }, [eventDetails]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEventDetails(formState);
      setFeedback({ type: 'success', text: 'Workspace Settings updated successfully in Cloud DB!' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Error saving settings.' });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-md space-y-4">
      <div>
        <h2 className="font-display font-semibold text-lg text-ink mb-1">Workspace Rules & Settings</h2>
        <p className="text-xs text-muted mb-4">Configure submission rules and team constraints.</p>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs font-medium ${feedback.type === 'success' ? 'bg-successlight text-success border border-success/30' : 'bg-dangerlight text-danger border border-danger/30'}`}>
          {feedback.text}
        </div>
      )}

      <label className="flex items-center justify-between border border-border rounded-xl px-4 py-3 text-sm bg-card cursor-pointer hover:border-primary/40 transition-colors">
        <span className="font-medium text-ink">Allow late submissions</span>
        <input
          type="checkbox"
          checked={formState.late_submissions}
          onChange={(e) => setFormState(prev => ({ ...prev, late_submissions: e.target.checked }))}
          className="rounded border-border text-primary focus:ring-primary/30 h-4 w-4"
        />
      </label>

      <label className="flex items-center justify-between border border-border rounded-xl px-4 py-3 text-sm bg-card cursor-pointer hover:border-primary/40 transition-colors">
        <span className="font-medium text-ink">Show public leaderboard</span>
        <input
          type="checkbox"
          checked={formState.public_leaderboard}
          onChange={(e) => setFormState(prev => ({ ...prev, public_leaderboard: e.target.checked }))}
          className="rounded border-border text-primary focus:ring-primary/30 h-4 w-4"
        />
      </label>

      <div className="border border-border rounded-xl px-4 py-3 bg-card">
        <label className="flex items-center justify-between text-sm mb-1 font-medium text-ink">
          Max Team Members
          <input
            type="number"
            value={formState.max_team_size}
            min={1}
            max={10}
            onChange={(e) => setFormState(prev => ({ ...prev, max_team_size: parseInt(e.target.value) || 4 }))}
            className="w-16 bg-white border border-border rounded-lg px-2.5 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <p className="text-xs text-muted">Maximum number of students allowed per team in this workspace.</p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white font-semibold text-xs px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving Settings...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default function Setup() {
  const {
    teams, judges, assignments, criteria, eventDetails,
    addTeam, removeTeam, addJudge, removeJudge,
    assignJudgeToTeam, unassignJudgeFromTeam, autoAssignJudges,
    addCriteria, updateCriteria, removeCriteria, updateEventDetails,
  } = useOutletContext();
  const [tab, setTab] = useState('Applications');

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold mb-1">Competition Setup & Workspaces</h1>
        <p className="text-sm text-muted">Review student applications, manage teams, judges, assignments, criteria and deadlines.</p>
      </div>

      <div className="flex gap-1 bg-app border border-border rounded-md p-1 w-fit overflow-x-auto">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded text-sm font-display whitespace-nowrap transition-colors ${
              tab === t ? 'bg-white text-ink shadow-card' : 'text-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        {tab === 'Applications' && <ApplicationsTab />}
        {tab === 'Teams' && <TeamsTab teams={teams} addTeam={addTeam} removeTeam={removeTeam} />}
        {tab === 'Judges' && (
          <JudgesTab
            teams={teams} judges={judges} assignments={assignments}
            addJudge={addJudge} removeJudge={removeJudge}
            assignJudgeToTeam={assignJudgeToTeam} unassignJudgeFromTeam={unassignJudgeFromTeam}
            autoAssignJudges={autoAssignJudges}
          />
        )}
        {tab === 'Criteria' && (
          <CriteriaTab
            criteria={criteria}
            addCriteria={addCriteria}
            updateCriteria={updateCriteria}
            removeCriteria={removeCriteria}
          />
        )}
        {tab === 'Deadlines' && <DeadlinesTab eventDetails={eventDetails} updateEventDetails={updateEventDetails} />}
        {tab === 'Settings' && <SettingsTab eventDetails={eventDetails} updateEventDetails={updateEventDetails} />}
      </div>
    </div>
  );
}
