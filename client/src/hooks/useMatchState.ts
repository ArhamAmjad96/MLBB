import { useState, useEffect, useRef } from 'react';
import { MatchLiveState, WsMessage } from '../../../shared/types';
import { api } from '../services/api';

export function useMatchState() {
  const [state, setState] = useState<MatchLiveState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUndoneEventId, setLastUndoneEventId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initial fetch via HTTP
    api.getState()
      .then(s => setState(s))
      .catch(err => console.error('Failed to load initial state:', err));

    // Connect WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:3001`;

    let reconnectTimeout: any = null;

    function connectWs() {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          ws.send(JSON.stringify({ type: 'REQUEST_SYNC' }));
        };

        ws.onmessage = (event) => {
          try {
            const data: WsMessage = JSON.parse(event.data);
            if (data.type === 'STATE_UPDATE' && data.payload) {
              setState(data.payload);
            } else if (data.type === 'EVENT_UNDONE' && data.payload) {
              setLastUndoneEventId(data.payload.eventId);
              // Also update local state's event list if present
              setState(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  events: prev.events.filter(e => e.id !== data.payload.eventId)
                };
              });
            } else if (data.type === 'CLOCK_TICK' && data.payload) {
              setState(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  clockSeconds: data.payload.clockSeconds !== undefined ? data.payload.clockSeconds : prev.clockSeconds,
                  draft: {
                    ...prev.draft,
                    timerRemaining: data.payload.draftTimer !== undefined ? data.payload.draftTimer : prev.draft.timerRemaining
                  }
                };
              });
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 2000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch (e) {
        console.error('WS Connection error:', e);
        reconnectTimeout = setTimeout(connectWs, 2000);
      }
    }

    connectWs();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return { state, isConnected, setState, lastUndoneEventId };
}
