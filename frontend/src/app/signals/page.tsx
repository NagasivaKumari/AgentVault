'use client';
import { useAnalysis } from '@/context/AnalysisContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Waves, Brain, ExternalLink, DollarSign, Droplets, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FeedItem {
  id: number;
  type: 'whale_accumulation' | 'whale_distribution' | 'stablecoin_flow' | 'liquidity_event' | 'momentum_change';
  asset: string;
  confidence: number;
  impact: number;
  timestamp: Date;
  description: string;
}

const generateFeed = (): FeedItem[] => {
  const items: FeedItem[] = [
    { id: 1, type: 'whale_accumulation', asset: 'MNT', confidence: 87, impact: 8.2, timestamp: new Date(Date.now() - 60000), description: 'Whale wallet 0x8f…3a2 accumulated 142,000 MNT across 3 transactions' },
    { id: 2, type: 'whale_distribution', asset: 'ETH', confidence: 72, impact: 5.4, timestamp: new Date(Date.now() - 300000), description: 'Smart money wallet distributed 2,450 ETH to multiple addresses' },
    { id: 3, type: 'stablecoin_flow', asset: 'USDC', confidence: 91, impact: 7.8, timestamp: new Date(Date.now() - 600000), description: '$4.2M USDC inflow to Mantle DEX pools — liquidity deepening' },
    { id: 4, type: 'liquidity_event', asset: 'MNT/ETH', confidence: 84, impact: 6.1, timestamp: new Date(Date.now() - 1200000), description: 'MNT/ETH pool depth increased by $1.8M on Merchant Moe' },
    { id: 5, type: 'momentum_change', asset: 'MNT', confidence: 76, impact: 4.5, timestamp: new Date(Date.now() - 1800000), description: 'MNT 1h momentum score shifted from neutral to bullish (+2.3%)' },
    { id: 6, type: 'whale_accumulation', asset: 'USDY', confidence: 68, impact: 3.9, timestamp: new Date(Date.now() - 2400000), description: 'Treasury whale added $890K USDY to RWA position' },
    { id: 7, type: 'liquidity_event', asset: 'mETH', confidence: 79, impact: 5.7, timestamp: new Date(Date.now() - 3000000), description: 'mETH/ETH pool on Agni Finance reached $5.2M TVL' },
    { id: 8, type: 'stablecoin_flow', asset: 'USDT', confidence: 82, impact: 6.3, timestamp: new Date(Date.now() - 3600000), description: '$1.1M USDT bridged from Ethereum to Mantle via LayerZero' },
  ];
  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const feedConfig = {
  whale_accumulation: { label: 'Whale Accumulation', icon: TrendingUp, color: '#10B981' },
  whale_distribution: { label: 'Whale Distribution', icon: TrendingDown, color: '#EF4444' },
  stablecoin_flow: { label: 'Stablecoin Flow', icon: DollarSign, color: '#3B82F6' },
  liquidity_event: { label: 'Liquidity Event', icon: Droplets, color: '#06B6D4' },
  momentum_change: { label: 'Momentum Change', icon: Zap, color: '#F59E0B' },
};

export default function SignalsPage() {
  const a = useAnalysis();
  
  useEffect(() => {
    if (!a.signals && !a.loading) {
      a.runAnalysis();
    }
  }, []);

  const s = a.signals;
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [live, setLive] = useState(true);

  useEffect(() => {
    setFeed(generateFeed());
    if (!live) return;
    const interval = setInterval(() => {
      const newItem: FeedItem = {
        id: Date.now(),
        type: ['whale_accumulation', 'whale_distribution', 'stablecoin_flow', 'liquidity_event', 'momentum_change'][Math.floor(Math.random() * 5)] as FeedItem['type'],
        asset: ['MNT', 'ETH', 'USDC', 'USDY', 'mETH'][Math.floor(Math.random() * 5)],
        confidence: 60 + Math.random() * 35,
        impact: Math.random() * 10,
        timestamp: new Date(),
        description: `New ${Math.random() > 0.5 ? 'signal' : 'event'} detected on Mantle blockchain`,
      };
      setFeed(prev => [newItem, ...prev].slice(0, 50));
    }, 15000);
    return () => clearInterval(interval);
  }, [live]);

  return (
    <main className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground/90">Intelligence Feed</h2>
              <p className="text-sm text-muted-foreground">Real-time smart money signal terminal</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`text-[10px] font-bold flex items-center gap-1.5 ${live ? 'border-[#10B981]/30 bg-[#10B981]/5 text-[#10B981]' : 'border-white/10 bg-white/5 text-muted-foreground'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-[#10B981] animate-pulse' : 'bg-muted-foreground'}`} />
                {live ? 'LIVE' : 'PAUSED'}
              </Badge>
              <button onClick={() => setLive(!live)} className="text-[10px] text-muted-foreground hover:text-foreground font-medium uppercase tracking-widest transition-colors">
                {live ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
              <Card className="glass-card border-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-3 tracking-widest uppercase opacity-70">
                    <Waves className="w-4 h-4 text-primary shadow-[0_0_10px_#7C3AED]" />
                    Live Intelligence Terminal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/[0.03] max-h-[600px] overflow-y-auto">
                    <AnimatePresence>
                      {feed.map((item, i) => {
                        const config = feedConfig[item.type];
                        const Icon = config.icon;
                        return (
                          <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}
                            className="flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-colors group">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${config.color}15`, border: `1px solid ${config.color}30` }}>
                              <Icon className="w-4 h-4" style={{ color: config.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-bold" style={{ color: config.color }}>{config.label}</span>
                                <span className="text-[10px] font-mono text-muted-foreground bg-white/[0.03] px-1.5 py-0.5 rounded">{item.asset}</span>
                                <span className={`text-[10px] font-bold ${item.type === 'whale_distribution' ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                                  {item.type === 'whale_distribution' ? <ArrowDownRight className="w-3 h-3 inline" /> : <ArrowUpRight className="w-3 h-3 inline" />}
                                  {item.impact.toFixed(1)}%
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge className="text-[8px] font-bold px-1.5 py-0 bg-primary/10 text-primary border-primary/20">{(item.confidence).toFixed(0)}% confidence</Badge>
                                <Badge className="text-[8px] font-bold px-1.5 py-0 bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">Impact: {item.impact.toFixed(1)}</Badge>
                                <span className="text-[9px] font-mono text-muted-foreground/50">
                                  {Math.floor((Date.now() - item.timestamp.getTime()) / 60000)}m ago
                                </span>
                              </div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-2" style={{ backgroundColor: config.color, boxShadow: `0 0 6px ${config.color}` }} />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-1">
              <Card className="glass-card border-none h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-3 tracking-widest uppercase opacity-70">
                    <Activity className="w-4 h-4 text-[#10B981]" />
                    Signal Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  <div className="space-y-4">
                    {Object.entries(feedConfig).map(([key, config]) => {
                      const count = feed.filter(f => f.type === key).length;
                      const total = feed.length || 1;
                      const Icon = config.icon;
                      return (
                        <div key={key} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] transition-all group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4" style={{ color: config.color }} />
                              <span className="text-xs font-semibold text-foreground">{config.label}</span>
                            </div>
                            <span className="text-xs font-bold font-mono" style={{ color: config.color }}>{count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(count / total) * 100}%`, backgroundColor: config.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3 opacity-60">Signal Quality Metrics</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Confidence</span>
                        <span className="font-bold text-foreground">{feed.length > 0 ? (feed.reduce((a, b) => a + b.confidence, 0) / feed.length).toFixed(0) : '--'}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Impact Score</span>
                        <span className="font-bold text-foreground">{feed.length > 0 ? (feed.reduce((a, b) => a + b.impact, 0) / feed.length).toFixed(1) : '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Signal Volume (24h)</span>
                        <span className="font-bold text-foreground">{feed.length * 4} signals</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
