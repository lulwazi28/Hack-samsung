import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building, ArrowRight, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

const DEFAULT_WORKSPACES = [
  { id: 'ws-1', name: 'Autumn Build 2026', teams: 24, judges: 12, status: 'active' },
  { id: 'ws-2', name: 'Spring Hack 2026', teams: 18, judges: 8, status: 'archived' }
];

export default function OrganiserWorkspaces() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Modal State
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState(4);
  const [submitting, setSubmitting] = useState(false);

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

      if (error || !data || data.length === 0) {
        setWorkspaces(DEFAULT_WORKSPACES);
      } else {
        // Fetch team and judge counts per workspace
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
              teams: teamCount || 0,
              judges: judgeCount || 0,
              status: ws.status || 'active',
            };
          })
        );
        setWorkspaces(formatted);
      }
    } catch (err) {
      console.warn('Error fetching workspaces, fallback to defaults:', err);
      setWorkspaces(DEFAULT_WORKSPACES);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    
    const wsId = `ws-${Date.now()}`;
    const newWsObj = {
      id: wsId,
      name: newName.trim(),
      max_team_size: newLimit,
      status: 'active'
    };
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        newWsObj.organizer_id = user.id;
      }

      const { error } = await supabase
        .from('workspaces')
        .insert([newWsObj]);

      if (error) {
        console.error('Supabase workspace insert error:', error);
      }

      // Also create initial event_details entry
      await supabase
        .from('event_details')
        .insert([{
          workspace_id: wsId,
          eventName: newName.trim(),
          roundLabel: 'Round 1 — Live Judging',
          max_team_size: newLimit
        }]);

      setWorkspaces(prev => [{
        id: wsId,
        name: newName.trim(),
        teams: 0,
        judges: 0,
        status: 'active'
      }, ...prev]);

    } catch (err) {
      console.error('Failed creating workspace:', err);
    } finally {
      setSubmitting(false);
      setShowModal(false);
      setNewName('');
      setNewLimit(4);
    }
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
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-app text-ink font-sans">
      <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
            <Building className="h-4 w-4 text-primary" />
          </div>
          <h1 className="font-display font-semibold text-lg text-ink">Your Workspaces</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-muted hover:text-ink text-sm transition-colors">
            Log out
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-fg rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Workspace
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-medium text-ink">Select a Hackathon</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces..." 
              className="pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:border-primary/50 text-ink w-64 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted text-sm gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading workspaces...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkspaces.map((ws) => (
              <div 
                key={ws.id} 
                onClick={() => handleSelectWorkspace(ws.id)}
                className="group bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-colors" />
                
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-display font-medium text-ink text-lg">{ws.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    ws.status === 'active' ? 'bg-successlight text-success' : 'bg-app text-muted'
                  }`}>
                    {ws.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted mb-6">
                  <div><span className="text-ink font-medium">{ws.teams}</span> Teams</div>
                  <div><span className="text-ink font-medium">{ws.judges}</span> Judges</div>
                </div>
                
                <div className="flex items-center justify-between text-primary text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                  <span>Enter Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-medium text-ink text-lg">Create Workspace</h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Hackathon Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-ink focus:outline-none focus:border-primary/50 shadow-sm"
                  placeholder="e.g. Winter Hack 2026"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Max Team Size</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={newLimit}
                  onChange={(e) => setNewLimit(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-ink focus:outline-none focus:border-primary/50 shadow-sm"
                />
                <p className="text-xs text-muted mt-1.5">Students will be able to form teams up to this size.</p>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-fg rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
