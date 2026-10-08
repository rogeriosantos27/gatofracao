/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Trophy, Sparkles, HelpCircle, Volume2, VolumeX, Backpack, Pause, Maximize, Minimize } from 'lucide-react';

interface GameHUDProps {
  playerHp: number;
  playerMaxHp: number;
  playerLevel: number;
  playerCristais: number;
  pocoes: number;
  onUsePotion: () => void;
  onOpenHelp: () => void;
  onOpenPause?: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  playerHp,
  playerMaxHp,
  playerLevel,
  playerCristais,
  pocoes,
  onUsePotion,
  onOpenHelp,
  onOpenPause,
  soundMuted,
  onToggleSound,
  onToggleFullscreen,
  isFullscreen = false,
}) => {
  const hpPercentage = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));

  return (
    <div 
      className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-950/95 to-slate-900/90 border-b-[2px] sm:border-b-4 border-red-700 flex items-center justify-between px-1.5 sm:px-6 z-30 select-none shadow-md transition-all"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'calc(0.375rem + env(safe-area-inset-left, 0px))',
        paddingRight: 'calc(0.375rem + env(safe-area-inset-right, 0px))',
        height: 'calc(2.5rem + env(safe-area-inset-top, 0px))', // h-10 (40px) on mobile + safe area top
        touchAction: 'manipulation',
      }}
    >
      {/* Hero Stats */}
      <div className="flex items-center gap-1 sm:gap-4">
        {/* Name Box */}
        <div className="flex flex-col">
          <span className="hidden min-[380px]:block text-[6.5px] sm:text-[10px] font-bold text-amber-400 tracking-wider font-mono leading-none mb-0.5">HERÓI</span>
          <div className="flex items-center gap-0.5 sm:gap-2">
            <span className="text-[8px] sm:text-sm font-bold text-white uppercase font-mono tracking-wide leading-none">LUCKY 🐾</span>
            <span className="bg-blue-600/80 text-white text-[6.5px] sm:text-[9px] px-0.5 sm:px-1.5 py-0.5 rounded border border-blue-400 font-bold leading-none">N.{playerLevel}</span>
          </div>
        </div>

        {/* Health Bar */}
        <div className="flex flex-col w-14 xs:w-20 sm:w-36 md:w-44">
          <div className="flex justify-between items-center text-[6.5px] sm:text-[10px] text-emerald-400 font-bold mb-0.5 font-mono leading-none">
            <span className="flex items-center gap-0.5">
              <Heart className="fill-emerald-400 w-2 h-2 sm:w-2.5 sm:h-2.5" />
              <span className="hidden min-[400px]:inline ml-0.5">ENERGIA</span>
            </span>
            <span>{playerHp}/{playerMaxHp}</span>
          </div>
          <div className="w-full h-1 sm:h-3 bg-slate-950 border border-slate-700/80 rounded-sm overflow-hidden p-[1px]">
            <div
              className="h-full bg-emerald-500 rounded-sm transition-all duration-300"
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Inventory & Medals */}
      <div className="flex items-center gap-0.5 sm:gap-4">
        {/* Potions Box */}
        <button
          onClick={onUsePotion}
          disabled={pocoes === 0 || playerHp >= playerMaxHp}
          className={`flex items-center gap-0.5 sm:gap-2 px-1 sm:px-2.5 py-0.5 sm:py-1.5 rounded border select-none font-mono transition-all min-w-[48px] min-h-[48px] sm:min-w-0 sm:min-h-0 justify-center ${
            pocoes > 0 && playerHp < playerMaxHp
              ? 'bg-emerald-950/60 border-emerald-500 hover:bg-emerald-900/80 hover:scale-105 active:scale-95 cursor-pointer text-white'
              : 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed'
          }`}
          title="Usar Poção de Cura (Tecla P)"
        >
          <Backpack className="text-emerald-400 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          <span className="text-[7px] sm:text-[10px] font-bold hidden md:inline">POÇÕES:</span>
          <span className={`text-[8.5px] sm:text-xs font-bold ${pocoes > 0 ? 'text-emerald-400 animate-pulse' : ''}`}>{pocoes}</span>
        </button>

        {/* Medals Display */}
        <div className="flex items-center gap-0.5 sm:gap-2 bg-purple-950/40 border border-purple-500/80 px-1 sm:px-2.5 py-0.5 sm:py-1.5 rounded text-white font-mono min-h-[48px] sm:min-h-0 justify-center">
          <Trophy className="text-yellow-400 fill-yellow-400/20 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          <span className="text-[7px] sm:text-[10px] font-bold text-purple-300 hidden md:inline">MEDALHAS:</span>
          <span className="text-[8.5px] sm:text-xs font-bold text-yellow-400">{playerCristais}/7</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 border-l border-slate-800 pl-1 sm:pl-3">
          {/* Enlarge / Fill Screen Button for horizontal tablets */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`px-1.5 sm:px-2.5 py-1 rounded border transition-all cursor-pointer min-w-[42px] min-h-[42px] sm:min-w-0 sm:min-h-0 flex items-center justify-center gap-1 text-[7.5px] sm:text-[9.5px] font-bold font-mono active:scale-95 ${
                isFullscreen
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : 'bg-indigo-950/70 hover:bg-indigo-900 border-indigo-500/70 text-indigo-200 hover:text-white'
              }`}
              title={isFullscreen ? 'Ajustar proporção' : 'Aumentar e Preencher Toda a Tela (Horizontal)'}
            >
              {isFullscreen ? (
                <Minimize className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              ) : (
                <Maximize className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
              <span className="hidden xs:inline">{isFullscreen ? 'AJUSTAR' : 'PREENCHER'}</span>
            </button>
          )}

          {/* Pause / ESC button for tablet and mobile */}
          {onOpenPause && (
            <button
              type="button"
              onClick={onOpenPause}
              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 rounded border border-amber-500/60 transition-colors cursor-pointer min-w-[42px] min-h-[42px] sm:min-w-0 sm:min-h-0 flex items-center justify-center gap-1 text-[7.5px] sm:text-[9.5px] font-bold font-mono active:scale-95"
              title="Pausar jogo / Menu de Opções (ESC)"
            >
              <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-300" />
              <span className="hidden xs:inline">ESC</span>
            </button>
          )}

          {/* Audio toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 sm:p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            title={soundMuted ? 'Ativar som' : 'Mudar som'}
          >
            {soundMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          </button>

          {/* Help guides */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="p-1.5 sm:p-1.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 rounded border border-slate-700 transition-colors cursor-pointer min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            title="Ver controles e dicas"
          >
            <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
