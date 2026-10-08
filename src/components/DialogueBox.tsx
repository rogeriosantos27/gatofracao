/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Som } from '../sound';
import { NPC } from '../types';

interface DialogueBoxProps {
  npc: NPC;
  onComplete: () => void;
  onClose: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ npc, onComplete, onClose }) => {
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const lines = npc.dialogue;
  const currentLine = lines[currentLineIdx] || '';

  // Typewriter effect
  useEffect(() => {
    let accumulated = '';
    setDisplayedText('');
    setIsTyping(true);
    const chars = Array.from(currentLine);
    let charIdx = 0;

    // Initial chime beep for opening dialogue screen
    Som.playTone(600, 'sine', 0.05, 0.08);

    const timer = setInterval(() => {
      if (charIdx < chars.length) {
        accumulated += chars[charIdx] || '';
        setDisplayedText(accumulated);
        charIdx++;

        // Subdued blips for retro talking voice
        if (charIdx % 2 === 0) {
          const randFreq = 350 + Math.random() * 80;
          Som.playTone(randFreq, 'sine', 0.02, 0.03);
        }
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 25); // Speed: 25ms per char

    timerRef.current = timer;

    return () => {
      clearInterval(timer);
    };
  }, [currentLineIdx, currentLine]);

  const handleAdvance = () => {
    Som.click();
    if (isTyping) {
      // Complete current sentence instantly
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText(currentLine);
      setIsTyping(false);
    } else {
      // Advance to next page or finish
      if (currentLineIdx < lines.length - 1) {
        setCurrentLineIdx((prev) => prev + 1);
      } else {
        // Dialogue complete!
        onComplete();
      }
    }
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleAdvance();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, currentLineIdx]);

  return (
    <div 
      className="absolute inset-x-0 bottom-1 sm:bottom-4 flex justify-center px-2 sm:px-4 z-40 select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        paddingLeft: 'calc(0.5rem + env(safe-area-inset-left, 0px))',
        paddingRight: 'calc(0.5rem + env(safe-area-inset-right, 0px))',
        paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div 
        onClick={handleAdvance}
        className="w-full max-w-[720px] bg-slate-950/95 border-2 sm:border-4 border-red-700 rounded shadow-2xl p-2.5 sm:p-4 flex flex-col justify-between cursor-pointer border-double ring-2 sm:ring-4 ring-amber-500/80 transition-all hover:brightness-105"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Dialogue header / NPC name */}
        <div className="flex items-center justify-between border-b-2 border-red-900 pb-2 mb-2">
          <div className="flex items-center gap-2.5">
            {/* Micro NPC Avatar simulation */}
            <div 
              className="w-4 h-4 rounded-full border border-amber-500 animate-pulse"
              style={{ backgroundColor: npc.color }}
            />
            <span className="text-[10px] sm:text-xs font-extrabold text-amber-400 font-mono tracking-wider uppercase">
              {npc.nome}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-[9px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded border border-slate-800 hover:border-rose-800 bg-slate-900/60 font-mono transition-colors"
          >
            ✕ Fechar
          </button>
        </div>

        {/* Dialogue main text */}
        <div className="text-slate-200 text-[10px] sm:text-xs leading-relaxed min-h-[44px] sm:min-h-[48px] font-mono whitespace-normal py-1 pr-2 break-words">
          {displayedText}
          {isTyping && <span className="inline-block w-2 h-3.5 bg-amber-400 ml-1 animate-ping" />}
        </div>

        {/* Legend footer with prominent touch button */}
        <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-900 text-[8px] sm:text-[10px] font-mono">
          <button 
            type="button"
            className="text-slate-500 hover:text-slate-300 px-2 py-1.5 rounded transition-colors" 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            [ESC] Sair
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAdvance();
            }}
            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black px-3.5 sm:px-5 py-1.5 sm:py-2 rounded border border-amber-300 shadow flex items-center gap-1.5 transition-transform"
            style={{ minHeight: '36px' }}
          >
            {isTyping ? '⏩ Pular' : currentLineIdx < lines.length - 1 ? 'Avançar ➔' : 'Desafiar Campeão! ⚔️'}
          </button>
        </div>
      </div>
    </div>
  );
};
