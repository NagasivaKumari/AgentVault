'use client';
import { useEffect } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, StrategyManagerABI } from '@/lib/contracts';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Shield, AlertTriangle, DollarSign, Landmark, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function RWAPage() {
  const a = useAnalysis();
  const { address } = useAccount();

  useEffect(() => {
    if (!a.recommendation && !a.loading) {
      a.runAnalysis();
    }
  }, []);

  const { data: ca } = useReadContract({ 
    address: CONTRACT_ADDRESSES.strategyManager, 
    abi: StrategyManagerABI, 
    functionName: 'getCurrentAllocation', 
    args: address ? [address] : undefined, 
    query: { enabled: !!address } 
  });

  const dynamicAllocData = ca ? [
    { name: 'mETH', allocation: Number(ca[0]), color: '#3B82F6' },
    { name: 'USDC/Stable', allocation: Number(ca[1]), color: '#10B981' },
  ] : [];

  return (
    <main className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-6xl mx-auto w-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground/90">RWA Intelligence</h2>
            <p className="text-sm text-muted-foreground">Real-world asset exposure and yield analytics (On-Chain)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-3 tracking-widest uppercase opacity-70">
                    <Landmark className="w-4 h-4 text-primary" />
                    Live On-Chain Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  {ca ? (
                    <div className="flex items-center gap-10">
                      <div className="relative w-36 h-36 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={dynamicAllocData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="allocation" stroke="none">
                              {dynamicAllocData.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Live</div>
                      </div>
                      <div className="space-y-3 flex-1">
                        {dynamicAllocData.map((e, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                              <div className="text-xs font-semibold text-foreground">{e.name}</div>
                            </div>
                            <div className="text-xs font-bold text-foreground">{e.allocation}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-8 text-center">Loading live allocation...</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
