import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { Family } from '@/types';
import { Client, IMessage } from '@stomp/stompjs';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';

const SOCKJS_URL = `${process.env.EXPO_PUBLIC_API_URL}/ws`;
const RECONNECT_DELAY = 5000;

export function useFamilyWebSocket() {
    const { token } = useAuthStore();
    const { user, updateFamily } = useUserStore();
    const router = useRouter();
    const clientRef = useRef<Client | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const familyId = user?.family?.id;
    const userId = user?.id;

    const handleFamilyUpdate = useCallback((message: IMessage) => {
        try {
            const update: Family = JSON.parse(message.body);
            const isStillMember = update.members?.some(m => m.userId === userId);

            if (!isStillMember) {
                updateFamily(null);
                router.push('/(tabs)');
            } else {
                updateFamily(update);
            }
        } catch (e) {
            console.error('fail to update family', e);
        }
    }, [updateFamily, userId, router]);

    const connect = useCallback(() => {
        if (!familyId || !token) return;

        if (clientRef.current?.active) {
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKJS_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: RECONNECT_DELAY,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                console.log('ws connected');
                client.subscribe(`/topic/family/${familyId}`, handleFamilyUpdate, {
                    Authorization: `Bearer ${token}`,
                });
            },
            onDisconnect: () => {
                console.log('ws disconnected');
            },
            onStompError: (frame) => {
                console.error('error:', frame.headers['message']);
            },
            onWebSocketError: (event) => {
                console.error('ws error:', event);
            },
            onWebSocketClose: () => {
                console.log('ws closed, will reconnect...');
            },
        });

        clientRef.current = client;
        client.activate();
    }, [familyId, token, handleFamilyUpdate]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
        }
    }, []);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    useEffect(() => {
        if (!familyId) {
            disconnect();
        }
    }, [familyId, disconnect]);

    return {
        isConnected: clientRef.current?.active ?? false,
        reconnect: connect,
    };
}
