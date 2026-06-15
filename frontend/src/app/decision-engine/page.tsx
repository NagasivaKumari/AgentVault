'use client';
import { useEffect } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Brain, Activity, TrendingUp, Waves, AlertTriangle, BarChart3, ArrowRight, Shield, Zap, RefreshCw } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const processingSteps = [
  { label: 'Signal Correlation', desc: 'Cross-referencing whale, momentum, volatility, and liquidity signals', icon: Activity, color: '#7C3AED' },
  { label: 'Pattern Recognition', desc: 'Identifying historical patterns matching current market structure', icon: Brain, color: '#3B82F6' },
  { label: 'Risk Analysis', desc: 'Calculating VaR and drawdown probabilities across all allocations', icon: Shield, color: '#F59E0B' },
  { label: 'Conviction Engine', desc: 'Weighting all inputs into a single conviction score', icon: Zap, color: '#10B981' },
];

const convictionHistory = (() => {
  const arr = [];
  for (let i = 0; i < 30; i++) {
    arr.push({ day: i + 1, conviction: 40 + Math.random() * 50 + Math.sin(i * 0.5) * 15, whale: 0.3 + Math.random() * 0.6, momentum: 0.3 + Math.random() * 0.6 });
  }
  return arr;
})();

export default function DecisionEnginePage() {
  const a = useAnalysis();
  
  useEffect(() => {
    if (!a.recommendation && !a.loading) {
      a.runAnalysis();
    }
  }, []);

  const r = a.recommendation;
  const s = a.signals;

  return (
    <main className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground/90">AI Decision Engine</h2>
              <p className="text-sm text-muted-foreground">Transparent reasoning behind every portfolio action</p>
            </div>
            <Button onClick={a.runAnalysis} disabled={a.loading} className="text-xs font-semibold h-10 px-6 gap-2 bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95">
              {a.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {a.loading ? 'Processing...' : 'Run Full Analysis'}
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
              <Card className="glass-card border-none h-full">
                <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-6 opacity-60">Input Signals</div>
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse-glow" />
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" barSize={10} data={[
                        { name: 'Whale', value: s ? s.whale_score * 100 : 50, fill: '#7C3AED' },
                        { name: 'Momentum', value: s ? s.momentum_score * 100 : 50, fill: '#3B82F6' },
                        { name: 'Volatility', value: s ? (1 - s.volatility_score) * 100 : 50, fill: '#F59E0B' },
                        { name: 'Liquidity', value: s ? s.liquidity_score * 100 : 50, fill: '#10B981' },
                      ]} startAngle={180} endAngle={-180}>
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }} dataKey="value" cornerRadius={6} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-foreground tracking-tighter">{r ? Math.round(r.conviction) : 0}</span>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-semibold opacity-70">conviction</span>
                    </div>
                  </div>
                  <div className="w-full space-y-3">
                    {[
                      { label: 'Whale Activity', value: s ? s.whale_score : 0.5, color: '#7C3AED' },
                      { label: 'Momentum', value: s ? s.momentum_score : 0.5, color: '#3B82F6' },
                      { label: 'Volatility', value: s ? 1 - s.volatility_score : 0.5, color: '#F59E0B' },
                      { label: 'Liquidity', value: s ? s.liquidity_score : 0.5, color: '#10B981' },
                      { label: 'Market Structure', value: s ? s.market_structure_score : 0.5, color: '#A78BFA' },
                      { label: 'RWA Yield', value: s ? s.rwa_yield_score : 0.5, color: '#06B6D4' },
                    ].map(sig => (
                      <div key={sig.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{sig.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${sig.value * 100}%`, backgroundColor: sig.color }} />
                          </div>
                          <span className="font-mono text-[10px]" style={{ color: sig.color }}>{(sig.value * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
              <Card className="glass-card border-none h-full">
                <CardContent className="p-8">
                  <div className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-6">Processing Pipeline</div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {processingSteps.map((step, i) => (
                      <motion.div key={step.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                        className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                            <step.icon className="w-4 h-4" style={{ color: step.color }} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-foreground">{step.label}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">Step {i + 1}</div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed">{step.desc}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={convictionHistory}>
                        <defs>
                          <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 10}} />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px'}} itemStyle={{color: '#7C3AED'}} />
                        <Area type="monotone" dataKey="conviction" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorConv)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {r && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-card border-none border-l-4 border-l-primary/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px]" />
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-6">
                    <Brain className="w-4 h-4" />
                    AI Reasoning & Output
                  </div>
                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Conviction Score</div>
                      <div className="text-3xl font-bold text-primary glow-text-primary">{Math.round(r.conviction)}%</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Recommended Allocation</div>
                      <div className="text-lg font-bold text-foreground">{r.meth_allocation}% mETH / {r.usdy_allocation}% USDY</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Confidence Level</div>
                      <div className="text-3xl font-bold text-[#10B981]">{(r.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Risk Rating</div>
                      <Badge className={`mt-1 text-[11px] font-bold px-3 py-1 ${
                        r.risk_rating === 'low' ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' :
                        r.risk_rating === 'moderate' ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30' :
                        'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                      }`}>{r.risk_rating?.toUpperCase()}</Badge>
                    </div>
                  </div>
                  <div className="p-6 rounded-xl bg-primary/5 border border-primary/10 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Brain className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Natural Language Reasoning</div>
                        <p className="text-sm text-foreground/90 leading-relaxed font-medium">{r.reasoning}</p>
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          Generated by AgentVault AI · Deterministic Signal Processing
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.signals.map((sig, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] border-primary/20 bg-primary/5 text-primary font-medium">
                        {sig}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
