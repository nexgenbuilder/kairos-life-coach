import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'event' | 'workout' | 'expense' | 'general';
  scheduledFor: Date;
  isRead: boolean;
  createdAt: Date;
  userId: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  browserNotifications: boolean;
  taskReminders: boolean;
  eventReminders: boolean;
  workoutReminders: boolean;
  expenseReminders: boolean;
  reminderMinutes: number; // How many minutes before to notify
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    browserNotifications: true,
    taskReminders: true,
    eventReminders: true,
    workoutReminders: true,
    expenseReminders: true,
    reminderMinutes: 15
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem(`notification_settings_${user.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          scheduledFor: new Date(n.scheduledFor),
          createdAt: new Date(n.createdAt)
        })));
      }
    }
  }, [user]);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    if (!user) return;
    
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(updated));
  }, [settings, user]);

  // Schedule a notification
  const scheduleNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'userId' | 'isRead'>) => {
    if (!user) return;

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      userId: user.id,
      isRead: false
    };

    setNotifications(prev => {
      const updated = [...prev, newNotification];
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
      return updated;
    });

    return newNotification.id;
  }, [user]);

  // Send browser notification
  const sendBrowserNotification = useCallback((title: string, message: string, actionUrl?: string) => {
    if (!settings.browserNotifications || permission !== 'granted') return;

    const notification = new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    });

    if (actionUrl) {
      notification.onclick = () => {
        window.focus();
        window.location.href = actionUrl;
        notification.close();
      };
    }

    setTimeout(() => notification.close(), 5000);
  }, [settings.browserNotifications, permission]);

  // Check for due notifications
  useEffect(() => {
    if (!user) return;

    const checkNotifications = () => {
      const now = new Date();
      
      notifications.forEach(notification => {
        if (!notification.isRead && notification.scheduledFor <= now) {
          // Send browser notification
          sendBrowserNotification(notification.title, notification.message, notification.actionUrl);
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
          });

          // Mark as read
          markAsRead(notification.id);
        }
      });
    };

    const interval = setInterval(checkNotifications, 30000); // Check every 30 seconds
    checkNotifications(); // Check immediately

    return () => clearInterval(interval);
  }, [notifications, user, sendBrowserNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      if (user) {
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [user]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    if (user) {
      localStorage.removeItem(`notifications_${user.id}`);
    }
  }, [user]);

  // Helper functions for specific notification types
  const scheduleTaskReminder = useCallback((taskId: string, title: string, dueDate: Date) => {
    if (!settings.taskReminders) return;
    
    const reminderTime = new Date(dueDate.getTime() - settings.reminderMinutes * 60000);
    
    return scheduleNotification({
      title: 'Task Reminder',
      message: `Task "${title}" is due soon`,
      type: 'task',
      scheduledFor: reminderTime,
      actionUrl: '/tasks',
      metadata: { taskId }
    });
  }, [scheduleNotification, settings]);

  const scheduleEventReminder = useCallback((eventId: string, title: string, startTime: Date) => {
    if (!settings.eventReminders) return;
    
    const reminderTime = new Date(startTime.getTime() - settings.reminderMinutes * 60000);
    
    return scheduleNotification({
      title: 'Event Reminder',
      message: `Event "${title}" starts soon`,
      type: 'event',
      scheduledFor: reminderTime,
      actionUrl: '/calendar',
      metadata: { eventId }
    });
  }, [scheduleNotification, settings]);

  const scheduleWorkoutReminder = useCallback((workoutId: string, name: string, scheduledTime: Date) => {
    if (!settings.workoutReminders) return;
    
    const reminderTime = new Date(scheduledTime.getTime() - settings.reminderMinutes * 60000);
    
    return scheduleNotification({
      title: 'Workout Reminder',
      message: `Time for your "${name}" workout`,
      type: 'workout',
      scheduledFor: reminderTime,
      actionUrl: '/fitness',
      metadata: { workoutId }
    });
  }, [scheduleNotification, settings]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    settings,
    permission,
    unreadCount,
    requestPermission,
    updateSettings,
    scheduleNotification,
    scheduleTaskReminder,
    scheduleEventReminder,
    scheduleWorkoutReminder,
    markAsRead,
    clearAllNotifications,
    sendBrowserNotification
  };
};