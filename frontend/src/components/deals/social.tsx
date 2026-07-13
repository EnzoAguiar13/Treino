'use client';

import {
  Globe,
  Hash,
  Instagram,
  MessageCircle,
  MessageSquare,
  Music2,
  Send,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import type { SocialNetwork } from '@/lib/deals-types';

// Mapeia cada rede para um ícone lucide + a cor de destaque no hover.
export const SOCIAL_META: Record<SocialNetwork, { Icon: LucideIcon; color: string; href: (v: string) => string }> = {
  INSTAGRAM: {
    Icon: Instagram,
    color: '#E1306C',
    href: (v) => (v.startsWith('http') ? v : `https://instagram.com/${v.replace(/^@/, '')}`),
  },
  TELEGRAM: {
    Icon: Send,
    color: '#29A9EB',
    href: (v) => (v.startsWith('http') ? v : `https://t.me/${v.replace(/^@/, '')}`),
  },
  WHATSAPP: {
    Icon: MessageCircle,
    color: '#25D366',
    href: (v) => (v.startsWith('http') ? v : `https://wa.me/${v.replace(/\D/g, '')}`),
  },
  YOUTUBE: {
    Icon: Youtube,
    color: '#FF0000',
    href: (v) => (v.startsWith('http') ? v : `https://youtube.com/@${v.replace(/^@/, '')}`),
  },
  TIKTOK: {
    Icon: Music2,
    color: '#ffffff',
    href: (v) => (v.startsWith('http') ? v : `https://tiktok.com/@${v.replace(/^@/, '')}`),
  },
  TWITTER: {
    Icon: Twitter,
    color: '#1DA1F2',
    href: (v) => (v.startsWith('http') ? v : `https://x.com/${v.replace(/^@/, '')}`),
  },
  DISCORD: {
    Icon: MessageSquare,
    color: '#5865F2',
    href: (v) => (v.startsWith('http') ? v : `https://discord.gg/${v}`),
  },
  SITE: {
    Icon: Globe,
    color: '#E8540A',
    href: (v) => (v.startsWith('http') ? v : `https://${v}`),
  },
};

export { Hash };
