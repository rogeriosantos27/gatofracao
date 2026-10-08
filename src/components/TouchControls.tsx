/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Backpack, Sparkles, Pause } from 'lucide-react';

interface TouchControlsProps {
  onDirectionChange: (dir: { x: number; y: number } | null) => void;
  onActionPress: () => void;
  onActionRelease: () => void;
  onPotionPress: () => void;
  onPausePress?: () => void;
  potionsCount: number;
  playerHp: number;
  playerMaxHp: number;
  disabled?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onDirectionChange,
  onActionPress,
  onActionRelease,
  onPotionPress,
  onPausePress,
  potionsCount,
  playerHp,
  playerMaxHp,
  disabled = false,
}) => {
  const dpadRef = useRef<HTMLDivElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeDir, setActiveDir] = useState<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const [isAPressed, setIsAPressed] = useState(false);
  const [isBPressed, setIsBPressed] = useState(false);

  // Stop all simulated directions safely
  const stopDpad = useCallback(() => {
    activePointerIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    setActiveDir({ up: false, down: false, left: false, right: false });
    onDirectionChange(null);
  }, [onDirectionChange]);

  // Process coordinates relative to D-Pad center
  const processPointerPos = useCallback(
    (clientX: number, clientY: number) => {
      const el = dpadRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = rect.width / 2 - 8;

      if (dist < 10) {
        // Deadzone in the exact center
        setKnobPos({ x: 0, y: 0 });
        setActiveDir({ up: false, down: false, left: false, right: false });
        onDirectionChange(null);
        return;
      }

      // Clamp knob movement to visual outer ring
      const clampedDist = Math.min(dist, maxRadius);
      const normalX = dx / dist;
      const normalY = dy / dist;
      const knobX = normalX * clampedDist;
      const knobY = normalY * clampedDist;
      setKnobPos({ x: knobX, y: knobY });

      // Determine directions with generous directional cones (allows smooth 8-way navigation)
      const threshold = 0.35;
      const up = normalY < -threshold;
      const down = normalY > threshold;
      const left = normalX < -threshold;
      const right = normalX > threshold;

      setActiveDir({ up, down, left, right });

      // Normalize movement vector for physics loop
      let vx = 0;
      let vy = 0;
      if (left) vx -= 1;
      if (right) vx += 1;
      if (up) vy -= 1;
      if (down) vy += 1;

      if (vx !== 0 || vy !== 0) {
        const len = Math.hypot(vx, vy);
        onDirectionChange({ x: vx / len, y: vy / len });
      } else {
        onDirectionChange(null);
      }
    },
    [onDirectionChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (activePointerIdRef.current !== null) return;
    activePointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if setPointerCapture fails on certain mobile webviews
    }
    processPointerPos(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    processPointerPos(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current === e.pointerId) {
      e.preventDefault();
      e.stopPropagation();
      stopDpad();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current === e.pointerId) {
      stopDpad();
    }
  };

  // Clean up if unmounted or disabled
  useEffect(() => {
    if (disabled) {
      stopDpad();
    }
  }, [disabled, stopDpad]);

  return (
    <div
      className={`absolute inset-x-0 bottom-0 pointer-events-none z-40 select-none transition-opacity duration-300 ${
        disabled ? 'opacity-20' : 'opacity-100'
      }`}
      style={{
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'calc(0.75rem + env(safe-area-inset-left, 0px))',
        paddingRight: 'calc(0.75rem + env(safe-area-inset-right, 0px))',
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="relative w-full flex items-end justify-between px-1">
        {/* ================= D-PAD / THUMBPAD CONTROLLER ================= */}
        <div
          ref={dpadRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/75 border-2 border-amber-500/40 backdrop-blur-md pointer-events-auto flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.8)] touch-none cursor-pointer"
          style={{ touchAction: 'none', WebkitTouchCallout: 'none', userSelect: 'none' }}
        >
          {/* Subtle Directional Cross Guide in Background */}
          <div className="absolute inset-x-7 top-1/2 -translate-y-1/2 h-8 bg-slate-900/60 rounded border border-white/5 pointer-events-none" />
          <div className="absolute inset-y-7 left-1/2 -translate-x-1/2 w-8 bg-slate-900/60 rounded border border-white/5 pointer-events-none" />

          {/* UP Arrow Indicator */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded flex items-center justify-center font-bold text-xs transition-colors pointer-events-none ${
              activeDir.up ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg' : 'text-amber-400/70'
            }`}
          >
            ▲
          </div>

          {/* DOWN Arrow Indicator */}
          <div
            className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded flex items-center justify-center font-bold text-xs transition-colors pointer-events-none ${
              activeDir.down ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg' : 'text-amber-400/70'
            }`}
          >
            ▼
          </div>

          {/* LEFT Arrow Indicator */}
          <div
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded flex items-center justify-center font-bold text-xs transition-colors pointer-events-none ${
              activeDir.left ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg' : 'text-amber-400/70'
            }`}
          >
            ◀
          </div>

          {/* RIGHT Arrow Indicator */}
          <div
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded flex items-center justify-center font-bold text-xs transition-colors pointer-events-none ${
              activeDir.right ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg' : 'text-amber-400/70'
            }`}
          >
            ▶
          </div>

          {/* Dynamic Joystick Knob / Thumb Puck */}
          <div
            className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white/80 shadow-[0_4px_12px_rgba(245,158,11,0.6)] pointer-events-none flex items-center justify-center transition-transform"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: activePointerIdRef.current ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <div className="w-4 h-4 rounded-full bg-slate-950/40 border border-white/40" />
          </div>
        </div>

        {/* ================= ESC / PAUSE QUICK BUTTON ================= */}
        <div className="flex flex-col items-center mb-1 pointer-events-auto">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onPausePress) onPausePress();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onPausePress) onPausePress();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-900/95 border-2 border-amber-500/80 hover:border-amber-400 text-amber-300 font-mono text-[8px] sm:text-[9.5px] font-black shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center gap-1.5 active:scale-90 transition-transform cursor-pointer touch-none"
            style={{ touchAction: 'none', WebkitTouchCallout: 'none', userSelect: 'none', minHeight: '36px' }}
            title="Pausar jogo / Menu (ESC)"
          >
            <Pause size={11} className="fill-amber-300" />
            <span>ESC / PAUSA</span>
          </button>
        </div>

        {/* ================= ACTION BUTTONS A and B ================= */}
        <div
          className="flex items-center gap-3 sm:gap-4 pointer-events-auto"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* BUTTON B: HEAL / POTION */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBPressed(true);
                onPotionPress();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBPressed(true);
                onPotionPress();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBPressed(false);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBPressed(false);
              }}
              onPointerCancel={() => setIsBPressed(false)}
              onTouchCancel={() => setIsBPressed(false)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              disabled={potionsCount === 0 || playerHp >= playerMaxHp}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-xl transition-all cursor-pointer select-none touch-none ${
                isBPressed ? 'scale-90 brightness-125 ring-2 ring-emerald-400' : 'active:scale-95'
              } ${
                potionsCount > 0 && playerHp < playerMaxHp
                  ? 'bg-emerald-700/80 border-emerald-400 text-white shadow-emerald-950/60'
                  : 'bg-slate-900/70 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
              style={{ touchAction: 'none', WebkitTouchCallout: 'none', userSelect: 'none' }}
            >
              {/* Potion remaining badge */}
              {potionsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border border-slate-950 shadow">
                  {potionsCount}
                </span>
              )}
              <span className="text-base sm:text-lg font-black tracking-wider leading-none">B</span>
              <span className="text-[7.5px] font-bold tracking-tight uppercase leading-none mt-0.5">CURAR</span>
            </button>
          </div>

          {/* BUTTON A: INTERACT / ACTION */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAPressed(true);
                onActionPress();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAPressed(true);
                onActionPress();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAPressed(false);
                onActionRelease();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAPressed(false);
                onActionRelease();
              }}
              onPointerCancel={() => {
                setIsAPressed(false);
                onActionRelease();
              }}
              onTouchCancel={() => {
                setIsAPressed(false);
                onActionRelease();
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-600 to-rose-700 border-2 border-amber-400 text-white flex flex-col items-center justify-center shadow-[0_6px_20px_rgba(225,29,72,0.6)] transition-all cursor-pointer select-none touch-none ${
                isAPressed ? 'scale-90 brightness-125 ring-4 ring-amber-400/60' : 'hover:scale-105 active:scale-95'
              }`}
              style={{ touchAction: 'none', WebkitTouchCallout: 'none', userSelect: 'none' }}
            >
              <span className="text-xl sm:text-2xl font-black drop-shadow tracking-wider leading-none">A</span>
              <span className="text-[8px] sm:text-[9px] font-bold tracking-tight uppercase leading-none mt-1 text-amber-200">
                AÇÃO
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
