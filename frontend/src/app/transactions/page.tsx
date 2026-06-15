'use client';
import { useAnalysis } from '@/context/AnalysisContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowLeftRight, ExternalLink, CheckCircle2, Clock, XCircle, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Brain } from 'lucide-react';

const txTypeConfig = {
  deposit: { label: 'Deposit', icon: ArrowDownToLine, color: '#10B981' },
  withdrawal: { label: 'Withdrawal', icon: ArrowUpFromLine, color: '#EF4444' },
  rebalance: { label: 'Rebalance', icon: RefreshCw, color: '#7C3AED' },
  ai_action: { label: 'AI Action', icon: Brain, color: '#3B82F6' },
};

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#10B981' },
  pending: { label: 'Pending', color: '#F59E0B' },
  failed: { label: 'Failed', color: '#EF4444' },
};

export default function TransactionsPage() {
  const a = useAnalysis();
  const { transactions } = a;

  return (
    <main className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-6xl mx-auto w-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground/90">Transaction Explorer</h2>
            <p className="text-sm text-muted-foreground">Deposits, withdrawals, rebalances, and AI actions on Mantle</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {Object.entries(txTypeConfig).map(([key, config], i) => {
              const count = transactions.filter(tx => tx.type === key).length;
              const Icon = config.icon;
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass-card border-none">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                        <Badge className="text-[9px] font-bold px-2 py-0.5" style={{ backgroundColor: `${config.color}15`, color: config.color, borderColor: `${config.color}30` }}>{count}</Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">{config.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-none">
              <CardHeader className="pb-4 border-b border-white/[0.03]">
                <CardTitle className="text-sm font-bold flex items-center gap-3 tracking-widest uppercase opacity-70">
                  <ArrowLeftRight className="w-4 h-4 text-primary" />
                  Mantle Execution Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.length > 0 ? (
                  <div className="divide-y divide-white/[0.03]">
                    {transactions.map((tx, i) => {
                      const typeCfg = txTypeConfig[tx.type];
                      const statusCfg = statusConfig[tx.status];
                      const Icon = typeCfg.icon;
                      const StatusIcon = tx.status === 'confirmed' ? CheckCircle2 : tx.status === 'pending' ? Clock : XCircle;
                      return (
                        <div key={tx.hash} className="flex items-center justify-between py-6 px-8 hover:bg-white/[0.01] transition-colors group">
                          <div className="flex items-center gap-6">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border group-hover:scale-110 transition-transform" style={{ backgroundColor: `${typeCfg.color}10`, borderColor: `${typeCfg.color}20` }}>
                              <Icon className="w-5 h-5" style={{ color: typeCfg.color }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">{typeCfg.label}</span>
                                {tx.amount && <span className="text-xs font-mono text-muted-foreground">{tx.amount} {tx.asset}</span>}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-60">
                                <Clock className="w-3 h-3" />
                                <span>{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                                <span>· Block #{tx.block}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-bold tracking-widest flex items-center gap-1" style={{ borderColor: `${statusCfg.color}30`, backgroundColor: `${statusCfg.color}10`, color: statusCfg.color }}>
                              <StatusIcon className="w-3 h-3" />
                              {statusCfg.label}
                            </Badge>
                            <a href={`${a.explorer}/tx/${tx.hash}`} target="_blank" rel="noopener" className="text-xs text-primary hover:glow-text-primary font-mono inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-lg border border-primary/10 transition-all">
                              {tx.hash.slice(0, 12)}…{tx.hash.slice(-8)} <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white/[0.01]">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center mx-auto mb-5 border border-white/5">
                      <ArrowLeftRight className="w-6 h-6 text-muted-foreground/20" />
                    </div>
                    <p className="text-sm text-muted-foreground font-bold tracking-tight">No on-chain activity recorded</p>
                    <p className="text-xs text-muted-foreground mt-2 opacity-50">Authorized transactions will appear in this ledger.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
