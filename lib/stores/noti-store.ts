import { create } from 'zustand';
import { NotificationModel } from '@/lib/models/notification';
export interface NotificationStore {
  notifications: NotificationModel[];
  setNotifications: (notifications: NotificationModel[]) => void;
  addNotification: (notification: NotificationModel) => void;
  removeNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  selectedNotification: NotificationModel | null;
  setSelectedNotification: (notification: NotificationModel | null) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

export const useNotiStore = create<NotificationStore>((set) => ({
  notifications: [
    {
      id: 1,
      message: 'You have a new notification!',
      details: 'Details for notification #1.',
      time: '1 minute ago',
      isRead: false,
      type: 'info',
      target: '/timer', // Optional target for navigation
    },
    {
      id: 2,
      message: 'Someone liked your post.',
      details: 'Details for notification #2.',
      time: '5 minutes ago',
      isRead: false,
      type: 'success',
      target: '/admin', // Optional target for navigation
    },
  ],
  setNotifications: (notifications: NotificationModel[]) =>
    set(() => ({
      notifications,
    })),
  addNotification: (notification: NotificationModel) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  removeNotification: (id: number) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  markAsRead: (id: number) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
  clearNotifications: () =>
    set(() => ({
      notifications: [],
    })),
  selectedNotification: null,
  setSelectedNotification: (notification: NotificationModel | null) =>
    set(() => ({
      selectedNotification: notification,
    })),
  isDialogOpen: false,
  setIsDialogOpen: (isOpen: boolean) =>
    set({ isDialogOpen: isOpen }),
  isModalOpen: false,
  setIsModalOpen: (isOpen: boolean) => 
    set({ isModalOpen: isOpen }),
}));
