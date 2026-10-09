import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import Card, { CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function NotificationCenter() {
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <Button variant="outline" onClick={markAllAsRead}>Mark all as read</Button>
      </div>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications.</p>
        ) : (
          notifications.map(n => (
            <Card key={n.id} className={n.read ? 'opacity-60' : ''}>
              <CardBody className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{n.message}</p>
                  <p className="text-sm text-gray-500">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.read && <Button size="sm" variant="ghost" onClick={() => markAsRead(n.id)}>Mark Read</Button>}
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
