'use client';

import { useEffect, useRef } from 'react';

const FALLBACK_SYNC_MS = 30000;
const RECONNECT_MS = 3000;

type ScheduleRealtimeOptions = {
  monthKey: string;
  onMonthChanged: () => void;
};

export function useScheduleRealtime({ monthKey, onMonthChanged }: ScheduleRealtimeOptions) {
  const callbackRef = useRef(onMonthChanged);

  useEffect(() => {
    callbackRef.current = onMonthChanged;
  }, [onMonthChanged]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let fallbackTimer: number | null = null;
    let disposed = false;
    let connectedOnce = false;
    const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;

    const refresh = () => callbackRef.current();

    const startFallback = () => {
      if (fallbackTimer === null) {
        fallbackTimer = window.setInterval(refresh, FALLBACK_SYNC_MS);
      }
    };

    const stopFallback = () => {
      if (fallbackTimer !== null) {
        window.clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const connect = () => {
      if (disposed) return;
      if (!realtimeUrl || typeof window.WebSocket === 'undefined') {
        startFallback();
        return;
      }

      startFallback();
      socket = new WebSocket(realtimeUrl);
      socket.onopen = () => {
        stopFallback();
        if (connectedOnce) refresh();
        connectedOnce = true;
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'schedule.changed' && message.month === monthKey) {
            refresh();
          }
        } catch {
          // Ignore malformed realtime messages.
        }
      };
      socket.onerror = () => socket?.close();
      socket.onclose = () => {
        startFallback();
        if (!disposed && reconnectTimer === null) {
          reconnectTimer = window.setTimeout(() => {
            reconnectTimer = null;
            connect();
          }, RECONNECT_MS);
        }
      };
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
        if (!socket || socket.readyState === WebSocket.CLOSED) connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    connect();

    return () => {
      disposed = true;
      stopFallback();
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      socket?.close();
    };
  }, [monthKey]);

  return null;
}
