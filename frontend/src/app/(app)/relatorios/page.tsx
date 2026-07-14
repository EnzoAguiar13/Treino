'use client';

import { useState } from 'react';
import { IconReport } from '@/components/Icons';
import { downloadReport } from '@/lib/api';

const FORMATS = [
  { key: 'excel', label: 'Excel (.xlsx)', desc: 'Planilha completa com formatação' },
  { key: 'csv', label: 'CSV', desc: 'Dados brutos para importação' },
  { key: 'pdf', label: 'PDF', desc: 'Relatório pronto para impressão' },
] as const;

export default function ReportsPage() {
  const [busy, setBusy] = useState<string | null>(null);

  async function exportReport(format: 'excel' | 'csv' | 'pdf') {
    setBusy(format);
    try {
      await downloadReport(format);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Relatórios</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Exporte a base completa de afiliados com todos os indicadores financeiros.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {FORMATS.map((f) => (
          <button
            key={f.key}
            onClick={() => exportReport(f.key)}
            disabled={busy !== null}
            className="card group flex flex-col items-start gap-3 p-6 text-left transition hover:border-brand/50"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-brand">
              <IconReport />
            </span>
            <span className="font-semibold">{f.label}</span>
            <span className="text-xs text-neutral-500">{f.desc}</span>
            <span className="mt-2 text-xs font-medium text-brand">
              {busy === f.key ? 'Gerando…' : 'Exportar →'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
