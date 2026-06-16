import { create } from 'zustand';

export type NotificationSeverity = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  severity: NotificationSeverity;
}

interface NotificationState {
  notifications: Notification[];
  notify: (message: string, severity?: NotificationSeverity) => void;
  dismiss: (id: string) => void;
}

/**
 * Lightweight global notification queue, rendered by <Notifier /> as MUI
 * snackbars. Covers the "уведомления об ошибках/успехе" requirement.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  notify: (message, severity = 'info') =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: crypto.randomUUID(), message, severity },
      ],
    })),
  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

/** Convenience accessor for use outside React components. */
export const notify = (message: string, severity: NotificationSeverity = 'info') =>
  useNotificationStore.getState().notify(message, severity);
