// src/hooks/useSignalR.ts
import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { useAuth } from '@/context/auth.context';

export const useSignalR = (hubPath: string = "/hubs/notification") => {
    const { user } = useAuth();
    const [connection, setConnection] = useState<HubConnection | null>(null);

    useEffect(() => {
        if (!user) {
            setConnection(null);
            return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
        const hubUrl = `${baseUrl}${hubPath}`; // Ghép đường dẫn động

        const newConnection = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => localStorage.getItem('accessToken') || '',
                // 👇 THÊM CẤU HÌNH MẠNH MẼ NÀY ĐỂ TRÁNH LỖI LOCALHOST
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        newConnection.start()
            .then(() => {
                console.log(`SignalR Connected to ${hubPath}!`);
                setConnection(newConnection);
            })
            .catch(err => console.error(` SignalR Error (${hubPath}): `, err));

        return () => {
            newConnection.stop();
            setConnection(null);
        };
    }, [user, hubPath]); // Chạy lại khi user hoặc đường dẫn thay đổi

    return connection;
};