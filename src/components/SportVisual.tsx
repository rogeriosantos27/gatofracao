/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { BiomeType } from '../types';

interface SportVisualProps {
  biome: BiomeType;
  feedback: 'correct' | 'wrong' | null;
  bossHp: number;
}

export const SportVisual: React.FC<SportVisualProps> = ({ biome, feedback, bossHp }) => {
  // Translate bossHp to progress (0 to 100)
  const playerProgress = 100 - bossHp;

  // Render different arenas depending on biome
  const renderArena = () => {
    switch (biome) {
      case 'BAMBU': // Ping Pong
        return (
          <div className="relative w-full h-24 bg-emerald-800 rounded border-2 border-amber-500 overflow-hidden flex items-center justify-between px-8">
            <div className="absolute inset-0 bg-emerald-900/40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent" />
            
            {/* Table Line divider */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-l border-white/40 border-dashed" />
            
            {/* Player Paddle (Lucky) */}
            <motion.div
              animate={
                feedback === 'correct'
                  ? { x: [0, 15, 0], scale: [1, 1.25, 1], rotate: [0, -20, 0] }
                  : feedback === 'wrong'
                  ? { y: [0, -20, 20, 0] }
                  : { y: [0, 8, -8, 0] }
              }
              transition={{ duration: 0.5, repeat: feedback ? 0 : Infinity, repeatType: 'reverse' }}
              className="z-10 flex flex-col items-center"
            >
              <div className="w-6 h-6 rounded-full bg-white border border-orange-500 flex items-center justify-center font-bold text-[8px] text-slate-800">🐱</div>
              <div className="w-5 h-1.5 bg-red-600 rounded-full mt-1 border border-white" />
            </motion.div>

            {/* Ball */}
            <motion.div
              animate={
                feedback === 'correct'
                  ? { x: [0, 150, 300], y: [0, -30, 10], scale: [1, 1.3, 0.8] }
                  : feedback === 'wrong'
                  ? { x: [300, 150, -50], y: [0, -35, 30], scale: [1, 1.3, 0.8] }
                  : { x: [-10, 120, -10], y: [0, -20, 0] }
              }
              transition={{ duration: feedback ? 0.8 : 2.5, repeat: feedback ? 0 : Infinity }}
              className="absolute left-[80px] w-3 h-3 bg-yellow-400 rounded-full border border-black z-20 shadow-lg"
            />

            {/* Opponent Paddle (Tengu) */}
            <motion.div
              animate={
                feedback === 'wrong'
                  ? { x: [0, -15, 0], scale: [1, 1.25, 1], rotate: [0, 20, 0] }
                  : { y: [0, -8, 8, 0] }
              }
              transition={{ duration: 0.5, repeat: feedback ? 0 : Infinity, repeatType: 'reverse' }}
              className="z-10 flex flex-col items-center"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-700 border border-emerald-400 flex items-center justify-center font-bold text-[8px] text-white">👺</div>
              <div className="w-5 h-1.5 bg-blue-600 rounded-full mt-1 border border-white" />
            </motion.div>
          </div>
        );

      case 'NEVE': // Climbing Wall
        return (
          <div className="relative w-full h-24 bg-sky-950 rounded border-2 border-blue-500 overflow-hidden flex items-end justify-around pb-1">
            <div className="absolute inset-x-0 bottom-0 h-4 bg-sky-900/60" />
            
            {/* Snowy details */}
            <div className="absolute top-2 right-4 w-4 h-4 bg-white/20 rounded-full blur-xs" />
            <div className="absolute top-4 left-1/3 w-3 h-3 bg-white/10 rounded-full blur-xs" />

            {/* Climbing Rocks background */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 items-center opacity-40">
              <div className="w-3 h-2 bg-slate-600 rounded-full ml-12" />
              <div className="w-2.5 h-2.5 bg-slate-500 rounded-full mr-20" />
              <div className="w-3.5 h-2 bg-slate-700 rounded-full ml-6" />
            </div>

            {/* Lucky Climber */}
            <motion.div
              animate={{ y: -playerProgress * 0.55 }}
              transition={{ type: 'spring', stiffness: 80 }}
              className="z-10 flex flex-col items-center absolute left-1/4 bottom-3"
            >
              <motion.div 
                animate={feedback === 'correct' ? { scale: [1, 1.3, 1] } : feedback === 'wrong' ? { rotate: [0, -45, 45, 0] } : {}}
                className="w-7 h-7 rounded-full bg-white border border-amber-500 flex items-center justify-center shadow-lg font-bold text-xs"
              >
                🐱
              </motion.div>
              <div className="w-0.5 h-16 bg-amber-400/80 border-l border-amber-600/30 -z-10" />
            </motion.div>

            {/* Fukuro Opponent */}
            <div className="z-10 flex flex-col items-center absolute right-1/4 top-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-300 flex items-center justify-center font-bold text-sm shadow-md animate-bounce">
                🦉
              </div>
              <div className="text-[7px] text-sky-400 mt-0.5 font-bold">FUKURO</div>
            </div>
          </div>
        );

      case 'LAGO_LOTUS': // Archery Target
        return (
          <div className="relative w-full h-24 bg-teal-900 rounded border-2 border-teal-500 overflow-hidden flex items-center justify-between px-10">
            <div className="absolute inset-0 bg-teal-950/50" />

            {/* Lucky Bow */}
            <motion.div
              animate={feedback === 'correct' ? { x: [0, -10, 5, 0] } : {}}
              className="z-10 flex items-center gap-1"
            >
              <span className="text-xl">🐱</span>
              <div className="w-6 h-8 border-y-2 border-r-2 border-amber-600 rounded-r-full relative flex items-center justify-center">
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-slate-400" />
              </div>
            </motion.div>

            {/* Arrow */}
            <motion.div
              animate={
                feedback === 'correct'
                  ? { x: [0, 200], y: [0, -5, 0], opacity: [1, 1, 0] }
                  : feedback === 'wrong'
                  ? { x: [0, 150, 180], y: [0, -40, -10], rotate: [0, -30, 60], opacity: [1, 1, 0] }
                  : { x: 0, y: 0 }
              }
              transition={{ duration: 0.6 }}
              className="absolute left-[85px] w-10 h-0.5 bg-amber-200 z-20 flex items-center justify-end"
            >
              <div className="w-1.5 h-1.5 bg-slate-400 rotate-45 transform -mr-0.5" />
            </motion.div>

            {/* Archery Target */}
            <motion.div
              animate={feedback === 'correct' ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
              className="w-12 h-12 rounded-full bg-red-600 border-4 border-white flex items-center justify-center relative shadow-lg"
            >
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
              </div>
            </motion.div>
          </div>
        );

      case 'PALACIO_AGUA': // Swimming Pool
        return (
          <div className="relative w-full h-24 bg-blue-900 rounded border-2 border-blue-400 overflow-hidden flex items-center justify-center gap-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent animate-pulse" />
            
            {/* Water lanes */}
            <div className="absolute inset-x-0 top-1/4 h-0.5 bg-blue-400/30 border-t border-dashed" />
            <div className="absolute inset-x-0 top-2/4 h-0.5 bg-blue-400/30 border-t border-dashed" />
            <div className="absolute inset-x-0 top-3/4 h-0.5 bg-blue-400/30 border-t border-dashed" />

            {/* Lucky Swimmer */}
            <motion.div
              animate={
                feedback === 'correct'
                  ? { rotate: [0, 360], scale: [1, 1.2, 1] }
                  : feedback === 'wrong'
                  ? { y: [0, 10, -10, 0] }
                  : { y: [0, 4, -4, 0] }
              }
              transition={{ duration: feedback === 'correct' ? 1 : 1.5, repeat: feedback ? 0 : Infinity }}
              className="z-10 flex flex-col items-center"
            >
              <span className="text-xl">🐱</span>
              <div className="text-[7px] text-blue-200 font-bold mt-1 tracking-widest font-mono">LUCKY</div>
            </motion.div>

            {/* Otohime Mermaid */}
            <motion.div
              animate={
                feedback === 'wrong'
                  ? { rotate: [0, 360] }
                  : { y: [0, -4, 4, 0] }
              }
              transition={{ duration: 1.5, repeat: Infinity }}
              className="z-10 flex flex-col items-center"
            >
              <span className="text-xl">🧜‍♀️</span>
              <div className="text-[7px] text-blue-300 font-bold mt-1 tracking-widest font-mono">OTOHIME</div>
            </motion.div>
          </div>
        );

      case 'CIDADE_SKATE': // Halfpipe
        return (
          <div className="relative w-full h-24 bg-violet-950 rounded border-2 border-violet-500 overflow-hidden flex items-end justify-around pb-2">
            <div className="absolute inset-x-0 bottom-0 h-4 bg-violet-900/50" />
            
            {/* Ramp curve overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-violet-800/10 via-transparent to-transparent" />

            {/* Lucky Skateboarding */}
            <motion.div
              animate={
                feedback === 'correct'
                  ? { y: [0, -40, 0], rotate: [0, 360, 0], scale: [1, 1.35, 1] }
                  : feedback === 'wrong'
                  ? { x: [0, -20, 0], rotate: [0, -35, 0] }
                  : { y: [0, -5, 0] }
              }
              transition={{ duration: feedback ? 0.8 : 1.2, repeat: feedback ? 0 : Infinity }}
              className="z-10 flex flex-col items-center"
            >
              <span className="text-xl">🐱</span>
              <div className="w-6 h-1.5 bg-yellow-500 rounded-full border border-black relative flex justify-between px-0.5">
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
              </div>
            </motion.div>

            {/* Tanuki Skater */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="z-10 flex flex-col items-center"
            >
              <span className="text-xl">🦝</span>
              <div className="w-6 h-1.5 bg-blue-500 rounded-full border border-black relative flex justify-between px-0.5">
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
              </div>
            </motion.div>
          </div>
        );

      case 'DESERTO': // Race Track
        return (
          <div className="relative w-full h-24 bg-amber-950 rounded border-2 border-amber-600 overflow-hidden flex items-center justify-around px-8">
            <div className="absolute inset-0 bg-amber-900/40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/10 via-transparent to-transparent" />

            {/* Track lanes */}
            <div className="absolute inset-x-0 h-8 border-y border-dashed border-amber-600/30" />

            {/* Lucky Runner */}
            <motion.div
              animate={
                feedback === 'correct'
                  ? { x: [0, 100, 0], scale: [1, 1.15, 1] }
                  : feedback === 'wrong'
                  ? { x: [0, -30, 0], opacity: [1, 0.6, 1] }
                  : { x: [0, 10, 0] }
              }
              transition={{ duration: feedback ? 0.8 : 1.5, repeat: feedback ? 0 : Infinity }}
              className="z-10 flex flex-col items-center"
            >
              <span className="text-xl animate-pulse">🐱</span>
              <div className="text-[6px] text-amber-200 font-mono font-bold mt-0.5">LUCKY</div>
            </motion.div>

            {/* Runner Opponent Kijimuna */}
            <motion.div
              animate={
                feedback === 'wrong'
                  ? { x: [0, 80, 0] }
                  : { x: [0, -5, 0] }
              }
              transition={{ duration: 1.5, repeat: Infinity }}
              className="z-10 flex flex-col items-center"
            >
              <span className="text-xl">🦊</span>
              <div className="text-[6px] text-amber-300 font-mono font-bold mt-0.5">KIJIMUNA</div>
            </motion.div>
          </div>
        );

      case 'LAVA': // Rugby Match
        return (
          <div className="relative w-full h-24 bg-red-950 rounded border-2 border-red-700 overflow-hidden flex items-center justify-around px-12">
            {/* Boiling Magma lines */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-600/15 via-transparent to-transparent" />
            <div className="absolute bottom-1 inset-x-4 h-0.5 bg-orange-600/40 animate-pulse" />

            {/* Lucky Rugby Hero */}
            <motion.div
              animate={
                feedback === 'correct'
                  ? { x: [0, 150, 0], scale: [1, 1.2, 1] }
                  : feedback === 'wrong'
                  ? { rotate: [0, -15, 15, 0], x: [0, -10, 0] }
                  : { x: [0, 4, -4, 0] }
              }
              transition={{ duration: feedback ? 0.8 : 1.4, repeat: feedback ? 0 : Infinity }}
              className="z-10 flex flex-col items-center"
            >
              <span className="text-xl">🐱🏉</span>
              <div className="text-[7px] text-red-300 font-mono font-bold mt-0.5">LUCKY</div>
            </motion.div>

            {/* Oni Giant Defender */}
            <motion.div
              animate={
                feedback === 'correct'
                  ? { scale: [1, 0.8, 1], opacity: [1, 0.4, 1] }
                  : { scale: [1, 1.05, 1] }
              }
              transition={{ duration: 1.5, repeat: Infinity }}
              className="z-10 flex flex-col items-center"
            >
              <span className="text-2xl">👹</span>
              <div className="text-[7px] text-orange-400 font-mono font-bold mt-0.5">ONI REI</div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full mb-4 z-20">
      {renderArena()}
    </div>
  );
};
