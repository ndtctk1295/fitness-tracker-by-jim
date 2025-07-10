export interface NotificationModel {
  id: number;
  message: string;
  details: string;
  time: string;
  target?: string; // Optional target for navigation
  isRead?: boolean; // Optional flag to indicate if the notification has been read
  type?: 'info' | 'success' | 'warning' | 'error'; // Optional notification type
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}
