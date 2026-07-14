'use client';

import { PanelPage } from '@/components/panels/PanelPage';
import { brl, dateTime, num, pct } from '@/lib/format';

export default function CasinoPage() {
  return (
    <PanelPage
      title="Cassino"
      panel="casino"
      summaryCards={[
        { key: 'ftd', label: 'FTD', format: num },
        { key: 'volume', label: 'Volume Cassino', format: brl },
        { key: 'netPl', label: 'Net P&L', format: brl },
        { key: 'profit', label: 'Lucro', format: brl },
        { key: 'roi', label: 'ROI', format: pct },
        { key: 'commission', label: 'Comissão', format: brl },
      ]}
      columns={[
        { key: 'affiliate', header: 'Afiliado', render: (r) => r.affiliate?.name ?? '—' },
        { key: 'date', header: 'Data', render: (r) => dateTime(r.date) },
        { key: 'ftd', header: 'FTD', render: (r) => num(r.ftd as number) },
        { key: 'volume', header: 'Volume', render: (r) => brl(r.volume as number) },
        { key: 'netPl', header: 'Net P&L', render: (r) => brl(r.netPl as number) },
        { key: 'profit', header: 'Lucro', render: (r) => brl(r.profit as number) },
        { key: 'roi', header: 'ROI', render: (r) => pct(r.roi as number) },
        { key: 'commission', header: 'Comissão', render: (r) => brl(r.commission as number) },
      ]}
    />
  );
}
