import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getNotifications, markNotificationAsRead, deleteNotification } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const response = await getNotifications(user.id);
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await markNotificationAsRead(notificationId);
      if (response.success) {
        fetchNotifications();
      }
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await deleteNotification(notificationId);
      if (response.success) {
        fetchNotifications();
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => {
          console.log("Opening notification panel");
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }} 
        className="p-2 relative hover:bg-gray-100 rounded-full transition-colors"
        disabled={isLoading}
      >
        <Bell className="h-6 w-6" />
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            {notifications.filter(n => !n.read).length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Recent Notifications</h3>
            <button 
              onClick={() => {
                console.log("Manual refresh requested");
                fetchNotifications();
              }}
              className="text-sm text-blue-500 hover:text-blue-700"
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>
          {isLoading ? (
            <p className="text-gray-500 text-center py-2">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-2">No notifications</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {notifications.map(notification => (
                <li key={notification.id} className="border-b py-2 last:border-b-0">
                  <div className="flex flex-col">
                    <p className={`${notification.read ? "text-gray-500" : "font-semibold"} text-sm`}>
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.created_at)}
                    </span>
                    <div className="flex justify-end mt-1 space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-500 hover:text-blue-700 text-xs"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 