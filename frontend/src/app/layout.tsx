import type { Metadata } from 'next';
import { Providers } from '@/providers/Providers';
import { AnalysisProvider } from '@/context/AnalysisContext';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AgentVault AI | Autonomous Portfolio Rebalancing on Mantle',
  description: 'AI agent that analyzes market signals and executes rebalances on Mantle.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans dark", geist.variable)}>
      <body>
        <Providers>
          <AnalysisProvider>
            {children}
          </AnalysisProvider>
        </Providers>
      </body>
    </html>
  );
}
