'use client';
import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_ADDRESSES, StrategyManagerABI, AgentIdentityABI } from '@/lib/contracts';
import { ERC20ABI } from '@/lib/abis/ERC20.json';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, CircleDollarSign, ExternalLink, BarChart3, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function PortfolioPage() {
  const { address } = useAccount();
  const [price, setPrice] = useState(2750);
  const { data: eb } = useBalance({ address });

  const { data: ub } = useReadContract({ 
    address: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`, 
    abi: ERC20ABI, 
    functionName: 'balanceOf', 
    args: address ? [address] : undefined, 
    query: { enabled: !!address } 
  });
  const { data: ud } = useReadContract({ 
    address: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`, 
    abi: ERC20ABI, 
    functionName: 'decimals', 
    query: { enabled: !!process.env.NEXT_PUBLIC_USDC_ADDRESS } 
  });
  const { data: ca } = useReadContract({ 
    address: CONTRACT_ADDRESSES.strategyManager, 
    abi: StrategyManagerABI, 
    functionName: 'getCurrentAllocation', 
    args: address ? [address] : undefined, 
    query: { enabled: !!address } 
  });
  const { data: ap } = useReadContract({ 
    address: CONTRACT_ADDRESSES.agentIdentity, 
    abi: AgentIdentityABI, 
    functionName: 'getProfile', 
    args: process.env.NEXT_PUBLIC_AGENT_TOKEN_ID ? [BigInt(process.env.NEXT_PUBLIC_AGENT_TOKEN_ID)] : undefined, 
    query: { enabled: !!process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS } 
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'}/price`)
      .then(res => res.json())
      .then(data => setPrice(data.ethereum?.usd || 2750))
      .catch(() => {});
  }, []);

  const mnt = eb ? Number(formatEther(eb.value)) : 0;
  const usdcDec = ud ? Number(ud) : 18;
  const usdc = ub ? Number(ub) / 10 ** usdcDec : 0;
  const tv = mnt * price + usdc;

  const allocData = ca ? [
    { name: 'ETH', value: Number(ca[0]), color: '#7C3AED' },
    { name: 'USDC', value: Number(ca[1]), color: '#10B981' },
  ] : [];

  return (
    <main className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-6xl mx-auto w-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground/90">Portfolio Assets</h2>
            <p className="text-sm text-muted-foreground">Real-time valuation on Mantle Sepolia</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-none neon-border-primary relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 blur-[50px] -translate-x-1/2 -translate-y-1/2" />
                <CardContent className="p-8">
                  <div className="flex items-center gap-2.5 text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-4">
                    <Wallet className="w-4 h-4" />
                    Net USD Valuation
                  </div>
                  <div className="text-4xl font-bold text-foreground tracking-tighter mb-2 glow-text-primary">${tv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#10B981] uppercase tracking-widest bg-[#10B981]/10 w-fit px-2 py-1 rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    Live Syncing
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-none hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-4 opacity-60">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    MNT Balance
                  </div>
                  <div className="text-3xl font-bold text-foreground tracking-tight mb-2">{mnt.toFixed(4)}</div>
                  <div className="text-xs font-mono text-muted-foreground">≈ ${(mnt * price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card border-none hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-4 opacity-60">
                    <CircleDollarSign className="w-4 h-4 text-[#10B981]" />
                    USDC Balance
                  </div>
                  <div className="text-3xl font-bold text-[#10B981] tracking-tight mb-2">{usdc.toFixed(2)}</div>
                  <div className="text-xs font-mono text-muted-foreground">Stablecoin Reserves</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {ca && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                <Card className="glass-card border-none">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-3 tracking-widest uppercase opacity-70">
                      <BarChart3 className="w-4 h-4 text-primary shadow-[0_0_10px_#7C3AED]" />
                      Allocation Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <div className="flex items-center gap-10">
                      <div className="relative w-32 h-32 shrink-0">
                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={allocData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                              {allocData.map(e => <Cell key={e.name} fill={e.color} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">Split</div>
                      </div>
                      <div className="space-y-4 flex-1">
                        {allocData.map(e => (
                          <div key={e.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                            <div className="flex items-center gap-3 text-sm font-medium">
                              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentcolor]" style={{ backgroundColor: e.color, color: e.color }} />
                              <span className="text-muted-foreground">{e.name}</span>
                            </div>
                            <span className="font-bold text-foreground">{e.value}%</span>
                          </div>
                        ))}
                        <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://sepolia.mantlescan.xyz'}/address/${CONTRACT_ADDRESSES.strategyManager}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-[10px] font-bold text-primary hover:glow-text-primary uppercase tracking-widest mt-2 ml-1">
                          Verify Strategy <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {ap && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                <Card className="glass-card border-none border-l-4 border-l-primary/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] translate-x-1/2 -translate-y-1/2" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-3 tracking-widest uppercase opacity-70">
                      <Shield className="w-4 h-4 text-primary shadow-[0_0_10px_#7C3AED]" />
                      ERC-8004 Identity
                      <Badge variant="outline" className="text-[9px] font-bold tracking-tighter bg-primary/10 border-primary/30">AGENT NFT</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0 shadow-[0_10px_30px_-10px_rgba(124,58,237,0.4)]">
                        <Shield className="w-10 h-10 text-primary glow-text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-foreground mb-1 tracking-tight">{String(ap[0])}</div>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground opacity-80">
                          <span className="flex items-center gap-1.5"><Brain className="w-3 h-3" /> {Number(ap[4])} Decisions</span>
                          <span>·</span>
                          <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> Block Registered</span>
                        </div>
                        <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://sepolia.mantlescan.xyz'}/token/${CONTRACT_ADDRESSES.agentIdentity}?a=${process.env.NEXT_PUBLIC_AGENT_TOKEN_ID}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-[10px] font-bold text-primary hover:glow-text-primary uppercase tracking-widest mt-4">
                          View Identity NFT <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
