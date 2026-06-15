'use client';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAnalysis } from '@/context/AnalysisContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, ArrowUpRight, Shield, Zap, Wallet, TrendingUp, Brain } from 'lucide-react';

const executionStepsList = [
  { id: 'Pending', label: 'Transaction Pending', desc: 'Awaiting wallet authorization' },
  { id: 'Signing', label: 'Signing Transaction', desc: 'Confirm in your wallet' },
  { id: 'Submitted', label: 'Submitted to Mantle', desc: 'Transaction broadcast to network' },
  { id: 'Confirmed', label: 'Confirmed on Chain', desc: 'Transaction finalized on Mantle' },
];

export default function ActionsPage() {
  const { address, isConnected } = useAccount();
  const a = useAnalysis();
  const r = a.recommendation;
  const [showComparison, setShowComparison] = useState(false);

  const currentAlloc = { eth: 45, usdc: 30, rwa: 25 };
  const targetAlloc = r ? { 
    eth: r.allocation['eth'] || 0, 
    usdc: r.allocation['usdc'] || 0, 
    rwa: r.allocation['rwa'] || 0 
  } : { eth: 50, usdc: 25, rwa: 25 };

  return (
    <main className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-6xl mx-auto w-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground/90">Autonomous Action Center</h2>
            <p className="text-sm text-muted-foreground">AI-to-blockchain execution interface</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold tracking-widest uppercase opacity-60">Current Allocation</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <div className="h-4 rounded-full bg-white/[0.05] overflow-hidden flex mb-6">
                    <div className="bg-primary h-full transition-all" style={{ width: `${currentAlloc.eth}%` }} />
                    <div className="bg-[#10B981] h-full transition-all" style={{ width: `${currentAlloc.usdc}%` }} />
                    <div className="bg-[#F59E0B] h-full transition-all" style={{ width: `${currentAlloc.rwa}%` }} />
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'ETH / mETH', value: currentAlloc.eth, color: 'bg-primary' },
                      { label: 'USDC / Stable', value: currentAlloc.usdc, color: 'bg-[#10B981]' },
                      { label: 'RWA / Yield', value: currentAlloc.rwa, color: 'bg-[#F59E0B]' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="font-bold text-foreground">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/[0.05]">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Portfolio Value</div>
                    <div className="text-2xl font-bold text-foreground">${a.portfolio?.portfolio_value?.toLocaleString() || '0'}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-none border-l-4 border-l-primary/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold tracking-widest uppercase text-primary">Target Allocation (AI Recommended)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <div className="h-4 rounded-full bg-white/[0.05] overflow-hidden flex mb-6">
                    <div className="bg-primary h-full transition-all" style={{ width: `${targetAlloc.eth}%` }}>
                      {targetAlloc.eth > 15 && <span className="text-[8px] font-bold px-1 leading-4">{targetAlloc.eth}%</span>}
                    </div>
                    <div className="bg-[#10B981] h-full transition-all" style={{ width: `${targetAlloc.usdc}%` }}>
                      {targetAlloc.usdc > 15 && <span className="text-[8px] font-bold px-1 leading-4">{targetAlloc.usdc}%</span>}
                    </div>
                    <div className="bg-[#F59E0B] h-full transition-all" style={{ width: `${targetAlloc.rwa}%` }}>
                      {targetAlloc.rwa > 15 && <span className="text-[8px] font-bold px-1 leading-4">{targetAlloc.rwa}%</span>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'ETH / mETH', value: targetAlloc.eth, color: 'bg-primary' },
                      { label: 'USDC / Stable', value: targetAlloc.usdc, color: 'bg-[#10B981]' },
                      { label: 'RWA / Yield', value: targetAlloc.rwa, color: 'bg-[#F59E0B]' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="font-bold text-foreground">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/[0.05]">
                    <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2">AI Confidence</div>
                    <div className="text-2xl font-bold text-primary glow-text-primary">{r ? Math.round(r.confidence * 100) : 0}%</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card border-none">
              <CardContent className="p-8">
                <Button variant="outline" onClick={() => setShowComparison(!showComparison)} className="text-xs font-semibold mb-6 bg-white/5 hover:bg-white/10 text-foreground border-white/10">
                  {showComparison ? 'Hide' : 'Show'} Before / After Comparison
                </Button>
                <AnimatePresence>
                  {showComparison && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3">Before</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">ETH</span><span className="font-bold text-foreground">{currentAlloc.eth}%</span></div>
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">USDC</span><span className="font-bold text-foreground">{currentAlloc.usdc}%</span></div>
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">RWA</span><span className="font-bold text-foreground">{currentAlloc.rwa}%</span></div>
                          </div>
                        </div>
                        <div className="p-5 rounded-xl bg-primary/5 border border-primary/10">
                          <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-3">After (AI Recommended)</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">ETH</span><span className="font-bold text-primary">{targetAlloc.eth}%</span></div>
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">USDC</span><span className="font-bold text-primary">{targetAlloc.usdc}%</span></div>
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">RWA</span><span className="font-bold text-primary">{targetAlloc.rwa}%</span></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {r ? (
                  <div className="p-6 rounded-xl bg-primary/5 border border-primary/10 mb-6">
                    <div className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-widest mb-3">
                      <Brain className="w-3.5 h-3.5" /> AI Recommendation
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">&ldquo;{r.reasoning}&rdquo;</p>
                    <div className="flex items-center gap-4 mt-4">
                      <Badge className="text-[10px] font-bold px-3 py-1 bg-primary/15 text-primary border-primary/30">Conviction: {Math.round(r.confidence * 100)}%</Badge>
                      <Badge className="text-[10px] font-bold px-3 py-1 bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30">Confidence: {(r.confidence * 100).toFixed(0)}%</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-6 text-center">
                    <p className="text-sm text-muted-foreground">Run an AI analysis to generate a recommendation</p>
                  </div>
                )}

                <Button
                  onClick={a.executeRebalance}
                  disabled={a.executing || !isConnected || !r}
                  className="w-full h-16 text-base font-bold gap-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_30px_-10px_rgba(124,58,237,0.5)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {a.executing ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> {a.executionStep || 'Executing...'}</>
                  ) : (
                    <><Zap className="w-5 h-5" /> Execute Rebalance on Mantle</>
                  )}
                </Button>

                <AnimatePresence>
                  {a.executing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                      {executionStepsList.map(step => (
                        <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                          a.executionStep === step.id ? 'bg-primary/10 border border-primary/20' : 'opacity-40'
                        } transition-all`}>
                          {a.executionStep === step.id ? (
                            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                          ) : executionStepsList.findIndex(s => s.id === a.executionStep) > executionStepsList.findIndex(s => s.id === step.id) ? (
                            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-white/20" />
                          )}
                          <div>
                            <div className="text-xs font-semibold text-foreground">{step.label}</div>
                            <div className="text-[10px] text-muted-foreground">{step.desc}</div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {a.lastTxHash && !a.executing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 rounded-xl bg-[#10B981]/5 border border-[#10B981]/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                      <div>
                        <div className="text-xs font-bold text-[#10B981]">Transaction Confirmed</div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{a.lastTxHash.slice(0, 14)}...{a.lastTxHash.slice(-6)}</div>
                      </div>
                    </div>
                    <a href={`${a.explorer}/tx/${a.lastTxHash}`} target="_blank" rel="noopener" className="text-xs text-primary hover:glow-text-primary font-mono inline-flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-all">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
