import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuth } from '@/context/auth.context';

export const useSignalR = () => {
    const { user } = useAuth();
    const [connection, setConnection] = useState<HubConnection | null>(null);

    useEffect(() => {
        // Nếu không có user, không làm gì (hoặc reset connection nếu cần)
        if (!user) {
            //  eslint-disable-next-line 
            setConnection(null);
            return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '';
        const hubUrl = `${baseUrl}/hubs/notification`;
        // 1. Khởi tạo instance (chưa set vào state ngay)
        const newConnection = new HubConnectionBuilder()
           .withUrl(hubUrl, {
                accessTokenFactory: () => localStorage.getItem('accessToken') || '',
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        // 2. Bắt đầu kết nối
        newConnection.start()
            .then(() => {
                console.log('SignalR Connected!');
                // 3. Chỉ set state sau khi đã start thành công (Async update -> Fix lỗi ESLint)
                setConnection(newConnection);
            })
            .catch(err => console.error('SignalR Connection Error: ', err));

        // 4. Cleanup function: Chạy khi user thay đổi hoặc component unmount
        return () => {
            newConnection.stop();
            setConnection(null);
        };
    }, [user]); // Chỉ chạy lại khi user thay đổi

    return connection;
};