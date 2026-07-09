'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/lib/auth-store';

/** Eventos do WebSocket → invalidação automática das queries (tempo real). */
function RealtimeBridge({ client }: { client: QueryClient }) {
  const authenticated = useAuth((s) => !!s.accessToken);
  useEffect(() => {
    if (!authenticated) return;
    const socket = getSocket();
    const invalidate = () => client.invalidateQueries();
    const events = [
      'affiliate.created',
      'affiliate.updated',
      'affiliate.deleted',
      'dashboard.updated',
      'creator.updated',
      'casino.updated',
      'sportsbook.updated',
      'traffic.updated',
      'finance.updated',
      'notification.created',
      'settings.updated',
    ];
    events.forEach((e) => socket.on(e, invalidate));
    return () => {
      events.forEach((e) => socket.off(e, invalidate));
    };
  }, [authenticated, client]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10_000, refetchOnWindowFocus: true, retry: 1 },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <RealtimeBridge client={client} />
      {children}
    </QueryClientProvider>
  );
}
