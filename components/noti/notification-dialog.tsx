'use client';

import { useNotiStore } from '@/lib/stores/noti-store';
import { NotificationModel } from '@/lib/models/notification';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface NotificationDialogProps {
  notification?: NotificationModel | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: (notification: NotificationModel) => void;
  onCancel?: () => void;
  showActions?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const NotificationDialog = ({
  notification: propNotification,
  isOpen: propIsOpen,
  onOpenChange: propOnOpenChange,
  onConfirm,
  onCancel,
  showActions = true,
  confirmText = 'Continue',
  cancelText = 'Cancel',
}: NotificationDialogProps) => {
  const router = useRouter();
  const {
    isDialogOpen,
    selectedNotification,
    setIsDialogOpen,
    setSelectedNotification,
    markAsRead,
  } = useNotiStore();

  // Use props if provided, otherwise fall back to store values
  const notification = propNotification || selectedNotification;
  const isOpen = propIsOpen !== undefined ? propIsOpen : isDialogOpen;
  const onOpenChange = propOnOpenChange || setIsDialogOpen;

  // Handle notification not being available
  if (!notification) {
    return null;
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(notification);
    } else {
      // Default behavior: navigate to target if available
      if (notification.target) {
        router.push(notification.target);
      }
      
      // Mark as read
      markAsRead(notification.id);
    }
    
    // Clear selection and close dialog
    if (!propNotification) {
      setSelectedNotification(null);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Default behavior: clear selection
      if (!propNotification) {
        setSelectedNotification(null);
      }
    }
    
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !propNotification) {
      setSelectedNotification(null);
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {notification.message}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {notification.details}
          </AlertDialogDescription>
          {notification.time && (
            <div className='text-sm text-muted-foreground mt-2'>
              {notification.time}
            </div>
          )}
        </AlertDialogHeader>
        {showActions && (
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotificationDialog;