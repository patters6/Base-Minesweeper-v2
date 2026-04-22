/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains';
import { config } from './config/wagmi';
import { Minesweeper } from './components/Minesweeper';
import { motion } from 'motion/react';
import { Wallet, LogOut, Shield } from 'lucide-react';

const queryClient = new QueryClient();

function Header() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between bg-base-surface shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-base-blue rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,82,255,0.3)]">
          <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
        </div>
        <span className="text-xl font-bold tracking-tight uppercase">Base Sweeper</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Network</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium italic">Base Mainnet</span>
          </div>
        </div>
        
        {!isConnected ? (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="h-10 px-6 bg-base-blue text-white text-xs font-bold rounded-lg hover:bg-base-blue/90 transition-all cursor-pointer uppercase tracking-widest"
          >
            Connect
          </button>
        ) : (
          <div className="h-10 px-4 flex items-center bg-white/5 border border-white/10 rounded-lg group relative">
            <span className="text-sm font-mono text-base-blue">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button 
              onClick={() => disconnect()}
              className="absolute -bottom-8 right-0 bg-red-500/20 text-red-500 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold"
            >
              DISCONNECT
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-base-dark text-white font-sans overflow-hidden flex flex-col selection:bg-base-blue/30">
          <Header />

          {/* Main Layout */}
          <div className="flex-1 overflow-auto">
            <Minesweeper />
          </div>

          {/* Sticky Footer */}
          <footer className="h-12 border-t border-white/10 bg-base-dark px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <span>© 2026 Base-Sweeper Protocol</span>
              <span className="text-white/20">|</span>
              <span className="hover:text-white cursor-pointer transition-colors">Security Audit</span>
              <span className="text-white/20">|</span>
              <span className="hover:text-white cursor-pointer transition-colors">Docs</span>
            </div>
            <div className="flex gap-4">
              <div className="h-2 w-2 rounded-full bg-base-blue"></div>
              <div className="h-2 w-2 rounded-full bg-white/10"></div>
              <div className="h-2 w-2 rounded-full bg-white/10"></div>
            </div>
          </footer>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
