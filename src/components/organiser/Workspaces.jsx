import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building, ArrowRight, X, Loader2, Edit3, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

const DEFAULT_WORKSPACES = [
  { id: 'ws-1', name: 'Autumn Build 2026', description: 'Build futuristic mobile and IoT applications.', teams: 24, judges: 12, maxTeamSize: 4, status: 'active' },
  { id: 'ws-2', name: 'Spring Hack 2026', description: 'Architect secure decentralized finance apps.', teams: 18, judges: 8, maxTeamSize: 5, status: 'archived' }
];

export default function OrganiserWorkspaces() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [deletingWorkspace, setDeletingWorkspace] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  async function fetchWorkspaces() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workspaces from Supabase:', error.message);
        setFeedback({ type: 'error', text: `Database error: ${error.message}` });
        setWorkspaces([]);
        return;
      }

      if (!data || data.length === 0) {
        setWorkspaces([]);
      } else {
        const formatted = await Promise.all(
          data.map(async (ws) => {
            const { count: teamCount } = await supabase
              .from('teams')
              .select('*', { count: 'exact', head: true })
              .eq('workspace_id', ws.id);

            const { count: judgeCount } = await supabase
              .from('judges')
              .select('*', { count: 'exact', head: true })
              .eq('workspace_id', ws.id);

            return {
              id: ws.id,
              name: ws.name,
              description: ws.description || 'Build innovative products using Samsung SDKs and Cloud technologies.',
              teams: teamCount || 0,
              judges: judgeCount || 0,
              maxTeamSize: ws.max_team_size || 4,
              status: ws.status || 'active',
            };
          })
        );
        setWorkspaces(formatted);
      }
    } catch (err) {
      console.error('Unexpected error fetching workspaces:', err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }

  // CREATE WORKSPACE
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const wsId = `ws-${Date.now()}`;
    const newWsObj = {
      id: wsId,
      name: name.trim(),
      description: description.trim() || 'Build innovative products using Samsung SDKs and Cloud technologies.',
      max_team_size: maxTeamSize,
      status: status,
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        newWsObj.organizer_id = user.id;
      }

      const { error: wsErr } = await supabase.from('workspaces').insert([newWsObj]);
      if (wsErr) {
        console.error('Supabase workspace insert error:', wsErr);
        throw new Error(wsErr.message);
      }

      // Create event details
      const { error: eventErr } = await supabase.from('event_details').insert([{
        workspace_id: wsId,
        event_name: name.trim(),
        round_label: 'Round 1 — Live Judging',
        max_team_size: maxTeamSize,
      }]);

      if (eventErr) {
        console.warn('Event details creation note:', eventErr.message);
      }

      // Refresh directly from cloud database
      await fetchWorkspaces();
      setFeedback({ type: 'success', text: `Workspace "${name.trim()}" created successfully in Cloud DB!` });
    } catch (err) {
      console.error('Failed creating workspace in Supabase:', err);
      setFeedback({ type: 'error', text: `Failed creating workspace: ${err.message}` });
    } finally {
      setSubmitting(false);
      setShowCreateModal(false);
      resetForm();
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // UPDATE WORKSPACE
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingWorkspace || !name.trim()) return;
    setSubmitting(true);

    try {
      const { error: wsErr } = await supabase
        .from('workspaces')
        .update({
          name: name.trim(),
          description: description.trim(),
          max_team_size: maxTeamSize,
          status: status,
        })
        .eq('id', editingWorkspace.id);

      if (wsErr) {
        console.error('Supabase workspace update error:', wsErr);
        throw new Error(wsErr.message);
      }

      await supabase
        .from('event_details')
        .update({
          event_name: name.trim(),
          max_team_size: maxTeamSize,
        })
        .eq('workspace_id', editingWorkspace.id);

      await fetchWorkspaces();
      setFeedback({ type: 'success', text: `Workspace "${name.trim()}" updated successfully in Cloud DB!` });
    } catch (err) {
      console.error('Failed updating workspace:', err);
      setFeedback({ type: 'error', text: `Failed updating workspace: ${err.message}` });
    } finally {
      setSubmitting(false);
      setEditingWorkspace(null);
      resetForm();
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // DELETE WORKSPACE
  const handleDelete = async () => {
    if (!deletingWorkspace) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', deletingWorkspace.id);

      if (error) {
        console.error('Supabase workspace delete error:', error);
        throw new Error(error.message);
      }

      await fetchWorkspaces();
      setFeedback({ type: 'success', text: `Workspace "${deletingWorkspace.name}" deleted from Cloud DB.` });
    } catch (err) {
      console.error('Failed deleting workspace:', err);
      setFeedback({ type: 'error', text: `Failed deleting workspace: ${err.message}` });
    } finally {
      setSubmitting(false);
      setDeletingWorkspace(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const openEditModal = (ws, e) => {
    e.stopPropagation();
    setEditingWorkspace(ws);
    setName(ws.name);
    setDescription(ws.description || '');
    setMaxTeamSize(ws.maxTeamSize || 4);
    setStatus(ws.status || 'active');
  };

  const openDeleteModal = (ws, e) => {
    e.stopPropagation();
    setDeletingWorkspace(ws);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setMaxTeamSize(4);
    setStatus('active');
  };

  const handleSelectWorkspace = (wsId) => {
    localStorage.setItem('hj_active_workspace_id', wsId);
    navigate(`/organiser?ws=${wsId}`);
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(search.toLowerCase()) ||
    ws.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-app text-ink font-sans">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primarylight flex items-center justify-center">
            <Building className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-base text-ink">Competition Workspaces</h1>
            <p className="text-xs text-muted">Manage all hackathon workspaces & competition setups</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-muted hover:text-ink text-xs font-medium transition-colors">
            Log out
          </button>
          <button 
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-xs font-display font-semibold hover:bg-primarydark transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Workspace
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-semibold text-ink">Select a Competition Workspace</h2>
            <p className="text-xs text-muted">Click any workspace card to open its control room dashboard.</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces..." 
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-md text-xs focus:outline-none focus:border-primary/50 text-ink shadow-sm"
            />
          </div>
        </div>

        {feedback && (
          <div className={`mb-6 p-3 rounded-md text-xs font-medium flex items-center gap-2 border ${
            feedback.type === 'success' ? 'bg-successlight text-success border-success/30' : 'bg-dangerlight text-danger border-danger/30'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            {feedback.text}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted text-xs gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading workspaces...
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card">
            <Building className="h-8 w-8 text-muted mx-auto mb-2" />
            <h3 className="font-display font-medium text-ink text-sm mb-1">No Workspaces Found</h3>
            <p className="text-xs text-muted mb-4">No competition workspace matches your search query.</p>
            <button
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              className="px-4 py-2 bg-primary text-white text-xs font-display font-medium rounded-md hover:bg-primarydark transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkspaces.map((ws) => (
              <div 
                key={ws.id} 
                onClick={() => handleSelectWorkspace(ws.id)}
                className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer hover:shadow-md relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-colors" />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display font-semibold text-ink text-base group-hover:text-primary transition-colors line-clamp-1">
                      {ws.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                      ws.status === 'active' ? 'bg-successlight text-success' : 'bg-app text-muted border border-border'
                    }`}>
                      {ws.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted line-clamp-2 mb-4">
                    {ws.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-muted bg-app p-2.5 rounded-lg border border-border mb-4">
                    <div>Teams: <strong className="text-ink">{ws.teams}</strong></div>
                    <div>Judges: <strong className="text-ink">{ws.judges}</strong></div>
                    <div>Max Size: <strong className="text-ink">{ws.maxTeamSize}</strong></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => openEditModal(ws, e)}
                        title="Edit Workspace"
                        className="p-1.5 text-muted hover:text-primary hover:bg-primarylight rounded transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => openDeleteModal(ws, e)}
                        title="Delete Workspace"
                        className="p-1.5 text-muted hover:text-danger hover:bg-dangerlight rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-primary text-xs font-display font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Open</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE WORKSPACE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-semibold text-ink text-base">Create Competition Workspace</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-ink transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Workspace / Hackathon Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                  placeholder="e.g. Samsung AI Challenge 2026"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Description / Overview</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                  placeholder="Describe the hackathon goals and guidelines..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Max Team Size</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(parseInt(e.target.value) || 4)}
                    className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-md text-xs font-medium text-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-white rounded-md text-xs font-display font-semibold hover:bg-primarydark transition-colors flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WORKSPACE MODAL */}
      {editingWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-semibold text-ink text-base">Edit Workspace</h3>
              <button onClick={() => setEditingWorkspace(null)} className="text-muted hover:text-ink transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Hackathon Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Max Team Size</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(parseInt(e.target.value) || 4)}
                    className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs text-ink outline-none focus:border-primary/50"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingWorkspace(null)}
                  className="px-4 py-2 rounded-md text-xs font-medium text-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-white rounded-md text-xs font-display font-semibold hover:bg-primarydark transition-colors flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE WORKSPACE CONFIRMATION MODAL */}
      {deletingWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-dangerlight text-danger flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-ink text-base mb-1">Delete Workspace</h3>
            <p className="text-xs text-muted mb-6">
              Are you sure you want to delete <strong>"{deletingWorkspace.name}"</strong>? This will remove all associated teams, judges, and submissions.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingWorkspace(null)}
                className="px-4 py-2 bg-app text-ink rounded-md text-xs font-display font-medium border border-border hover:bg-border/30 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 bg-danger hover:bg-red-700 text-white rounded-md text-xs font-display font-semibold transition-colors flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
