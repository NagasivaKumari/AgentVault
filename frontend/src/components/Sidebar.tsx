'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  LayoutDashboard, Activity, Brain, Wallet, 
  PlayCircle, BarChart3, ArrowLeftRight, 
  History, Settings
} from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Agent Control Center', icon: LayoutDashboard },
  { href: '/signals', label: 'Intelligence Feed', icon: Activity },
  { href: '/decision-engine', label: 'AI Decision Engine', icon: Brain },
  { href: '/portfolio', label: 'Portfolio Vault', icon: Wallet },
  { href: '/actions', label: 'Autonomous Actions', icon: PlayCircle },
  { href: '/rwa', label: 'RWA Intelligence', icon: BarChart3 },
  { href: '/transactions', label: 'Transaction Explorer', icon: ArrowLeftRight },
  { href: '/memory', label: 'Agent Memory', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r border-border bg-background/80 backdrop-blur-xl">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:scale-110 transition-transform bg-black">
            <Image src="/logo.png" alt="AgentVault Logo" width={32} height={32} className="object-cover" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground/90 block leading-tight">AgentVault</span>
            <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-medium">AI Portfolio Agent</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(n => {
          const Icon = n.icon;
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href} className={cn(
              'relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
              active 
                ? 'text-foreground bg-primary/10 shadow-[inset_0_0_10px_rgba(124,58,237,0.05)]' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}>
              {active && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary shadow-[0_0_10px_#7C3AED]" 
                />
              )}
              <Icon className={cn(
                "w-4.5 h-4.5 shrink-0 transition-colors",
                active ? "text-primary" : "group-hover:text-foreground"
              )} />
              <span className="truncate">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-5 border-t border-border/50 bg-black/20">
        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          AgentVault AI v1.0
        </div>
        <div className="text-[9px] text-muted-foreground/30 mt-1 font-mono">Mantle Sepolia</div>
      </div>
    </aside>
  );
}
