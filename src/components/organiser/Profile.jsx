import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, ShieldCheck, Key, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

export default function Profile() {
  const { organiser, teams, judges, activeWorkspace } = useOutletContext();
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setLoading(true);
    setStatusMsg('');

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStatusMsg('Password updated successfully!');
      setNewPassword('');
    } catch (err) {
      setStatusMsg(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold mb-1 text-ink">Organiser Account Profile</h1>
        <p className="text-sm text-muted">Manage your authentication details and workspace access.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-border pb-5">
          <div className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center font-display text-lg font-semibold shadow-sm">
            OR
          </div>
          <div>
            <p className="font-display text-lg font-bold text-ink">{organiser?.email}</p>
            <p className="text-xs text-muted flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Verified Competition Organiser
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="bg-app p-3 rounded-lg border border-border">
            <p className="text-muted mb-1">Active Workspace</p>
            <p className="font-bold text-ink truncate">{activeWorkspace?.name || 'Autumn Build'}</p>
          </div>
          <div className="bg-app p-3 rounded-lg border border-border">
            <p className="text-muted mb-1">Teams Managed</p>
            <p className="font-bold text-ink">{teams.length}</p>
          </div>
          <div className="bg-app p-3 rounded-lg border border-border">
            <p className="text-muted mb-1">Judges Managed</p>
            <p className="font-bold text-ink">{judges.length}</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="pt-2 border-t border-border space-y-4">
          <h3 className="font-display font-semibold text-xs text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Key className="h-4 w-4 text-primary" /> Security & Password
          </h3>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">New Password</label>
            <input
              type="password"
              placeholder="Enter new account password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-xs text-ink outline-none focus:border-primary/50"
            />
          </div>

          {statusMsg && (
            <p className="text-xs font-semibold text-success flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> {statusMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !newPassword.trim()}
            className="px-4 py-2 bg-primary hover:bg-primarydark disabled:opacity-50 text-white rounded-md text-xs font-display font-semibold transition-colors"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
