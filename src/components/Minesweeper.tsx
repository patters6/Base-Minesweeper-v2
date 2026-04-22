import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createBoard, revealCell, type Cell, type GameStatus } from '../lib/minesweeper';
import { cn } from '../lib/utils';
import { useAccount, useSendTransaction, useConnect } from 'wagmi';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

// Base Ecosystem App ID for attribution.
const BUILDER_CODE = '0x69e918db56caa7489826f560'; 

export const Minesweeper: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [minesRemaining, setMinesRemaining] = useState(MINES);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { sendTransaction } = useSendTransaction();

  const initGame = useCallback(() => {
    setBoard(createBoard(ROWS, COLS, MINES));
    setStatus('playing');
    setMinesRemaining(MINES);
    setTimer(0);
    setIsActive(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    let interval: any;
    if (isActive && status === 'playing') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, status]);

  const handleCellClick = (row: number, col: number) => {
    if (status !== 'playing') return;
    if (!isActive) setIsActive(true);

    const cell = board[row][col];
    if (cell.isFlagged || cell.isRevealed) return;

    if (cell.value === 'mine') {
      // Game Over - reveal all mines
      const finalBoard = board.map(r => r.map(c => ({
        ...c,
        isRevealed: c.value === 'mine' ? true : c.isRevealed
      })));
      setBoard(finalBoard);
      setStatus('lost');
      return;
    }

    const newBoard = revealCell(board, row, col);
    setBoard(newBoard);

    // Check Win
    const allCells = newBoard.flat();
    const unrevealedNonMines = allCells.filter(c => c.value !== 'mine' && !c.isRevealed);
    if (unrevealedNonMines.length === 0) {
      setStatus('won');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (status !== 'playing' || board[row][col].isRevealed) return;

    const newBoard = board.map(r => r.map(c => {
      if (c.row === row && c.col === col) {
        const nextFlagged = !c.isFlagged;
        setMinesRemaining(prev => nextFlagged ? prev - 1 : prev + 1);
        return { ...c, isFlagged: nextFlagged };
      }
      return c;
    }));
    setBoard(newBoard);
  };

  const handleCheckIn = async () => {
    if (!isConnected || !address) return;

    // "Free check-in" means we send a 0-value transaction to ourselves
    // but append the Builder Code to the data field to support the Base ecosystem attribution.
    try {
      sendTransaction({
        to: address, // Self-transaction
        value: 0n,
        // Append builder code to the data field
        // Builders can get a specific ID for their app.
        data: BUILDER_CODE as `0x${string}`,
      });
    } catch (err) {
      console.error('Check-in failed:', err);
    }
  };

  return (
    <main className="flex p-8 gap-8 items-start justify-center overflow-auto min-h-full">
      {/* Side Stats Panel */}
      <div className="w-64 space-y-6 hidden lg:block shrink-0">
        <div className="bg-base-surface border border-white/10 p-5 rounded-2xl">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold">Live Session</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-400">Time</span>
              <span className="text-2xl font-mono text-base-blue">{timer.toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-400">Mines</span>
              <span className="text-2xl font-mono">{(MINES - minesRemaining)} / {MINES}</span>
            </div>
          </div>
          <button 
            onClick={initGame}
            className="w-full mt-6 py-2 bg-base-line hover:bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Reset Field
          </button>
        </div>

        <div className="bg-base-surface border border-base-blue/30 p-5 rounded-2xl shadow-[0_0_20px_rgba(0,82,255,0.1)] relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xs text-base-blue uppercase tracking-widest mb-2 font-bold">Daily Check-In</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">Claim your daily multiplier. Gas only interaction on Base.</p>
            <button 
              onClick={() => {
                if (!isConnected) {
                  connect({ connector: connectors[0] });
                } else {
                  handleCheckIn();
                }
              }}
              className="w-full py-3 bg-base-blue hover:bg-base-blue/80 text-white rounded-xl text-sm font-bold transition-all shadow-lg cursor-pointer"
            >
              {isConnected ? 'CLAIM REWARD' : 'CONNECT WALLET'}
            </button>
            <div className="mt-4 flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span>Est. Gas: 0.00004 ETH</span>
              <span className="text-base-blue">$0.12 USD</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-base-blue/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Central Game Grid */}
      <div className="flex flex-col items-center">
        <div className="bg-base-surface p-6 rounded-3xl border border-white/10 shadow-2xl relative">
          <div 
            className="minesweeper-grid"
            style={{ gridTemplateColumns: `repeat(${COLS}, auto)` }}
          >
            {board.map((row, r) => 
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleContextMenu(e, r, c)}
                  className={cn(
                    "cell",
                    !cell.isRevealed && "cell-unrevealed",
                    cell.isRevealed && "cell-revealed",
                    cell.isRevealed && cell.value === 'mine' && "cell-mine"
                  )}
                >
                  {cell.isRevealed ? (
                    cell.value === 'mine' ? (
                      '!'
                    ) : (
                      cell.value > 0 ? cell.value : ''
                    )
                  ) : (
                    cell.isFlagged ? (
                      <div className="w-2 h-2 bg-base-blue rounded-sm" />
                    ) : (
                      null
                    )
                  )}
                </div>
              ))
            )}
          </div>

          {/* Overlay for Win/Loss */}
          <AnimatePresence>
            {status !== 'playing' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-base-dark/90 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center rounded-[2.5rem]"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                >
                  <h2 className={cn(
                    "text-3xl font-black mb-4 tracking-tighter",
                    status === 'won' ? "text-green-500" : "text-red-500"
                  )}>
                    {status === 'won' ? 'VICTORY' : 'TERMINATED'}
                  </h2>
                  <p className="text-gray-400 mb-8 text-sm max-w-[200px]">
                    {status === 'won' 
                      ? `Mission accomplished in ${timer} seconds.` 
                      : 'Security breach detected. System locked.'}
                  </p>
                  <button 
                    onClick={initGame}
                    className="px-8 py-3 bg-white text-black font-black rounded-xl text-sm hover:scale-105 active:scale-95 transition-all uppercase tracking-widest cursor-pointer"
                  >
                    Initialize
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-8 flex gap-4">
          <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-3">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Rank</span>
            <span className="text-sm font-mono tracking-tighter">#1,244</span>
          </div>
          <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-3">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Efficiency</span>
            <span className="text-sm font-mono tracking-tighter">94%</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Sidebar */}
      <div className="w-64 bg-base-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col hidden xl:flex shrink-0">
        <div className="p-5 border-b border-white/10 bg-white/5 text-center">
          <h3 className="text-[10px] text-white uppercase tracking-[0.2em] font-black flex justify-between items-center">
            Leaderboard
            <span className="text-base-blue text-[8px] bg-base-blue/10 px-2 py-0.5 rounded">GLOBAL</span>
          </h3>
        </div>
        <div className="flex-1">
          {[
            { pos: '01', addr: '0x8f1...a221', time: '0:42', active: true },
            { pos: '02', addr: '0x2a1...bb49', time: '0:48' },
            { pos: '03', addr: '0xc44...9e10', time: '0:55' },
            { pos: '04', addr: 'vitalik.base', time: '1:02' },
            { pos: '05', addr: '0x32b...f110', time: '1:15' },
          ].map((row, i) => (
            <div key={i} className={cn(
              "p-4 flex items-center gap-3 border-b border-white/5",
              row.active && "bg-base-blue/5"
            )}>
              <div className={cn("text-xs font-mono", row.active ? "text-base-blue" : "text-gray-500")}>{row.pos}</div>
              <div className="flex-1 text-sm font-medium tracking-tight text-gray-300">{row.addr}</div>
              <div className="text-xs font-mono text-white/40">{row.time}</div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white/5 flex items-center justify-center">
          <button className="text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-tighter transition-colors cursor-pointer">View Full History</button>
        </div>
      </div>
    </main>
  );
};
