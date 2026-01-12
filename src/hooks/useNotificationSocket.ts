import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/auth.context';
import { Notification } from '@/types/notification';

const HUB_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '') + '/hubs/notification';

export const useNotificationSocket = () => {
    const { user } = useAuth();
    const [newNotification, setNewNotification] = useState<Notification | null>(null);
    
    // Sử dụng ref để giữ instance connection, tránh tạo lại liên tục
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        if (!user) return;

        // 1. Chỉ tạo connection nếu chưa có
        if (!connectionRef.current) {
            const token = localStorage.getItem('accessToken');
            connectionRef.current = new signalR.HubConnectionBuilder()
                .withUrl(HUB_URL, {
                    accessTokenFactory: () => token || '',
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect()
                .build();
        }

        const connection = connectionRef.current;

        // 2. Hàm Start an toàn
        const startConnection = async () => {
            // Chỉ start nếu đang ngắt kết nối
            if (connection.state === signalR.HubConnectionState.Disconnected) {
                try {
                    await connection.start();
                    console.log('📡 SignalR Connected');
                    
                    // Đăng ký sự kiện
                    connection.on('ReceiveNotification', (noti: Notification) => {
                        console.log('🔔 New Notification:', noti);
                        setNewNotification(noti);
                        toast.info(noti.message, {
                            position: "bottom-right",
                            autoClose: 5000,
                            onClick: () => window.location.href = noti.url
                        });
                    });

                } catch (err) {
                    console.error('SignalR Start Error:', err);
                }
            }
        };

        startConnection();

        // 3. Cleanup Function
        return () => {
            // Quan trọng: Tắt listener trước
            connection.off('ReceiveNotification');
            
            // Chỉ stop nếu đang connected (tránh lỗi stop khi đang connecting)
            if (connection.state === signalR.HubConnectionState.Connected) {
                connection.stop();
            }
            // Nếu đang Connecting, SignalR sẽ tự handle hoặc throw warning nhẹ, có thể bỏ qua
        };
    }, [user]);

    return { newNotification };
};