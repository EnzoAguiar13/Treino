'use client';

import { PanelPage } from '@/components/panels/PanelPage';
import { brl, num } from '@/lib/format';
import { dateTime } from '@/lib/format';

export default function CreatorsPage() {
  return (
    <PanelPage
      title="Creators"
      panel="creator"
      summaryCards={[
        { key: 'followers', label: 'Seguidores', format: num },
        { key: 'views', label: 'Visualizações', format: num },
        { key: 'clicks', label: 'Cliques', format: num },
        { key: 'registrations', label: 'Registros', format: num },
        { key: 'ftd', label: 'FTD', format: num },
        { key: 'deposits', label: 'Depósitos', format: brl },
        { key: 'volume', label: 'Volume', format: brl },
        { key: 'netPl', label: 'Net P&L', format: brl },
        { key: 'commission', label: 'Comissão', format: brl },
        { key: 'stories', label: 'Stories', format: num },
        { key: 'reels', label: 'Reels', format: num },
        { key: 'posts', label: 'Posts', format: num },
      ]}
      columns={[
        { key: 'affiliate', header: 'Creator', render: (r) => r.affiliate?.name ?? '—' },
        { key: 'date', header: 'Data', render: (r) => dateTime(r.date) },
        { key: 'followers', header: 'Seguidores', render: (r) => num(r.followers as number) },
        { key: 'stories', header: 'Stories', render: (r) => num(r.stories as number) },
        { key: 'reels', header: 'Reels', render: (r) => num(r.reels as number) },
        { key: 'posts', header: 'Posts', render: (r) => num(r.posts as number) },
        { key: 'views', header: 'Views', render: (r) => num(r.views as number) },
        { key: 'clicks', header: 'Cliques', render: (r) => num(r.clicks as number) },
        { key: 'ftd', header: 'FTD', render: (r) => num(r.ftd as number) },
        { key: 'netPl', header: 'Net P&L', render: (r) => brl(r.netPl as number) },
        { key: 'commission', header: 'Comissão', render: (r) => brl(r.commission as number) },
      ]}
    />
  );
}
