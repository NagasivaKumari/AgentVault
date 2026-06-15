'use client';
import { useEffect } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { History, Brain, TrendingUp, TrendingDown, Activity, ExternalLink, Clock, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const performanceData = (() => {
  const arr = [];
  for (let i = 0; i < 30; i++) {
    arr.push({ day: i + 1, impact: Math.random() * 4 - 1 + Math.sin(i * 0.3) * 2 });
  }
  return arr;
})();

export default function MemoryPage() {
  const a = useAnalysis();

  useEffect(() => {
    if (!a.decisionHistory.length && !a.loading) {
      a.runAnalysis();
    }
  }, []);

  const { decisionHistory } = a;

  return (
    <main className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground/90">Agent Memory</h2>
              <p className="text-sm text-muted-foreground">Persistent AI decision history with performance tracking</p>
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 bg-primary/5 text-primary font-bold px-3 py-1.5">
              {decisionHistory.length} Decisions Recorded
            </Badge>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold tracking-widest uppercase opacity-60 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  Performance Impact Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 10}} />
                      <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px'}} />
                      <Area type="monotone" dataKey="impact" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorImpact)" name="Impact %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-4">
            {decisionHistory.map((entry, index) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="glass-card border-none hover:border-l-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          entry.conviction > 80 ? 'bg-[#10B981]/10 border border-[#10B981]/20' :
                          entry.conviction > 60 ? 'bg-primary/10 border border-primary/20' :
                          'bg-[#F59E0B]/10 border border-[#F59E0B]/20'
                        }`}>
                          <Brain className={`w-5 h-5 ${
                            entry.conviction > 80 ? 'text-[#10B981]' :
                            entry.conviction > 60 ? 'text-primary' : 'text-[#F59E0B]'
                          }`} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{entry.signal}</div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`text-[10px] font-bold px-3 py-1 ${
                          entry.conviction > 80 ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' :
                          entry.conviction > 60 ? 'bg-primary/15 text-primary border-primary/30' :
                          'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                        }`}>
                          {entry.conviction}% Conviction
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1 opacity-60">Reasoning</div>
                        <p className="text-xs text-foreground/80 leading-relaxed">{entry.reasoning}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1 opacity-60">Action Taken</div>
                        <p className="text-xs text-foreground/80 leading-relaxed">{entry.action}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Target className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Result: </span>
                          <span className={entry.result.includes('+') ? 'text-[#10B981] font-semibold' : 'text-foreground font-semibold'}>{entry.result}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                          <span className="text-muted-foreground">Impact: </span>
                          <span className="text-[#10B981] font-semibold">{entry.impact}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
