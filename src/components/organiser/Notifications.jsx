import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ClipboardList, FileText, Users, Bell, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

const ICONS = { ClipboardList, FileText, Users, Bell };

export default function Notifications() {
  const { activeWorkspaceId } = useOutletContext();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchNotifications() {
      if (!activeWorkspaceId) return;
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('workspace_id', activeWorkspaceId)
        .order('time', { ascending: false });

      if (data && data.length > 0) {
        setNotifications(data);
      } else {
        setNotifications([
          { id: 1, text: 'New student team registered for this hackathon.', icon: 'Users', unread: true, time: '10 mins ago' },
          { id: 2, text: 'Judge J-01 submitted team score evaluation.', icon: 'ClipboardList', unread: false, time: '1 hour ago' },
        ]);
      }
    }
    fetchNotifications();
  }, [activeWorkspaceId]);

  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    await supabase.from('notifications').update({ unread: false }).eq('workspace_id', activeWorkspaceId);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold mb-1 text-ink">Notifications & Operational Alerts</h1>
          <p className="text-sm text-muted">Real-time alerts for registrations, evaluations, and deadlines.</p>
        </div>
        {notifications.some(n => n.unread) && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted">No operational notifications for this workspace.</div>
        ) : (
          notifications.map((n, i) => {
            const IconComponent = ICONS[n.icon] || Bell;
            return (
              <div key={n.id || i} className="flex items-start gap-3 px-6 py-4 hover:bg-app/40 transition-colors">
                <span className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.unread ? 'bg-primarylight text-primary' : 'bg-app text-muted'}`}>
                  <IconComponent className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className={`text-xs ${n.unread ? 'text-ink font-semibold' : 'text-muted'}`}>{n.text}</p>
                  <p className="text-[11px] text-muted mt-0.5">{n.time}</p>
                </div>
                {n.unread && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
