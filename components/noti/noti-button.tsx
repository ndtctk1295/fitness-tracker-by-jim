'use client';

import { useNotiStore } from '@/lib/stores/noti-store';
import { NotificationModel } from '@/lib/models/notification';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, Dot } from 'lucide-react';
import NotificationDialog from './notification-dialog';
import { cn } from '@/lib/utils';

export default function NotificationButton() {
  const {
    notifications,
    selectedNotification,
    isDialogOpen,
    setIsDialogOpen,
    setSelectedNotification,
    markAsRead,
    markAllAsRead,
  } = useNotiStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notification: NotificationModel) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getNotificationTypeColor = (type?: string) => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='ghost' className='relative'>
            <Bell className='w-5 h-5' />
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs'>
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80 p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-lg font-bold'>Notifications</h4>
            {unreadCount > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleMarkAllAsRead}
                className='text-xs text-muted-foreground hover:text-foreground'
              >
                Mark all as read
              </Button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className='text-sm text-gray-500 text-center py-4'>
              No notifications yet.
            </p>
          ) : (
            <div className='space-y-2 max-h-96 overflow-y-auto'>
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors border',
                    !notification.isRead
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                  )}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium text-sm line-clamp-1'>
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <Dot className={cn('w-4 h-4', getNotificationTypeColor(notification.type))} />
                        )}
                      </div>
                      <p className='text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2'>
                        {notification.details}
                      </p>
                      <span className='text-xs text-gray-400 dark:text-gray-500 mt-2 block'>
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Notification Dialog */}
      <NotificationDialog />
    </>
  );
}
