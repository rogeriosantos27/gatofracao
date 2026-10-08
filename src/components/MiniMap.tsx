/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Player, NPC, Chest } from '../types';
import { MapManager } from '../map';
import { Som } from '../sound';

interface MiniMapProps {
  player: Player;
  npcs: NPC[];
  chests: Chest[];
  mapManager: MapManager;
}

export const MiniMap: React.FC<MiniMapProps> = ({ player, npcs, chests, mapManager }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [collapsed, setCollapsed] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouch(touch);
      if (window.innerWidth < 640) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallScreen = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

  const mapWidth = isSmallScreen ? 96 : isTablet ? 116 : 132;
  const mapHeight = isSmallScreen ? 72 : isTablet ? 87 : 99;
  const containerWidthClass = isSmallScreen ? 'w-[110px]' : isTablet ? 'w-[130px]' : 'w-[146px]';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = mapManager.COLS;
    const rows = mapManager.ROWS;
    const w = mapWidth;
    const h = mapHeight;
    const cellW = w / cols;
    const cellH = h / rows;

    // 1. Clear background
    ctx.fillStyle = '#0f172a'; // Slate background for border
    ctx.fillRect(0, 0, w, h);

    // 2. Draw map biomes
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let color = '#22c55e'; // default grass

        // Rivers and lakes
        const isVerticalRiver = (c === 18 || c === 19) && (r > 2 && r < 40);
        const isHorizontalRiver = (r === 14 || r === 15) && (c > 2 && c < 55);
        const isLago = (r >= 3 && r <= 10) && (c >= 47 && c <= 54);

        if (isLago || isVerticalRiver || isHorizontalRiver) {
          const isBridge = (isHorizontalRiver && (c === 6 || c === 14 || c === 22 || c === 30 || c === 38 || c === 46 || c === 52)) ||
                           (isVerticalRiver && (r === 6 || r === 12 || r === 18 || r === 24 || r === 30 || r === 36));
          color = isBridge ? '#854d0e' : '#2563eb';
        } else if (r < 12) {
          if (c < 20) {
            color = '#e2e8f0'; // Snow
          } else {
            color = '#15803d'; // Bamboo / dark grass
          }
        } else if (r > 30 && c < 18) {
          color = '#eab308'; // Desert
        } else if (r >= 30 && c >= 35) {
          color = '#b91c1c'; // Lava
        } else {
          color = '#4ade80'; // Light grass / village
        }

        ctx.fillStyle = color;
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
      }
    }

    // 3. Draw Chests (Baus)
    chests.forEach((chest) => {
      const mc = Math.floor(chest.x / mapManager.TILE_SIZE);
      const mr = Math.floor(chest.y / mapManager.TILE_SIZE);
      
      ctx.fillStyle = chest.aberto ? '#475569' : '#f59e0b'; // Gold for unopened, gray for opened
      ctx.beginPath();
      ctx.arc((mc + 0.5) * cellW, (mr + 0.5) * cellH, isSmallScreen ? 1.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Draw NPCs
    npcs.forEach((npc) => {
      const mc = Math.floor(npc.x / mapManager.TILE_SIZE);
      const mr = Math.floor(npc.y / mapManager.TILE_SIZE);

      // Blinking circle for NPC
      const isBlink = Math.sin(Date.now() / 150) > 0;
      ctx.fillStyle = isBlink ? '#c084fc' : npc.color;
      ctx.beginPath();
      ctx.arc((mc + 0.5) * cellW, (mr + 0.5) * cellH, isSmallScreen ? 2.5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw tiny outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // 5. Draw Player
    const pCol = Math.floor(player.x / mapManager.TILE_SIZE);
    const pRow = Math.floor(player.y / mapManager.TILE_SIZE);
    
    // Pulse ring
    const pulseRadius = (isSmallScreen ? 2.5 : 4) + Math.abs(Math.sin(Date.now() / 200)) * (isSmallScreen ? 1.5 : 3);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = isSmallScreen ? 0.5 : 1;
    ctx.beginPath();
    ctx.arc((pCol + 0.5) * cellW, (pRow + 0.5) * cellH, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Player dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc((pCol + 0.5) * cellW, (pRow + 0.5) * cellH, isSmallScreen ? 2 : 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    ctx.stroke();

  }, [player, npcs, chests, mapManager, mapWidth, mapHeight, isSmallScreen]);

  if (collapsed) {
    return (
      <button
        onClick={() => {
          Som.click();
          setCollapsed(false);
        }}
        className="absolute top-12 sm:top-18 right-2 sm:right-4 bg-slate-950/95 hover:bg-slate-900 border-2 border-red-700 rounded px-2.5 py-1.5 shadow-2xl flex items-center gap-1 select-none pointer-events-auto z-20 text-[8px] sm:text-[9px] font-mono font-bold text-amber-400 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        style={{
          marginTop: 'env(safe-area-inset-top, 0px)',
          marginRight: 'env(safe-area-inset-right, 0px)',
          minWidth: '48px',
          minHeight: '48px',
        }}
      >
        🗺️ MAPA
      </button>
    );
  }

  return (
    <div 
      className={`absolute top-12 sm:top-18 right-2 sm:right-4 bg-slate-950/95 border-2 border-red-700/80 rounded p-1 sm:p-1.5 shadow-2xl flex flex-col items-center gap-1 sm:gap-1.5 select-none pointer-events-auto z-20 ${containerWidthClass}`}
      style={{
        marginTop: 'env(safe-area-inset-top, 0px)',
        marginRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div className="flex items-center justify-between w-full px-1 gap-1">
        <span className="text-[6.5px] sm:text-[7.5px] font-extrabold text-amber-400 font-mono tracking-wider sm:tracking-widest truncate">MAPA ILHA</span>
        <button
          onClick={() => {
            Som.click();
            setCollapsed(true);
          }}
          className="text-[8px] sm:text-[9px] text-red-400 hover:text-red-300 font-bold cursor-pointer font-mono p-1 min-w-[24px] min-h-[24px] flex items-center justify-center"
        >
          [X]
        </button>
      </div>
      
      <div className="relative border border-slate-800 rounded overflow-hidden bg-slate-950">
        <canvas
          ref={canvasRef}
          width={mapWidth}
          height={mapHeight}
          className="block image-render-pixelated"
        />
      </div>

      <div className="flex gap-1 text-[5px] sm:text-[6px] font-mono text-slate-300 leading-none scale-[0.95] sm:scale-100">
        <div className="flex items-center gap-0.5">
          <span className="w-1 h-1 bg-white rounded-full inline-block border border-black" /> Você
        </div>
        <div className="flex items-center gap-0.5">
          <span className="w-1 h-1 bg-purple-400 rounded-full inline-block" /> Champ
        </div>
        <div className="flex items-center gap-0.5 animate-pulse">
          <span className="w-1 h-1 bg-amber-500 rounded-full inline-block" /> Baú
        </div>
      </div>
    </div>
  );
};
