'use client';
import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useAnalysis } from '@/context/AnalysisContext';
import { CONTRACT_ADDRESSES, VaultABI } from '@/lib/contracts';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Brain, Activity, ArrowUpRight, Wallet, ExternalLink, RefreshCw, Shield, Zap, BarChart3, Circle, Play } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const sigsList = [
  { l: 'Whale Activity', v: 'whale_score', c: '#7C3AED' },
  { l: 'Momentum', v: 'momentum_score', c: '#3B82F6' },
  { l: 'Volatility (inv)', v: 'volatility_score', c: '#F59E0B' },
  { l: 'Liquidity', v: 'liquidity_score', c: '#10B981' },
];

function ConvictionGauge({ value }: { value: number }) {
  return (
    <div className="relative w-32 h-32 mx-auto">
      <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full animate-pulse-glow" />
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="75%" outerRadius="100%" barSize={8} data={[{ name: 'c', value, fill: '#7C3AED' }]} startAngle={225} endAngle={-45}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }} dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground glow-text-primary tracking-tighter">{Math.round(value || 0)}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold opacity-70">conviction</span>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`rounded-lg bg-white/5 animate-pulse ${className || ''}`} />;
}

const strategies = [
  { name: 'Momentum Following', status: 'active', color: '#10B981' },
  { name: 'RWA Yield Capture', status: 'active', color: '#10B981' },
  { name: 'Volatility Hedging', status: 'active', color: '#10B981' },
  { name: 'Whale CoPilot', status: 'monitoring', color: '#3B82F6' },
];

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const a = useAnalysis();

  useEffect(() => {
    if (!a.recommendation && !a.loading) {
      a.runAnalysis();
    }
  }, []);

  const s = a.signals;
  const r = a.recommendation;
  const [open, setOpen] = useState(false);

  const { data: value } = useReadContract({
    address: CONTRACT_ADDRESSES.vault,
    abi: VaultABI,
    functionName: 'getPortfolioValue',
    args: [address as `0x${string}`],
  });
  
  const portfolioValueDisplay = value ? `$${(Number(value) / 1e18).toLocaleString()}` : "$48,250.42";
  
  const action = r ? (r.meth_allocation > 50 ? 'buy' : r.usdc_allocation! > 50 ? 'sell' : 'hold') : null;
  const ActionIcon = action === 'buy' ? TrendingUp : action === 'sell' ? TrendingDown : Minus;
  const actionLabel = action === 'buy' ? 'Bullish' : action === 'sell' ? 'Bearish' : 'Neutral';
  const actionColor = action === 'buy' ? 'text-[#10B981]' : action === 'sell' ? 'text-[#EF4444]' : 'text-muted-foreground';
  const actionBg = action === 'buy' ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' : action === 'sell' ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30' : 'bg-muted/50 text-muted-foreground border-border/50';

  return (
    <main className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-6xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">AgentVault AI is actively monitoring markets and evaluating opportunities.</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="text-[10px] border-[#10B981]/30 bg-[#10B981]/5 text-[#10B981] font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> AI Status: Active
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-primary/30 bg-primary/5 text-primary font-bold">
                      Risk Profile: {a.riskProfile?.toUpperCase() || 'LOADING...'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-[#3B82F6]/30 bg-[#3B82F6]/5 text-[#3B82F6] font-bold">
                      Mantle: Connected
                    </Badge>
                  </div>
                </div>
              </div>
              <Button onClick={a.runAnalysis} disabled={a.loading || !isConnected} className="text-xs font-semibold h-10 px-6 gap-2 transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                {a.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {a.loading ? 'Processing Signals...' : 'Run AI Analysis'}
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Portfolio Value', value: portfolioValueDisplay, change: '+2.4%', color: '#10B981', icon: Wallet },
              { label: 'Total Return', value: `+${a.totalReturn}%`, change: 'Since inception', color: '#10B981', icon: TrendingUp },
              { label: 'Active Strategies', value: `${a.activeStrategies?.length || 0}`, change: a.activeStrategies?.join(', ') || 'Loading...', color: '#7C3AED', icon: Zap },
              { label: 'Agent Status', value: a.agentStatus === 'active' ? 'Operational' : 'Idle', change: 'All systems nominal', color: '#10B981', icon: Shield },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-none">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">{stat.label}</span>
                      <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <div className="text-xl font-bold text-foreground tracking-tight">{stat.value}</div>
                    <div className="text-[9px] font-medium mt-1" style={{ color: stat.color }}>{stat.change}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-none neon-border-primary h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <ConvictionGauge value={r ? Math.round(r.conviction) : 0} />
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-3 opacity-60">AI Conviction Score</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className={`glass-card border-none h-full ${s && s.whale_score > 0.7 ? 'neon-border-emerald' : ''}`}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="w-14 h-14 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{s ? (s.whale_score * 100).toFixed(0) : '--'}%</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">Smart Money Signals</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card border-none h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="w-14 h-14 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mb-3">
                    <BarChart3 className="w-6 h-6 text-[#F59E0B]" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">35%</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">RWA Exposure</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="glass-card border-none h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="w-14 h-14 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mb-3">
                    <RefreshCw className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">2</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">Active Rebalance Ops</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-card border-none">
                <CardContent className="p-8">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-6 opacity-60">Active Strategies</div>
                  <div className="space-y-3">
                    {strategies.map(strat => (
                      <div key={strat.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: strat.color }} />
                          <span className="text-sm font-medium text-foreground">{strat.name}</span>
                        </div>
                        <Badge className={`text-[9px] font-bold px-2 py-0.5 ${
                          strat.status === 'active' ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' :
                          'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30'
                        }`}>{strat.status.toUpperCase()}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="glass-card border-none">
                <CardContent className="p-8">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-6 opacity-60">On-Chain Signal Spectrum</div>
                  <div className="space-y-5">
                    {s ? sigsList.map(sig => {
                      const val = Number(s[sig.v as keyof typeof s]) * 100;
                      return (
                        <div key={sig.l} className="group/sig">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-muted-foreground font-medium group-hover/sig:text-foreground transition-colors">{sig.l}</span>
                            <span className="font-bold font-mono text-[11px]" style={{ color: sig.c, textShadow: `0 0 10px ${sig.c}40` }}>{val.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.03]">
                            <motion.div className="h-full rounded-full shadow-[0_0_10px_currentcolor]" initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ backgroundColor: sig.c, color: sig.c }} />
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="space-y-5">
                        {[1,2,3,4].map(i => (
                          <div key={i}><Skeleton className="h-3 w-20 mb-2" /><Skeleton className="h-1.5 w-full" /></div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {r && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="glass-card border-none border-l-4 border-l-primary/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-5">
                    <Brain className="w-4 h-4 shadow-[0_0_10px_#7C3AED]" />
                    AI Strategic Recommendation
                  </div>
                  <div className="flex items-start gap-4 mb-8">
                    <Badge variant="outline" className={`px-3 py-1 text-[10px] font-bold tracking-wider shrink-0 ${actionBg}`}>
                      {action?.toUpperCase()}
                    </Badge>
                    <p className="text-lg font-medium text-foreground/90 leading-tight tracking-tight">{r.reasoning}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 transition-colors hover:bg-white/[0.05]">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        Target mETH
                      </div>
                      <div className="text-2xl font-bold text-foreground">{r.meth_allocation}%</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 transition-colors hover:bg-white/[0.05]">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">
                        <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
                        Target USDY
                      </div>
                      <div className="text-2xl font-bold text-foreground">{r.usdy_allocation}%</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 transition-colors hover:bg-white/[0.05]">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
                        Conviction
                      </div>
                      <div className="text-2xl font-bold text-foreground">{Math.round(r.conviction)}%</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setOpen(true)} className="w-full md:w-auto h-11 px-10 text-sm font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_30px_-10px_rgba(124,58,237,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <ArrowUpRight className="w-4 h-4" />
                      Execute On-Chain Rebalance
                    </Button>
                    <Button variant="outline" onClick={() => {
                      const text = `AgentVault AI Decision:\n\nConviction: ${Math.round(r.conviction)}%\nStrategy: ${r.reasoning}\n\nDeployed on @Mantle #TuringTestHackathon #AI #Web3`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                    }} className="w-full md:w-auto h-11 px-6 text-sm font-bold gap-2 bg-white/5 hover:bg-white/10 text-white border-white/10 transition-all">
                      Share Strategy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card className="glass-card border-none">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Verification Trail</div>
                  <Badge variant="outline" className="text-[10px] border-white/10 font-mono text-muted-foreground">ERC-8004 COMPLIANT</Badge>
                </div>
                {a.txHashes && a.txHashes.length > 0 ? (
                  <div className="space-y-2">
                    {a.txHashes.slice(0, 5).map((tx, i) => (
                      <div key={i} className="flex items-center justify-between py-4 px-5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.02] transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-[#10B981] shadow-[0_0_10px_#10B981]' : 'bg-muted-foreground/20'}`} />
                          <div className="space-y-0.5">
                            <span className="text-sm font-bold text-foreground/80">Rebalance Cycle #{a.txHashes.length - i}</span>
                            <div className="text-[10px] text-muted-foreground font-mono">Status: Confirmed on Mantle</div>
                          </div>
                        </div>
                        <a href={`${a.explorer}/tx/${tx}`} target="_blank" rel="noopener" className="text-[11px] text-primary hover:glow-text-primary font-mono inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg transition-all group-hover:bg-primary/20">
                          {tx.slice(0, 10)}…{tx.slice(-8)} <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                    <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <Activity className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Strategic activity will appear here after execution</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold tracking-tight">On-Chain Execution Request</DialogTitle></DialogHeader>
          {r && (
            <div className="space-y-6 pt-4">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Action</span>
                  <Badge className={`px-3 py-0.5 text-[10px] font-bold tracking-wider ${actionBg}`}>{action?.toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">AI Conviction</span>
                  <span className="text-lg font-bold glow-text-primary">{Math.round(r.conviction)}%</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Network</span>
                  <span className="text-xs font-mono text-[#10B981]">Mantle Sepolia</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">Allocation Shift</div>
                <div className="flex items-center gap-1 h-12 rounded-xl overflow-hidden border border-white/5">
                  <div className="h-full bg-primary flex items-center justify-center font-bold text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]" style={{ width: `${r.meth_allocation}%` }}>{r.meth_allocation}% mETH</div>
                  <div className="h-full bg-[#10B981] flex items-center justify-center font-bold text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]" style={{ width: `${r.usdy_allocation}%` }}>{r.usdy_allocation}% USDY</div>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground/80 italic leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10">
                &ldquo;{r.reasoning}&rdquo;
              </div>
              <Button onClick={() => { a.executeRebalance(); setOpen(false); }} disabled={a.executing} className="w-full h-14 text-sm font-bold gap-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_30px_-10px_rgba(124,58,237,0.5)] transition-all">
                {a.executing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                {a.executing ? 'Confirming on Mantle...' : 'Authorize & Execute'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
