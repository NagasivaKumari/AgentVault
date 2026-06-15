'use client';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Circle } from 'lucide-react';

export default function TopBar() {
  const { address, isConnected } = useAccount();
  const { data: bal } = useBalance({ address });

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-end px-5 gap-3 shrink-0">
      {isConnected ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs font-normal">
            <Circle className="w-1.5 h-1.5 fill-[#10B981] text-[#10B981]" />
            Mantle Sepolia
          </Badge>
          {bal && (
            <span className="text-sm text-muted-foreground font-mono">{Number(formatEther(bal.value)).toFixed(4)} MNT</span>
          )}
          <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />
        </motion.div>
      ) : (
        <ConnectButton showBalance={false} chainStatus="none" />
      )}
    </header>
  );
}
