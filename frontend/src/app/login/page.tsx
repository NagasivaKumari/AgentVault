'use client';
import { useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { loadConfig } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Terminal, ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const router = useRouter();
  useEffect(() => { loadConfig(); }, []);
  useEffect(() => { if (isConnected) router.push('/dashboard'); }, [isConnected, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#080B13] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full animate-pulse-glow" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="relative z-10 w-full max-w-md">
        <Card className="glass-card border-white/5 p-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
          
          <div className="text-center">
            <motion.div 
              initial={{ y: -10 }} 
              animate={{ y: 0 }} 
              className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(124,58,237,0.4)] group"
            >
              <Terminal className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-2 tracking-tighter text-white glow-text-primary">AgentVault</h1>
            <p className="text-sm text-muted-foreground font-medium mb-10 tracking-wide uppercase opacity-60">Autonomous Intelligence Gateway</p>
            
            <div className="space-y-4">
              {connectors.map(c => (
                <Button 
                  key={c.uid} 
                  onClick={() => connect({ connector: c })} 
                  disabled={isPending} 
                  className="w-full h-14 text-sm font-bold gap-3 transition-all bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_25px_-5px_rgba(124,58,237,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Wallet className="w-5 h-5" />
                  {isPending ? 'Verifying Identity...' : c.name === 'Injected' ? 'Authorize with MetaMask' : `Authorize with ${c.name}`}
                </Button>
              ))}
            </div>
            
            <p className="text-[11px] text-muted-foreground font-medium mt-8 tracking-widest uppercase opacity-40">
              Secured by Mantle Network
            </p>
            
            <div className="mt-10 pt-8 border-t border-white/5">
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-all uppercase tracking-widest group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                System Portal
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
