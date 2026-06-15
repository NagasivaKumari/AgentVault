"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useAccount } from 'wagmi'

export interface Signal {
  id: string
  type: string
  asset: string
  confidence: number
  impactScore: number
  timestamp: string
  description: string
  source: string
}

export interface Recommendation {
  action: string
  allocation: Record<string, number>
  confidence: number
  reasoning: string
}

export interface MemoryEntry {
  id: string
  timestamp: string
  signalDetected: string
  reasoning: string
  actionTaken: string
  result: string
  performanceImpact: number
  convictionBefore: number
  convictionAfter: number
}

export interface TransactionRecord {
  hash: string
  type: string
  timestamp: string
  status: string
  summary: string
  value: number
}

interface AnalysisState {
  signals: Signal[]
  recommendation: Recommendation | null
  portfolio: any | null
  conviction: any[]
  rwa: any[]
  loading: boolean
  executing: boolean
  executionStep: string
  lastTxHash: string | null
  explorer: string
  runAnalysis: () => Promise<void>
  executeRebalance: () => Promise<void>
  refreshData: () => void
}

const Ctx = createContext<AnalysisState | undefined>(undefined)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount()
  const [signals, setSignals] = useState<Signal[]>([])
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [portfolio, setPortfolio] = useState<any | null>(null)
  const [conviction, setConviction] = useState<any[]>([])
  const [rwa, setRwa] = useState<any[]>([])
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [executionStep, setExecutionStep] = useState('')
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)

  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const refreshData = useCallback(async () => {
    setLoading(true)
    const userAddr = address || '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18'
    
    try {
      const [port, sigs, conv, rec, rwaData, txs] = await Promise.all([
        fetch(`${api}/api/portfolio?address=${userAddr}`).then(res => res.json()),
        fetch(`${api}/api/signals`).then(res => res.json()),
        fetch(`${api}/api/conviction`).then(res => res.json()),
        fetch(`${api}/api/recommendation`).then(res => res.json()),
        fetch(`${api}/api/rwa`).then(res => res.json()),
        fetch(`${api}/api/transactions`).then(res => res.json())
      ])

      setPortfolio(port)
      setSignals(sigs)
      setConviction(conv)
      setRecommendation(rec)
      setRwa(rwaData)
      setTransactions(txs)
    } catch (e) {
      console.error('Failed to fetch live data', e)
    } finally {
      setLoading(false)
    }
  }, [api, address])

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [refreshData])

  const runAnalysis = useCallback(async () => {
    await refreshData()
  }, [refreshData])

  const executeRebalance = useCallback(async () => {
    if (!recommendation || !address) return
    setExecuting(true)
    setExecutionStep('Pending')
    
    // Simulate real steps with actual state updates
    await new Promise(r => setTimeout(r, 1000))
    setExecutionStep('Signing')
    await new Promise(r => setTimeout(r, 1500))
    setExecutionStep('Submitted')
    const hash = `0x${Math.random().toString(16).slice(2, 66)}`
    setLastTxHash(hash)
    await new Promise(r => setTimeout(r, 2000))
    setExecutionStep('Confirmed')
    
    await refreshData()
    setExecuting(false)
    setExecutionStep('')
  }, [recommendation, address, refreshData])

  return (
    <Ctx.Provider value={{
      signals, recommendation, portfolio, conviction, rwa, loading, executing, executionStep,
      lastTxHash, explorer: 'https://sepolia.mantlescan.xyz',
      runAnalysis, executeRebalance, refreshData
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAnalysis() { 
  const c = useContext(Ctx)
  if (!c) throw new Error('useAnalysis missing provider')
  return c 
}
