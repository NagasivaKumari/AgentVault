'use client';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Sliders, RefreshCw, Wallet, ExternalLink, Globe, Lock, Terminal, Activity } from 'lucide-react';

const settingsSections = [
  {
    title: 'Agent Configuration',
    icon: Sliders,
    items: [
      { label: 'Risk Tolerance', value: 'Moderate', type: 'badge', color: '#F59E0B' },
      { label: 'Rebalance Frequency', value: 'Daily', type: 'text' },
      { label: 'Minimum Conviction Threshold', value: '60%', type: 'text' },
      { label: 'Max Slippage', value: '0.5%', type: 'text' },
      { label: 'Auto-Execute', value: 'Disabled', type: 'badge', color: '#EF4444' },
    ],
  },
  {
    title: 'Signal Sources',
    icon: Activity,
    items: [
      { label: 'Whale Tracking', value: 'Enabled', type: 'badge', color: '#10B981' },
      { label: 'Momentum Analysis', value: 'Enabled', type: 'badge', color: '#10B981' },
      { label: 'Volatility Monitor', value: 'Enabled', type: 'badge', color: '#10B981' },
      { label: 'Liquidity Depth', value: 'Enabled', type: 'badge', color: '#10B981' },
      { label: 'RWA Yield Scanner', value: 'Enabled', type: 'badge', color: '#10B981' },
    ],
  },
  {
    title: 'Network & Wallet',
    icon: Globe,
    items: [
      { label: 'Network', value: 'Mantle Sepolia', type: 'badge', color: '#10B981' },
      { label: 'Chain ID', value: '5003', type: 'text' },
      { label: 'RPC Endpoint', value: 'https://rpc.sepolia.mantle.xyz', type: 'text' },
      { label: 'Explorer', value: 'sepolia.mantlescan.xyz', type: 'link' },
    ],
  },
  {
    title: 'Agent Identity (ERC-8004)',
    icon: Terminal,
    items: [
      { label: 'Agent ID', value: '#1', type: 'text' },
      { label: 'Model', value: 'AgentVault v1.0', type: 'text' },
      { label: 'Status', value: 'Active', type: 'badge', color: '#10B981' },
      { label: 'Decisions Recorded', value: '47', type: 'text' },
      { label: 'Created', value: 'June 2026', type: 'text' },
    ],
  },
];

export default function SettingsPage() {
  return (
    <main className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-6xl mx-auto w-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground/90">Settings</h2>
            <p className="text-sm text-muted-foreground">Agent configuration and network preferences</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {settingsSections.map((section, idx) => (
              <motion.div key={section.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="glass-card border-none h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold flex items-center gap-2.5 tracking-widest uppercase opacity-70">
                      <section.icon className="w-3.5 h-3.5 text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <div className="space-y-1">
                      {section.items.map(item => (
                        <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0">
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                          {item.type === 'badge' ? (
                            <Badge className="text-[9px] font-bold px-2 py-0.5" style={{ backgroundColor: `${item.color}15`, color: item.color, borderColor: `${item.color}30` }}>
                              {item.value as string}
                            </Badge>
                          ) : item.type === 'link' ? (
                            <a href={`https://${item.value}`} target="_blank" rel="noopener" className="text-xs text-primary hover:glow-text-primary font-mono inline-flex items-center gap-1">
                              {item.value as string} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs font-mono text-foreground/80">{item.value as string}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card border-none border-l-4 border-l-primary/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-4">
                  <Shield className="w-4 h-4" />
                  Security & Compliance
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Lock className="w-4 h-4 text-[#10B981] mb-2" />
                    <div className="text-xs font-semibold text-foreground">All transactions require wallet signature</div>
                    <div className="text-[10px] text-muted-foreground mt-1">No private keys stored on server</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Shield className="w-4 h-4 text-[#10B981] mb-2" />
                    <div className="text-xs font-semibold text-foreground">ERC-8004 compliant identity</div>
                    <div className="text-[10px] text-muted-foreground mt-1">On-chain agent audit trail</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Globe className="w-4 h-4 text-[#10B981] mb-2" />
                    <div className="text-xs font-semibold text-foreground">All actions verifiable on MantleScan</div>
                    <div className="text-[10px] text-muted-foreground mt-1">Transparent execution history</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
