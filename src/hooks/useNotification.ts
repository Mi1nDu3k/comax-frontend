import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

// 1. Định nghĩa Interface cho Notification
export interface NotificationItem {
  id: number;
  message: string;
  url: string;
  isRead: boolean;
  type: number;
  createdAt: string;
}

export const useNotification = () => {
  // 2. Áp dụng interface vào useState
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Tạo connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5233/hubs/notification", {
        accessTokenFactory: () => localStorage.getItem('token') || ""
      })
      .withAutomaticReconnect()
      .build();

    // Bắt đầu kết nối
    connection.start()
      .then(() => {
        console.log("Đã kết nối tới SignalR Hub!");

        // Đăng ký sự kiện lắng nghe
        // Lưu ý: Dùng callback dạng func để đảm bảo lấy được state mới nhất nếu cần, 
        // nhưng ở đây ta dùng setNotifications với callback prev => ... là an toàn nhất.
        connection.on("ReceiveNotification", (notification: NotificationItem) => {
          console.log("Thông báo mới:", notification);
          setNotifications(prev => [notification, ...prev]);
          alert(`Bạn có thông báo mới: ${notification.message}`);
        });
      })
      .catch(err => console.error("Lỗi kết nối SignalR:", err));

    // Hàm Cleanup: Chạy khi component unmount
    return () => {
      connection.stop();
    };
  }, []); // Chỉ chạy 1 lần khi mount

  return { notifications };
};