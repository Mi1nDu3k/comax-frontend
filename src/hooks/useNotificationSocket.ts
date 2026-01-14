import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation'; // 1. Import useRouter
import { useAuth } from '@/context/auth.context';
import { Notification } from '@/types/notification';

const HUB_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '') + '/hubs/notification';

export const useNotificationSocket = () => {
    const { user } = useAuth();
    const [newNotification, setNewNotification] = useState<Notification | null>(null);
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const router = useRouter(); // 2. Khởi tạo router

    useEffect(() => {
        if (!user) return;

        // --- FIX LẠI CẤU HÌNH SIGNALR CHO CHUẨN ---
        if (!connectionRef.current) {
            // Lấy token từ key chuẩn (kiểm tra cả 'accessToken' và 'token')
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            
            connectionRef.current = new signalR.HubConnectionBuilder()
                .withUrl(HUB_URL, {
                    accessTokenFactory: () => token || '',
                    // BỎ skipNegotiation: true để tránh lỗi Auth 401 trên một số môi trường
                    // skipNegotiation: true, 
                    // transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Warning)
                .build();
        }

        const connection = connectionRef.current;

        const startConnection = async () => {
            if (connection.state === signalR.HubConnectionState.Disconnected) {
                try {
                    await connection.start();
                    console.log('📡 SignalR Connected');
                    
                    connection.on('ReceiveNotification', (noti: Notification) => {
                        console.log('🔔 New Notification:', noti);
                        setNewNotification(noti);
                        
                        // 3. FIX LỖI CHUYỂN HƯỚNG TẠI ĐÂY
                        toast.info(noti.message, {
                            position: "bottom-right",
                            autoClose: 5000,
                            // Thay window.location.href bằng router.push
                            onClick: () => {
                                if (noti.url) router.push(noti.url);
                            }
                        });
                    });

                } catch (err) {
                    console.error('SignalR Start Error:', err);
                }
            }
        };

        startConnection();

        return () => {
            connection.off('ReceiveNotification');
            if (connection.state === signalR.HubConnectionState.Connected) {
                connection.stop();
            }
            connectionRef.current = null; // Reset ref để đảm bảo clean sạch sẽ
        };
    }, [user, router]); // Thêm router vào dependency

    return { newNotification };
};