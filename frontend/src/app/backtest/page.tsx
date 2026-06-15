'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAnalysis } from '@/context/AnalysisContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BarChart3, Clock, TrendingUp, TrendingDown, ArrowUpRight, Activity, Brain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function BacktestPage() {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const a = useAnalysis();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runBacktest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/backtest`);

      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBacktest();
  }, []);

  return (
    <main className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground/90">Strategy Backtest</h2>
              <p className="text-sm text-muted-foreground">Historical performance simulation vs. Buy & Hold</p>
            </div>
            <Button 
              onClick={runBacktest} 
              disabled={loading} 
              className="text-xs font-semibold h-10 px-6 gap-2 bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              <Activity className={loading ? "animate-spin w-4 h-4" : "w-4 h-4"} />
              {loading ? "Simulating..." : "Run New Simulation"}
            </Button>
          </div>

          {data ? (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="glass-card border-none">
                    <CardContent className="p-6">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-3 opacity-60">Strategy Return (30D)</div>
                      <div className={`text-3xl font-bold tracking-tighter ${data.total_return >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} glow-text-primary`}>
                        {data.total_return >= 0 ? '+' : ''}{data.total_return}%
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-widest">AgentVault AI Performance</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="glass-card border-none">
                    <CardContent className="p-6">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-3 opacity-60">Benchmark Return (30D)</div>
                      <div className={`text-3xl font-bold tracking-tighter ${data.benchmark_return >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {data.benchmark_return >= 0 ? '+' : ''}{data.benchmark_return}%
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-widest">Buy & Hold ETH</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="glass-card border-none neon-border-primary">
                    <CardContent className="p-6">
                      <div className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-3">Alpha Generation</div>
                      <div className="text-3xl font-bold tracking-tighter text-white">
                        +{(data.total_return - data.benchmark_return).toFixed(2)}%
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-widest">Excess vs. Benchmark</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="glass-card border-none">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-bold tracking-widest uppercase opacity-70 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Cumulative Portfolio Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.history}>
                          <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}}
                            minTickGap={30}
                          />
                          <YAxis 
                            hide 
                            domain={['dataMin - 500', 'dataMax + 500']}
                          />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px'}}
                            itemStyle={{color: '#7C3AED'}}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="portfolio_value" 
                            stroke="#7C3AED" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorVal)" 
                            animationDuration={2000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold tracking-widest uppercase opacity-60">Price Action vs. Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis hide dataKey="date" />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px'}}
                          />
                          <Line type="monotone" dataKey="price" stroke="#94a3b8" strokeWidth={1} dot={false} name="ETH Price" />
                          <Line type="stepAfter" dataKey="eth_allocation" stroke="#7C3AED" strokeWidth={2} dot={false} name="ETH %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card border-none border-l-4 border-l-[#10B981]/50">
                  <CardContent className="p-8">
                    <div className="text-[10px] text-[#10B981] font-bold uppercase tracking-[0.2em] mb-4">Simulation Logic</div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 flex items-center justify-center shrink-0 border border-[#10B981]/20">
                          <Brain className="w-3.5 h-3.5 text-[#10B981]" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          The agent executes daily rebalances based on the weighted signal spectrum, de-risking to USDC during volatility spikes and increasing ETH exposure during momentum breakout.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 flex items-center justify-center shrink-0 border border-[#10B981]/20">
                          <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          By avoiding major drawdowns through algorithmic conviction scoring, the strategy consistently generates alpha over a static benchmark.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-32">
              <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-6" />
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest animate-pulse">Running Historical Simulation...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
