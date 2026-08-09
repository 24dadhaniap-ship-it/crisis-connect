import React, { useState, useEffect } from 'react';
import { Bell, Check, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { NotificationItem } from '../types';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const res = await apiRequest<NotificationItem[]>('/notifications');
    if (res.success && res.data) {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Emergency Alerts
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No notifications right now
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={n._id || `notif_${idx}`}
                  className={`p-3.5 transition-colors ${
                    !n.isRead ? 'bg-slate-800/40' : 'bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> {n.title}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-normal">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
