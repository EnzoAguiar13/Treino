'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComponentType, SVGProps } from 'react';
import { Logo } from '../Logo';
import {
  IconBall,
  IconClock,
  IconDashboard,
  IconDice,
  IconGear,
  IconPercent,
  IconReport,
  IconStar,
  IconTraffic,
  IconUsers,
  IconWallet,
} from '../Icons';
import { KanbanSquare } from 'lucide-react';

const ITEMS: { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { href: '/', label: 'Dashboard', icon: IconDashboard },
  { href: '/deals', label: 'Deals & Trello', icon: KanbanSquare },
  { href: '/afiliados', label: 'Afiliados', icon: IconUsers },
  { href: '/creators', label: 'Creators', icon: IconStar },
  { href: '/cassino', label: 'Cassino', icon: IconDice },
  { href: '/sportsbook', label: 'Sportsbook', icon: IconBall },
  { href: '/financeiro', label: 'Financeiro', icon: IconWallet },
  { href: '/trafego', label: 'Tráfego', icon: IconTraffic },
  { href: '/comissoes', label: 'Comissões', icon: IconPercent },
  { href: '/relatorios', label: 'Relatórios', icon: IconReport },
  { href: '/historico', label: 'Histórico', icon: IconClock },
  { href: '/configuracoes', label: 'Configurações', icon: IconGear },
  { href: '/usuarios', label: 'Usuários', icon: IconUsers },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-panel/80 backdrop-blur lg:flex">
      <div className="flex h-16 items-center border-b border-line px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? 'bg-brand/15 text-brand'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={active ? 'text-brand' : 'text-brand/70'} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-4 text-[11px] text-neutral-600">
        EsportivaBet · Interno
      </div>
    </aside>
  );
}
