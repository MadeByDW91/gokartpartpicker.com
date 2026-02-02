'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ChevronRight,
  Check,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { getAdminNotifications, type AdminNotification } from '@/actions/admin/notifications';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'admin-notifications-read';

type ReadNotification = AdminNotification & { readAt: string };

function loadReadMap(): Record<string, ReadNotification> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ReadNotification>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveReadMap(map: Record<string, ReadNotification>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to persist read notifications:', e);
  }
}

interface AdminNotificationsProps {
  className?: string;
}

export function AdminNotifications({ className }: AdminNotificationsProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'unread' | 'read'>('unread');
  const [readMap, setReadMap] = useState<Record<string, ReadNotification>>({});

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await getAdminNotifications();
      if (result.success && result.data) {
        setNotifications(result.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setReadMap(loadReadMap());
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unread = notifications.filter((n) => !readMap[n.id]);
  const readList = Object.values(readMap);
  const unreadCount = unread.reduce((s, n) => s + n.count, 0);
  const unreadHasWarnings = unread.some(
    (n) => n.severity === 'warning' || n.severity === 'error'
  );

  const markAsRead = (n: AdminNotification) => {
    const next: Record<string, ReadNotification> = {
      ...readMap,
      [n.id]: { ...n, readAt: new Date().toISOString() },
    };
    setReadMap(next);
    saveReadMap(next);
  };

  const markAllAsRead = () => {
    const next = { ...readMap };
    for (const n of unread) {
      next[n.id] = { ...n, readAt: new Date().toISOString() };
    }
    setReadMap(next);
    saveReadMap(next);
  };

  const clearRead = () => {
    setReadMap({});
    saveReadMap({});
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const renderNotificationRow = (
    notification: AdminNotification | ReadNotification,
    options: { showMarkRead?: boolean; isRead?: boolean }
  ) => {
    const { showMarkRead = false, isRead = false } = options;
    return (
      <div
        key={notification.id}
        className={cn(
          'flex items-start gap-3 p-4 hover:bg-olive-700/50 transition-colors',
          getSeverityColor(notification.severity),
          isRead && 'opacity-80'
        )}
      >
        <div className="shrink-0 mt-0.5">{getSeverityIcon(notification.severity)}</div>
        <Link
          href={notification.href}
          onClick={() => setOpen(false)}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-cream-100 text-sm">{notification.title}</h4>
            <Badge
              variant={
                notification.severity === 'error'
                  ? 'error'
                  : notification.severity === 'warning'
                    ? 'warning'
                    : 'default'
              }
              size="sm"
            >
              {notification.count}
            </Badge>
          </div>
          <p className="text-sm text-cream-300 mb-2">{notification.message}</p>
          {notification.actionLabel && (
            <div className="flex items-center gap-1 text-xs text-orange-400 font-medium">
              <span>{notification.actionLabel}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </Link>
        {showMarkRead && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              markAsRead(notification);
            }}
            className="shrink-0 p-1.5 text-cream-400 hover:text-green-400 hover:bg-olive-600 rounded transition-colors"
            title="Mark as read"
            aria-label="Mark as read"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn('relative', className)}>
        <button
          className="relative p-2 text-cream-300 hover:text-cream-100 hover:bg-olive-700 rounded-md transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative p-2 rounded-md transition-all',
          unreadHasWarnings
            ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 ring-2 ring-amber-500/30'
            : unreadCount > 0
              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
              : 'text-cream-300 hover:text-cream-100 hover:bg-olive-700'
        )}
        aria-label="Notifications"
      >
        <Bell className={cn('w-5 h-5', unreadHasWarnings && 'animate-pulse')} />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold shadow-lg',
              unreadHasWarnings
                ? 'bg-amber-500 text-cream-100 animate-pulse'
                : 'bg-blue-500 text-cream-100'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-olive-800 border border-olive-600 rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-olive-600">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cream-300" />
                <h3 className="font-semibold text-cream-100">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="default" size="sm">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="p-1.5 text-cream-400 hover:text-cream-100 hover:bg-olive-700 rounded transition-colors"
                    title="Mark all as read"
                    aria-label="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-cream-400 hover:text-cream-100 hover:bg-olive-700 rounded transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-olive-600">
              <button
                type="button"
                onClick={() => setTab('unread')}
                className={cn(
                  'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                  tab === 'unread'
                    ? 'text-orange-400 border-b-2 border-orange-400 bg-olive-700/30'
                    : 'text-cream-400 hover:text-cream-200 hover:bg-olive-700/20'
                )}
              >
                Unread
                {unread.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-olive-600 px-1.5 py-0.5 text-xs">
                    {unread.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab('read')}
                className={cn(
                  'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                  tab === 'read'
                    ? 'text-orange-400 border-b-2 border-orange-400 bg-olive-700/30'
                    : 'text-cream-400 hover:text-cream-200 hover:bg-olive-700/20'
                )}
              >
                Read
                {readList.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-olive-600 px-1.5 py-0.5 text-xs">
                    {readList.length}
                  </span>
                )}
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {tab === 'unread' && (
                <>
                  {unread.length === 0 ? (
                    <div className="p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-olive-500 mx-auto mb-3" />
                      <p className="text-cream-400">No unread notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-olive-600">
                      {unread.map((n) => renderNotificationRow(n, { showMarkRead: true }))}
                    </div>
                  )}
                </>
              )}
              {tab === 'read' && (
                <>
                  {readList.length === 0 ? (
                    <div className="p-8 text-center">
                      <Check className="w-12 h-12 text-olive-500 mx-auto mb-3" />
                      <p className="text-cream-400">No read notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-olive-600">
                      {readList.map((n) =>
                        renderNotificationRow(n, { isRead: true })
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-3 border-t border-olive-600 bg-olive-700/30 space-y-2">
              {tab === 'read' && readList.length > 0 && (
                <button
                  type="button"
                  onClick={clearRead}
                  className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-cream-400 hover:text-red-400 hover:bg-olive-600/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear read
                </button>
              )}
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block text-center text-sm text-cream-400 hover:text-cream-100 transition-colors"
              >
                View dashboard
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
