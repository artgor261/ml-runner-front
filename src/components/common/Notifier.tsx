import { Alert, Snackbar, Stack } from '@mui/material';
import { useNotificationStore } from '../../store/notificationStore';

/**
 * Renders queued global notifications as stacked MUI snackbars.
 * Mounted once at the app root.
 */
export function Notifier() {
  const notifications = useNotificationStore((s) => s.notifications);
  const dismiss = useNotificationStore((s) => s.dismiss);

  return (
    <Stack
      spacing={1}
      sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: (t) => t.zIndex.snackbar }}
    >
      {notifications.map((n, index) => (
        <Snackbar
          key={n.id}
          open
          autoHideDuration={n.severity === 'error' ? 8000 : 4000}
          onClose={() => dismiss(n.id)}
          sx={{ position: 'static', transform: 'none', mt: index === 0 ? 0 : 1 }}
        >
          <Alert
            variant="filled"
            severity={n.severity}
            onClose={() => dismiss(n.id)}
            sx={{ width: '100%', minWidth: 280 }}
          >
            {n.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
}
