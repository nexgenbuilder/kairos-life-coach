import React from 'react';
import { Bell, BellRing, Check, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistance } from 'date-fns';

interface NotificationCenterProps {
  onSettingsClick?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onSettingsClick
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearAllNotifications
  } = useNotifications();

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '📋';
      case 'event':
        return '📅';
      case 'workout':
        return '💪';
      case 'expense':
        return '💰';
      default:
        return '🔔';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex gap-1">
          {onSettingsClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
            className="h-8 w-8 p-0"
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unreadNotifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Unread ({unreadNotifications.length})
                  </h4>
                  <div className="space-y-2">
                    {unreadNotifications.map((notification) => (
                      <Card
                        key={notification.id}
                        className="p-3 border-l-4 border-l-primary bg-primary/5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">
                                {getNotificationIcon(notification.type)}
                              </span>
                              <h5 className="text-sm font-medium truncate">
                                {notification.title}
                              </h5>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistance(notification.scheduledFor, new Date(), {
                                addSuffix: true
                              })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {unreadNotifications.length > 0 && readNotifications.length > 0 && (
                <Separator />
              )}

              {readNotifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Read ({readNotifications.length})
                  </h4>
                  <div className="space-y-2">
                    {readNotifications.slice(0, 10).map((notification) => (
                      <Card
                        key={notification.id}
                        className="p-3 opacity-60"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium truncate">
                              {notification.title}
                            </h5>
                            <p className="text-xs text-muted-foreground mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistance(notification.scheduledFor, new Date(), {
                                addSuffix: true
                              })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};