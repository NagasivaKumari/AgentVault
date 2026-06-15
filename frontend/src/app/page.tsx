import Link from 'next/link';
import { Terminal, Activity, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { t: 'Smart Money Tracking', d: 'Track whale wallets and on-chain movements across Mantle in real-time', icon: Activity },
  { t: 'AI Conviction Engine', d: 'Deterministic scoring from whale, momentum, volatility, and liquidity signals', icon: TrendingUp },
  { t: 'On-Chain Execution', d: 'Execute rebalances directly on Mantle — every transaction verifiable on MantleScan', icon: Shield },
  { t: 'Transparent AI', d: 'Every decision includes explainable reasoning with an ERC-8004 audit trail', icon: Terminal },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">AgentVault</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/login"><Button size="sm" className="text-xs font-medium h-9">Launch App</Button></Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-28 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          Live on Mantle Sepolia
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-5 tracking-tight leading-tight text-foreground">
          Autonomous AI Portfolio<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#A78BFA]">Rebalancing on Mantle</span>
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto mb-10 leading-relaxed">
          Track smart-money signals, generate conviction-weighted scores, and execute transparent AI-driven portfolio strategies — every decision recorded on an ERC-8004 identity NFT.
        </p>
        <Link href="/login">
          <Button className="text-sm font-semibold h-11 px-7 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Launch Application <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-4 gap-4">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.t} className="group rounded-lg border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
                <Icon className="w-5 h-5 text-primary mb-3 transition-colors group-hover:text-[#A78BFA]" />
                <h3 className="font-medium text-sm mb-1.5">{f.t}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-28">
        <h2 className="text-lg font-semibold text-center mb-12">How It Works</h2>
        <div className="relative">
          <div className="absolute top-5 left-[calc(50%+20px)] right-[calc(50%+20px)] h-px bg-border hidden md:block" />
          <div className="grid grid-cols-5 gap-4">
            {[
              { s: '01', l: 'Connect', d: 'Link your wallet' },
              { s: '02', l: 'Analyze', d: 'Scan on-chain signals' },
              { s: '03', l: 'Conviction', d: 'AI-weighted score' },
              { s: '04', l: 'Execute', d: 'On-chain rebalance' },
              { s: '05', l: 'Record', d: 'ERC-8004 NFT minted' },
            ].map(step => (
              <div key={step.s} className="text-center relative">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">{step.s}</div>
                <div className="text-sm font-medium">{step.l}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{step.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        AgentVault AI · Mantle Sepolia · Turing Test Hackathon 2026 · ERC-8004
      </footer>
    </main>
  );
}
