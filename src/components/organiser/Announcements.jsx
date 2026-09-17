import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, X, Megaphone } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

export default function Announcements() {
  const { postAnnouncement, activeWorkspaceId } = useOutletContext();
  const [sent, setSent] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState({ Teams: true, Judges: true, Organisers: false });

  useEffect(() => {
    async function fetchAnnouncements() {
      if (!activeWorkspaceId) return;
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('workspace_id', activeWorkspaceId)
        .order('time', { ascending: false });

      if (data && data.length > 0) {
        setSent(data);
      } else {
        setSent([
          {
            title: 'Welcome to the Hackathon!',
            message: 'Hackathon submissions are officially open. Check your dashboard for submission deadlines.',
            audience: ['Teams', 'Judges'],
            time: 'Just now'
          }
        ]);
      }
    }
    fetchAnnouncements();
  }, [activeWorkspaceId]);

  function toggleAudience(key) {
    setAudience((a) => ({ ...a, [key]: !a[key] }));
  }

  async function handleSend() {
    if (!title.trim() || !message.trim()) return;
    const targets = Object.entries(audience).filter(([, v]) => v).map(([k]) => k);

    if (postAnnouncement) {
      await postAnnouncement(title, message, targets);
    }

    setSent((s) => [{ title, message, audience: targets, time: 'Just now' }, ...s]);

    setTitle('');
    setMessage('');
    setOpen(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold mb-1 text-ink">Announcements & Broadcasts</h1>
          <p className="text-sm text-muted">Send updates directly to teams and judges in this workspace.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md font-display text-sm font-semibold text-white bg-primary hover:bg-primarydark transition-colors shrink-0 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Broadcast
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
        {sent.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted">No announcements broadcasted yet.</div>
        ) : (
          sent.map((a, i) => (
            <div key={i} className="px-6 py-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display font-semibold text-ink text-sm flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" /> {a.title}
                </p>
                <span className="text-xs text-muted shrink-0">{a.time}</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{a.message}</p>
              <div className="flex gap-1.5 pt-1">
                {a.audience?.map((aud) => (
                  <span key={aud} className="text-[10px] uppercase tracking-wider bg-app border border-border rounded-md px-2 py-0.5 text-muted font-medium">
                    {aud}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-ink">Create Broadcast</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-ink transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Broadcast Title</label>
                <input
                  type="text"
                  placeholder="e.g. Submissions Deadline Extended"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-border rounded-md px-3 py-2 text-xs text-ink outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Broadcast Message</label>
                <textarea
                  rows={4}
                  placeholder="Enter the announcement message to display on participants' portals..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white border border-border rounded-md px-3 py-2 text-xs text-ink outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-2">Target Audience</label>
                <div className="flex gap-4">
                  {Object.keys(audience).map((key) => (
                    <label key={key} className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={audience[key]}
                        onChange={() => toggleAudience(key)}
                        className="rounded border-border text-primary focus:ring-primary/30"
                      />
                      {key}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-md font-display text-xs font-medium text-muted hover:text-ink transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleSend} className="px-4 py-2 rounded-md font-display text-xs font-semibold text-white bg-primary hover:bg-primarydark transition-colors">
                Broadcast Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
