/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Camera } from './types';

export class MapManager {
  public readonly COLS = 60;
  public readonly ROWS = 45;
  public readonly TILE_SIZE = 48;

  public mapaMatriz: number[][] = [];
  
  // Procedural canvas textures
  private texturas: {
    gramaClara: HTMLCanvasElement | null;
    gramaEscura: HTMLCanvasElement | null;
    areia: HTMLCanvasElement | null;
    agua: HTMLCanvasElement | null;
    ponte: HTMLCanvasElement | null;
    neve: HTMLCanvasElement | null;
    lava: HTMLCanvasElement | null;
    terra: HTMLCanvasElement | null;
    pedra: HTMLCanvasElement | null;
    palacioAgua: HTMLCanvasElement | null;
    cidadeSkate: HTMLCanvasElement | null;
  } = {
    gramaClara: null,
    gramaEscura: null,
    areia: null,
    agua: null,
    ponte: null,
    neve: null,
    lava: null,
    terra: null,
    pedra: null,
    palacioAgua: null,
    cidadeSkate: null,
  };

  constructor() {
    this.gerarMundo();
  }

  // Determine biome based on coordinate
  public getBiomeAt(r: number, c: number): string {
    if (r < 14) {
      if (c < 19) return 'NEVE';
      if (c >= 19 && c <= 41) return 'BAMBU';
      return 'LAGO_LOTUS';
    } else if (r >= 14 && r < 29) {
      if (c < 19) return 'PALACIO_AGUA';
      if (c >= 19 && c <= 41) return 'VILA'; // Hub
      return 'CIDADE_SKATE';
    } else { // r >= 29
      if (c < 19) return 'DESERTO';
      if (c >= 19 && c <= 41) return 'VILA'; // South center is also town
      return 'LAVA';
    }
  }

  public gerarMundo(): void {
    this.gerarTexturasPixelArt();

    this.mapaMatriz = [];
    for (let r = 0; r < this.ROWS; r++) {
      const linha: number[] = [];
      for (let c = 0; c < this.COLS; c++) {
        // Rivers and lakes setup with beautiful, curved organic flows
        const rOffset = Math.sin(r * 0.35) * 1.5;
        const cOffset = Math.sin(c * 0.3) * 1.2;

        // Ensure NPC tiles are never mountains or water
        const isNPCTile = (r === 16 && c === 30) || // Totem Guia
                          (r === 6 && c === 30) || // Tengu
                          (r === 6 && c === 8)  || // Fukuro
                          (r === 6 && c === 50) || // Yoichi
                          (r === 22 && c === 8) || // Otohime
                          (r === 22 && c === 51) || // Tanuki
                          (r === 37 && c === 12) || // Kijimuna
                          (r === 37 && c === 45);   // Oni

        // Proximity checks to ensure clear space around critical items (NPCs and Chests)
        const isNearNPC = 
          (Math.abs(r - 16) + Math.abs(c - 30) <= 2) || // Totem Guia
          (Math.abs(r - 6) + Math.abs(c - 30) <= 3) || // Tengu
          (Math.abs(r - 6) + Math.abs(c - 8) <= 3)  || // Fukuro (Mestre da Escalada)
          (Math.abs(r - 6) + Math.abs(c - 50) <= 3) || // Yoichi
          (Math.abs(r - 22) + Math.abs(c - 8) <= 3) || // Otohime
          (Math.abs(r - 22) + Math.abs(c - 51) <= 3) || // Tanuki
          (Math.abs(r - 37) + Math.abs(c - 12) <= 3) || // Kijimuna
          (Math.abs(r - 37) + Math.abs(c - 45) <= 3);   // Oni

        const isNearChest =
          (Math.abs(r - 12) + Math.abs(c - 15) <= 1) ||
          (Math.abs(r - 5) + Math.abs(c - 25) <= 1) ||
          (Math.abs(r - 25) + Math.abs(c - 5) <= 1) ||
          (Math.abs(r - 25) + Math.abs(c - 35) <= 1);

        const isVerticalRiverLeft = Math.abs(c - (19.0 + rOffset)) < 1.0;
        const isVerticalRiverRight = Math.abs(c - (41.0 + rOffset)) < 1.0;
        const isHorizontalRiverTop = Math.abs(r - (14.0 + cOffset)) < 1.0;
        const isHorizontalRiverBottom = Math.abs(r - (29.0 + cOffset)) < 1.0;

        let isVerticalRiver = (isVerticalRiverLeft || isVerticalRiverRight) && (r > 1 && r < this.ROWS - 1) && !isNPCTile;
        let isHorizontalRiver = (isHorizontalRiverTop || isHorizontalRiverBottom) && (c > 1 && c < this.COLS - 1) && !isNPCTile;

        // Yoichi (Arquearia) is at col 50, row 6.
        // We create an organic wooden pier / bridge from the left bank (c=46) through cols 47, 48, 49
        // connecting to a beautiful grass/wood deck island at cols 50-52, rows 5-7.
        const isYoichiIsland = (r >= 5 && r <= 7 && c >= 50 && c <= 52);
        const isYoichiBridge = (r === 6 && c >= 47 && c <= 49);

        // The lake around Lotus region, leaving a beautiful clearing for Yoichi's deck
        let isLago = (r >= 3 && r <= 10) && (c >= 47 && c <= 54) && !isYoichiIsland && !isYoichiBridge && !isNPCTile;

        // Natural mountains with organic variation
        let isMontanha = false;
        
        // Northern snow mountains
        if (r < 12 && c < 19 && !isNPCTile) {
          const distCentro = Math.abs(c - 8) + Math.abs(r - 5);
          const noise = Math.sin(r * 1.2) * Math.cos(c * 1.2) * 1.5;
          if (distCentro + noise < 6.5) isMontanha = true;
        }

        // Southern desert mountains
        if (r > 30 && c < 17 && !isNPCTile) {
          const distCentro = Math.abs(c - 8) + Math.abs(r - 37);
          const noise = Math.sin(r * 1.0) * Math.cos(c * 1.0) * 1.2;
          if (distCentro + noise < 5.5) isMontanha = true;
        }

        // Center mountains (separating regions with passes)
        if (r >= 22 && r <= 29 && c >= 24 && c <= 38 && !isNPCTile) {
          const distCentro = Math.abs(c - 31) + Math.abs(r - 25.5);
          const noise = Math.sin(r * 1.5) * Math.cos(c * 1.5) * 1.0;
          if (distCentro + noise < 5.0 && c !== 30 && r !== 25) {
            isMontanha = true;
          }
        }

        // Path crossing checks - where the path intercepts a river, we place a bridge
        const isPathCrossing = 
          (c === 30 && r >= 2 && r <= 42) ||
          (r === 18 && c >= 4 && c <= 55) ||
          (c === 8 && r >= 4 && r <= 24) ||
          (c === 12 && r >= 16 && r <= 41) ||
          (c === 50 && r >= 4 && r <= 24) ||
          (c === 45 && r >= 16 && r <= 41);

        // SYSTEMATIC COLLISION OVERRIDES:
        // 1. Any tile near an NPC or a Chest must be clear of all mountains, rivers, and lakes.
        if (isNearNPC || isNearChest) {
          isMontanha = false;
          isLago = false;
          isVerticalRiver = false;
          isHorizontalRiver = false;
        }

        // 2. Any main pathway crossing must never be blocked by mountains.
        if (isPathCrossing) {
          isMontanha = false;
        }

        // Red bridges like in Champion Island, aligned perfectly with curved rivers and walkways
        let isBridge = isYoichiBridge;
        if ((isVerticalRiver || isHorizontalRiver) && isPathCrossing) {
          isBridge = true;
        }

        // Procedural walking paths to connect areas
        let isPath = false;
        if (!isBridge && !isVerticalRiver && !isHorizontalRiver && !isLago && !isMontanha && !isYoichiIsland) {
          if (isPathCrossing) isPath = true;
        }

        // Select tile index
        if (isLago) {
          linha.push(2); // Water
        } else if (isBridge) {
          linha.push(1); // Bridge
        } else if (isMontanha) {
          linha.push(3); // Mountain
        } else if (isVerticalRiver || isHorizontalRiver) {
          linha.push(2); // Water
        } else if (isPath) {
          linha.push(4); // Dirt Walking Path
        } else if (isYoichiIsland) {
          linha.push(4); // Dirt Walking Path / Wooden Decking
        } else {
          linha.push(0); // Regular ground
        }
      }
      this.mapaMatriz.push(linha);
    }
  }

  private gerarTexturasPixelArt(): void {
    if (typeof document === 'undefined') return;
    const sz = 64;

    // Helper to draw shaded organic pixel clusters (pixel-art aesthetic)
    const drawPixelArtCluster = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, mainColor: string, darkColor: string, lightColor: string) => {
      ctx.fillStyle = darkColor;
      ctx.fillRect(x, y + 1, w, h);
      ctx.fillStyle = mainColor;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = lightColor;
      ctx.fillRect(x, y, Math.ceil(w / 2), Math.ceil(h / 2));
    };

    // 1. Grama Clara (Vila) - Premium textured lush green grass with flowers, clover clumps and tufts
    const canvasGC = document.createElement('canvas');
    canvasGC.width = sz; canvasGC.height = sz;
    const ctxGC = canvasGC.getContext('2d')!;
    ctxGC.fillStyle = '#689f38'; // Shaded grass base
    ctxGC.fillRect(0, 0, sz, sz);
    ctxGC.fillStyle = '#7cb342'; // Lighter green
    ctxGC.fillRect(0, 0, sz, sz - 4);
    ctxGC.fillStyle = '#8bc34a'; // Main vibrant light green
    for (let y = 0; y < sz; y += 8) {
      for (let x = 0; x < sz; x += 8) {
        if ((x + y) % 3 === 0) {
          ctxGC.fillRect(x, y, 6, 6);
        }
      }
    }
    // Grass Tufts
    for (let i = 0; i < 15; i++) {
      const px = Math.floor(Math.random() * (sz - 8)) + 4;
      const py = Math.floor(Math.random() * (sz - 8)) + 4;
      ctxGC.fillStyle = '#558b2f'; // Shadow green
      ctxGC.fillRect(px - 1, py + 1, 2, 4);
      ctxGC.fillRect(px + 1, py + 2, 2, 3);
      ctxGC.fillStyle = '#aed581'; // Bright blade highlight
      ctxGC.fillRect(px, py, 1, 4);
      ctxGC.fillRect(px + 2, py + 1, 1, 3);
      ctxGC.fillRect(px - 2, py + 2, 1, 2);
    }
    // Detailed Clovers
    for (let i = 0; i < 4; i++) {
      const px = Math.floor(Math.random() * (sz - 10)) + 4;
      const py = Math.floor(Math.random() * (sz - 10)) + 4;
      ctxGC.fillStyle = '#33691e'; // Dark shadow
      ctxGC.fillRect(px, py + 1, 4, 4);
      ctxGC.fillStyle = '#9ccc65'; // Clover green
      ctxGC.fillRect(px - 1, py, 2, 2);
      ctxGC.fillRect(px + 2, py, 2, 2);
      ctxGC.fillRect(px, py + 2, 2, 2);
    }
    // Colorful Petaled Wildflowers
    const flowerColors = ['#f43f5e', '#ec4899', '#3b82f6', '#facc15', '#a855f7'];
    for (let i = 0; i < 5; i++) {
      const px = Math.floor(Math.random() * (sz - 8)) + 4;
      const py = Math.floor(Math.random() * (sz - 8)) + 4;
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      // Petal cross
      ctxGC.fillStyle = '#000000'; // border
      ctxGC.fillRect(px - 2, py - 1, 5, 3);
      ctxGC.fillRect(px - 1, py - 2, 3, 5);
      ctxGC.fillStyle = color;
      ctxGC.fillRect(px - 1, py, 3, 1);
      ctxGC.fillRect(px, py - 1, 1, 3);
      ctxGC.fillStyle = '#ffffff'; // White core
      ctxGC.fillRect(px, py, 1, 1);
    }
    this.texturas.gramaClara = canvasGC;

    // 2. Grama Escura (Bambu Forest) - Mossy deep rich emerald forest floor
    const canvasGE = document.createElement('canvas');
    canvasGE.width = sz; canvasGE.height = sz;
    const ctxGE = canvasGE.getContext('2d')!;
    ctxGE.fillStyle = '#0d5302'; // Deepest shadow base
    ctxGE.fillRect(0, 0, sz, sz);
    ctxGE.fillStyle = '#1b5e20'; // Base dark emerald
    ctxGE.fillRect(0, 0, sz, sz - 2);
    // Mossy patterns
    ctxGE.fillStyle = '#2e7d32';
    for (let i = 0; i < 12; i++) {
      const mx = Math.floor(Math.random() * (sz - 16));
      const my = Math.floor(Math.random() * (sz - 16));
      ctxGE.fillRect(mx, my, 12, 8);
      ctxGE.fillStyle = '#388e3c';
      ctxGE.fillRect(mx + 2, my + 2, 8, 4);
    }
    // Fallen leaves & bamboo shoots
    ctxGE.fillStyle = '#81c784'; // Leaf highlights
    for (let i = 0; i < 8; i++) {
      const lx = Math.floor(Math.random() * (sz - 6)) + 2;
      const ly = Math.floor(Math.random() * (sz - 6)) + 2;
      ctxGE.fillRect(lx, ly, 3, 1);
      ctxGE.fillRect(lx + 1, ly + 1, 1, 2);
    }
    // Mossy Rocks
    for (let i = 0; i < 3; i++) {
      const rx = Math.floor(Math.random() * (sz - 10)) + 2;
      const ry = Math.floor(Math.random() * (sz - 10)) + 2;
      ctxGE.fillStyle = '#455a64'; // Slate grey stone
      ctxGE.fillRect(rx, ry, 6, 4);
      ctxGE.fillStyle = '#4caf50'; // Green moss patch on top
      ctxGE.fillRect(rx + 1, ry - 1, 4, 2);
    }
    this.texturas.gramaEscura = canvasGE;

    // 3. Areia (Deserto) - Golden dunes with smooth wind ripples and sunlit sparkles
    const canvasAreia = document.createElement('canvas');
    canvasAreia.width = sz; canvasAreia.height = sz;
    const ctxA = canvasAreia.getContext('2d')!;
    ctxA.fillStyle = '#e5c07b'; // Shaded sand base
    ctxA.fillRect(0, 0, sz, sz);
    ctxA.fillStyle = '#f5d79c'; // Lighter desert sand
    for (let y = 0; y < sz; y += 4) {
      ctxA.fillRect(0, y, sz, 3);
    }
    ctxA.fillStyle = '#fbe9e7'; // Glitter highlights
    for (let i = 0; i < 15; i++) {
      const px = Math.floor(Math.random() * sz);
      const py = Math.floor(Math.random() * sz);
      ctxA.fillRect(px, py, 2, 2);
    }
    // Wavy dune wind patterns (Organic curve lines)
    ctxA.strokeStyle = '#d7a15c';
    ctxA.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const ry = 8 + i * 16;
      ctxA.beginPath();
      ctxA.moveTo(0, ry);
      ctxA.quadraticCurveTo(sz * 0.25, ry - 3, sz * 0.5, ry);
      ctxA.quadraticCurveTo(sz * 0.75, ry + 3, sz, ry);
      ctxA.stroke();
    }
    // Ancient parched earth cracks (subtle)
    ctxA.strokeStyle = 'rgba(141, 110, 99, 0.25)';
    ctxA.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      const cx = Math.floor(Math.random() * (sz - 20)) + 10;
      const cy = Math.floor(Math.random() * (sz - 20)) + 10;
      ctxA.beginPath();
      ctxA.moveTo(cx, cy);
      ctxA.lineTo(cx + 8, cy + 4);
      ctxA.lineTo(cx + 4, cy + 12);
      ctxA.moveTo(cx + 8, cy + 4);
      ctxA.lineTo(cx + 14, cy + 2);
      ctxA.stroke();
    }
    this.texturas.areia = canvasAreia;

    // 4. Terra (Caminhos) - Rich, weathered dirt with path gravel, cracks and steps
    const canvasTerra = document.createElement('canvas');
    canvasTerra.width = sz; canvasTerra.height = sz;
    const ctxT = canvasTerra.getContext('2d')!;
    ctxT.fillStyle = '#5d4037'; // Deep earth brown shadow
    ctxT.fillRect(0, 0, sz, sz);
    ctxT.fillStyle = '#8d6e63'; // Rich clay brown
    ctxT.fillRect(0, 0, sz, sz - 3);
    ctxT.fillStyle = '#a1887f'; // Lighter dirt paths
    for (let y = 0; y < sz; y += 8) {
      for (let x = 0; x < sz; x += 8) {
        if ((x + y) % 2 === 0) {
          ctxT.fillRect(x, y, 6, 6);
        }
      }
    }
    // Little embedded path pebbles
    const stoneColors = ['#4e342e', '#bcaaa4', '#795548'];
    for (let i = 0; i < 14; i++) {
      const px = Math.floor(Math.random() * (sz - 6)) + 3;
      const py = Math.floor(Math.random() * (sz - 6)) + 3;
      ctxT.fillStyle = '#3e2723'; // Drop shadow under pebble
      ctxT.fillRect(px, py + 1, 3, 3);
      ctxT.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];
      ctxT.fillRect(px, py, 3, 3);
      ctxT.fillStyle = '#efebe9'; // Highlight
      ctxT.fillRect(px, py, 1, 1);
    }
    // Winding footprints / wheel ruts
    ctxT.fillStyle = '#4e342e';
    for (let i = 0; i < 3; i++) {
      const ry = 10 + i * 18;
      ctxT.fillRect(4, ry, 10, 2);
      ctxT.fillRect(sz - 14, ry + 6, 8, 2);
    }
    this.texturas.terra = canvasTerra;

    // 5. Pedra (Montanhas) - Rich granite cliffs with fracture clefts
    const canvasPedra = document.createElement('canvas');
    canvasPedra.width = sz; canvasPedra.height = sz;
    const ctxP2 = canvasPedra.getContext('2d')!;
    ctxP2.fillStyle = '#455a64'; // Deep dark slate base
    ctxP2.fillRect(0, 0, sz, sz);
    ctxP2.fillStyle = '#78909c'; // Granite grey
    ctxP2.fillRect(0, 0, sz, sz - 4);
    ctxP2.fillStyle = '#90a4ae'; // Light gray panels
    for (let y = 0; y < sz; y += 16) {
      for (let x = 0; x < sz; x += 16) {
        ctxP2.fillRect(x + 1, y + 1, 14, 14);
      }
    }
    // Rock cracks and shadows
    ctxP2.fillStyle = '#37474f';
    for (let i = 0; i < 5; i++) {
      const cx = Math.floor(Math.random() * (sz - 12)) + 6;
      const cy = Math.floor(Math.random() * (sz - 12)) + 6;
      ctxP2.fillRect(cx, cy, 10, 2);
      ctxP2.fillRect(cx + 4, cy - 4, 2, 10);
    }
    // Glistening ore spots (silver mineral deposits)
    ctxP2.fillStyle = '#eceff1';
    for (let i = 0; i < 4; i++) {
      const ox = Math.floor(Math.random() * (sz - 8)) + 4;
      const oy = Math.floor(Math.random() * (sz - 8)) + 4;
      ctxP2.fillRect(ox, oy, 2, 2);
      ctxP2.fillRect(ox + 1, oy + 1, 1, 1);
    }
    this.texturas.pedra = canvasPedra;

    // 6. Ponte Vermelha Japonesa - Fully-textured lacquered wood bridge
    const canvasPonte = document.createElement('canvas');
    canvasPonte.width = sz; canvasPonte.height = sz;
    const ctxP = canvasPonte.getContext('2d')!;
    ctxP.fillStyle = '#1a0d00'; // Dark shadow under planks
    ctxP.fillRect(0, 0, sz, sz);
    ctxP.fillStyle = '#c62828'; // Rich red lacquer paint
    ctxP.fillRect(0, 0, sz, sz - 4);
    // Draw wood planks horizontally
    ctxP.fillStyle = '#b71c1c'; // Shading grooves
    for (let y = 0; y < sz; y += 12) {
      ctxP.fillRect(0, y, sz, 2);
      ctxP.fillStyle = '#d32f2f'; // Highlight upper edges
      ctxP.fillRect(0, y + 2, sz, 1);
    }
    // Side structural golden guards and metal studs
    ctxP.fillStyle = '#f9a825'; // Golden ornaments
    ctxP.fillRect(2, 0, 4, sz);
    ctxP.fillRect(sz - 6, 0, 4, sz);
    ctxP.fillStyle = '#ffffff'; // Shininess on gold
    for (let y = 4; y < sz; y += 16) {
      ctxP.fillRect(3, y, 2, 2);
      ctxP.fillRect(sz - 5, y + 8, 2, 2);
    }
    this.texturas.ponte = canvasPonte;

    // 7. Água Cintilante - Majestic turquoise ocean flow with wave foam & depth gradient
    const canvasAgua = document.createElement('canvas');
    canvasAgua.width = sz; canvasAgua.height = sz;
    const ctxW = canvasAgua.getContext('2d')!;
    ctxW.fillStyle = '#01579b'; // Deep azure water
    ctxW.fillRect(0, 0, sz, sz);
    ctxW.fillStyle = '#0288d1'; // Mid-blue water
    for (let y = 0; y < sz; y += 8) {
      ctxW.fillRect(0, y, sz, 6);
    }
    ctxW.fillStyle = '#03a9f4'; // Bright tropical cyan
    for (let y = 0; y < sz; y += 16) {
      for (let x = 0; x < sz; x += 16) {
        ctxW.fillRect(x, y, 10, 3);
      }
    }
    // Sparkly foam highlights
    ctxW.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 8; i++) {
      const sx = Math.floor(Math.random() * (sz - 8)) + 4;
      const sy = Math.floor(Math.random() * (sz - 8)) + 4;
      ctxW.fillRect(sx, sy, 4, 1);
      ctxW.fillRect(sx + 1, sy - 1, 2, 3);
    }
    this.texturas.agua = canvasAgua;

    // 8. Neve - Shaded fluffy snowdrifts with glowing ice patches
    const canvasNeve = document.createElement('canvas');
    canvasNeve.width = sz; canvasNeve.height = sz;
    const ctxN = canvasNeve.getContext('2d')!;
    ctxN.fillStyle = '#cbd5e1'; // Blueish snow shadow
    ctxN.fillRect(0, 0, sz, sz);
    ctxN.fillStyle = '#f1f5f9'; // Fluffy soft white snow
    ctxN.fillRect(0, 0, sz, sz - 3);
    ctxN.fillStyle = '#ffffff'; // Pure snow tops
    for (let y = 0; y < sz; y += 8) {
      for (let x = 0; x < sz; x += 8) {
        if ((x + y) % 3 !== 0) {
          ctxN.fillRect(x, y, 6, 6);
        }
      }
    }
    // Glistening ice stars
    ctxN.fillStyle = '#e0f2fe';
    for (let i = 0; i < 6; i++) {
      const px = Math.floor(Math.random() * (sz - 4)) + 2;
      const py = Math.floor(Math.random() * (sz - 4)) + 2;
      ctxN.fillRect(px - 1, py, 3, 1);
      ctxN.fillRect(px, py - 1, 1, 3);
      ctxN.fillStyle = '#ffffff';
      ctxN.fillRect(px, py, 1, 1);
    }
    // Subtle snowy dune curves
    ctxN.strokeStyle = '#94a3b8';
    ctxN.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const ry = 14 + i * 20;
      ctxN.beginPath();
      ctxN.moveTo(0, ry);
      ctxN.quadraticCurveTo(sz/2, ry - 3, sz, ry);
      ctxN.stroke();
    }
    this.texturas.neve = canvasNeve;

    // 9. Lava - Boiling obsidian magma with glowing convection vents
    const canvasLava = document.createElement('canvas');
    canvasLava.width = sz; canvasLava.height = sz;
    const ctxL = canvasLava.getContext('2d')!;
    ctxL.fillStyle = '#3e0606'; // Crusted black-red rock base
    ctxL.fillRect(0, 0, sz, sz);
    ctxL.fillStyle = '#9a0303'; // Burning red molten river
    ctxL.fillRect(0, 0, sz, sz - 2);
    // Flowing orange lava streams
    ctxL.fillStyle = '#ea580c';
    for (let i = 0; i < 4; i++) {
      const lx = Math.floor(Math.random() * (sz - 12)) + 2;
      const ly = Math.floor(Math.random() * (sz - 12)) + 2;
      ctxL.fillRect(lx, ly, 12, 6);
      ctxL.fillStyle = '#eab308'; // Glowing yellow hot spots
      ctxL.fillRect(lx + 3, ly + 1, 6, 4);
    }
    // Floating cooled obsidian crust pieces
    ctxL.fillStyle = '#1e0505';
    for (let i = 0; i < 5; i++) {
      const ox = Math.floor(Math.random() * (sz - 14)) + 4;
      const oy = Math.floor(Math.random() * (sz - 14)) + 4;
      ctxL.fillRect(ox, oy, 10, 4);
      ctxL.fillRect(ox + 2, oy - 1, 6, 6);
    }
    this.texturas.lava = canvasLava;

    // 10. Palacio de Água - Deep coral ocean floor with custom starfish impressions
    const canvasPA = document.createElement('canvas');
    canvasPA.width = sz; canvasPA.height = sz;
    const ctxPA = canvasPA.getContext('2d')!;
    ctxPA.fillStyle = '#004d40'; // Aquatic dark shadow
    ctxPA.fillRect(0, 0, sz, sz);
    ctxPA.fillStyle = '#006064'; // Deep marine teal floor
    ctxPA.fillRect(0, 0, sz, sz - 3);
    // Beautiful shell tile pattern grids
    ctxPA.strokeStyle = '#00838f';
    ctxPA.lineWidth = 1.5;
    for (let y = 0; y < sz; y += 16) {
      for (let x = 0; x < sz; x += 16) {
        ctxPA.strokeRect(x, y, 16, 16);
        // Little spiral shell engraving inside
        ctxPA.fillStyle = 'rgba(0,188,212,0.15)';
        ctxPA.fillRect(x + 4, y + 4, 8, 8);
      }
    }
    // Sparkling sea anemones
    ctxPA.fillStyle = '#26c6da';
    for (let i = 0; i < 6; i++) {
      const sx = Math.floor(Math.random() * (sz - 8)) + 4;
      const sy = Math.floor(Math.random() * (sz - 8)) + 4;
      ctxPA.fillRect(sx, sy, 3, 3);
      ctxPA.fillStyle = '#ffffff';
      ctxPA.fillRect(sx + 1, sy + 1, 1, 1);
    }
    this.texturas.palacioAgua = canvasPA;

    // 11. Cidade Skate - Graffiti-tagged asphalt slabs and curb cracks
    const canvasCS = document.createElement('canvas');
    canvasCS.width = sz; canvasCS.height = sz;
    const ctxCS = canvasCS.getContext('2d')!;
    ctxCS.fillStyle = '#1f2937'; // Shadow under curbs
    ctxCS.fillRect(0, 0, sz, sz);
    ctxCS.fillStyle = '#374151'; // Charcoal concrete road
    ctxCS.fillRect(0, 0, sz, sz - 3);
    ctxCS.fillStyle = '#4b5563'; // Lighter concrete tiles
    for (let y = 0; y < sz; y += 16) {
      for (let x = 0; x < sz; x += 16) {
        if ((x + y) % 32 === 0) {
          ctxCS.fillRect(x + 1, y + 1, 14, 14);
        }
      }
    }
    // Pavement curb lines
    ctxCS.strokeStyle = '#111827';
    ctxCS.lineWidth = 2;
    for (let i = 0; i < sz; i += 16) {
      ctxCS.beginPath();
      ctxCS.moveTo(0, i); ctxCS.lineTo(sz, i);
      ctxCS.stroke();
    }
    // Skate scratches & cracks
    ctxCS.strokeStyle = '#1f2937';
    ctxCS.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const cx = Math.floor(Math.random() * (sz - 12)) + 6;
      const cy = Math.floor(Math.random() * (sz - 12)) + 6;
      ctxCS.beginPath();
      ctxCS.moveTo(cx, cy);
      ctxCS.lineTo(cx + 6, cy + 3);
      ctxCS.lineTo(cx + 2, cy + 8);
      ctxCS.stroke();
    }
    // Tiny spray-paint graffiti speckles (rebel skate vibes!)
    const graffitiColors = ['#f43f5e', '#3b82f6', '#10b981', '#a855f7', '#eab308'];
    for (let i = 0; i < 2; i++) {
      const gx = Math.floor(Math.random() * (sz - 12)) + 6;
      const gy = Math.floor(Math.random() * (sz - 12)) + 6;
      ctxCS.fillStyle = graffitiColors[Math.floor(Math.random() * graffitiColors.length)];
      ctxCS.fillRect(gx, gy, 4, 3);
      ctxCS.fillRect(gx + 1, gy - 1, 2, 5);
    }
    this.texturas.cidadeSkate = canvasCS;
  }

  public verificarPassabilidade(x: number, y: number, largura: number, altura: number): boolean {
    const mapWidth = this.COLS * this.TILE_SIZE;
    const mapHeight = this.ROWS * this.TILE_SIZE;

    if (x < 0 || y < 0 || x + largura > mapWidth || y + altura > mapHeight) return false;

    const colInicio = Math.floor(x / this.TILE_SIZE);
    const colFim = Math.floor((x + largura) / this.TILE_SIZE);
    const rowInicio = Math.floor(y / this.TILE_SIZE);
    const rowFim = Math.floor((y + altura) / this.TILE_SIZE);

    for (let r = rowInicio; r <= rowFim; r++) {
      for (let c = colInicio; c <= colFim; c++) {
        if (!this.mapaMatriz[r]) return false;
        const tile = this.mapaMatriz[r][c];
        // Tile 2 is Water, Tile 3 is Mountain - both are impassable
        if (tile === 2 || tile === 3) {
          return false;
        }
      }
    }
    return true;
  }

  // Decorative element: Mountains with retro shading
  private desenharBlocoMontanha(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, bioma: string): void {
    ctx.save();
    
    // 1. Natural Dark Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, sz * 0.45, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Base Mountain Cliff Block
    let baseColor = '#558b2f';
    let shadeColor = '#1b5e20';
    let lightColor = '#a5d6a7';
    let accentColor = '#81c784';

    if (bioma === 'NEVE') {
      baseColor = '#cbd5e1';
      shadeColor = '#475569';
      lightColor = '#f1f5f9';
      accentColor = '#ffffff';
    } else if (bioma === 'DESERTO') {
      baseColor = '#bcaaa4';
      shadeColor = '#5d4037';
      lightColor = '#f5e0b3';
      accentColor = '#ffe0b2';
    } else if (bioma === 'LAVA') {
      baseColor = '#4e0d0d';
      shadeColor = '#1a0505';
      lightColor = '#d84315';
      accentColor = '#ff3d00';
    } else if (bioma === 'CIDADE_SKATE') {
      baseColor = '#475569';
      shadeColor = '#1e293b';
      lightColor = '#94a3b8';
      accentColor = '#cbd5e1';
    }

    // Outer rock silhouette
    ctx.fillStyle = shadeColor;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + sz - 2);
    ctx.lineTo(x + sz/2 - 8, y + 8);
    ctx.lineTo(x + sz/2 + 8, y + 8);
    ctx.lineTo(x + sz - 4, y + sz - 2);
    ctx.closePath();
    ctx.fill();

    // Front cliff plates
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + sz - 4);
    ctx.lineTo(x + sz/2 - 4, y + 12);
    ctx.lineTo(x + sz/2 + 10, y + 16);
    ctx.lineTo(x + sz - 10, y + sz - 4);
    ctx.closePath();
    ctx.fill();

    // Sunlit left highlights (organic facets)
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + sz - 4);
    ctx.lineTo(x + sz/2 - 4, y + 12);
    ctx.lineTo(x + sz/2 + 2, y + 14);
    ctx.lineTo(x + sz/2 - 4, y + sz/2);
    ctx.closePath();
    ctx.fill();

    // Detailed rock fissures and cracks
    ctx.strokeStyle = shadeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + sz/2 + 4, y + 15);
    ctx.lineTo(x + sz/2 - 2, y + sz/2 + 4);
    ctx.lineTo(x + sz/2 + 6, y + sz - 8);
    ctx.stroke();

    // Biome Specific Peak Caps
    if (bioma === 'NEVE') {
      // Snowy mountain cap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x + sz/2 - 6, y + 11);
      ctx.lineTo(x + sz/2 + 6, y + 11);
      ctx.lineTo(x + sz/2 + 14, y + 24);
      ctx.lineTo(x + sz/2 + 4, y + 20);
      ctx.lineTo(x + sz/2, y + 28);
      ctx.lineTo(x + sz/2 - 8, y + 22);
      ctx.lineTo(x + sz/2 - 14, y + 24);
      ctx.closePath();
      ctx.fill();
    } else if (bioma === 'LAVA') {
      // Magma cracks
      ctx.fillStyle = accentColor;
      ctx.fillRect(x + sz/2 - 1, y + 22, 3, 10);
      ctx.fillRect(x + sz/2 + 2, y + 36, 4, 3);
    } else if (bioma === 'VILA' || bioma === 'BAMBU') {
      // Small climbing ivy vine
      ctx.fillStyle = '#33691e';
      ctx.fillRect(x + sz/2 - 12, y + sz/2, 4, 12);
      ctx.fillRect(x + sz/2 - 14, y + sz/2 + 6, 8, 4);
    }

    ctx.restore();
  }

  // Decorative element: Pine trees with wind sway and layered foliage
  private desenharPinheiro(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, comNeve = false): void {
    ctx.save();
    
    const time = Date.now() / 1000;
    const sway = Math.sin(time + x * 0.05) * 0.04;

    // Center anchor for the sway at the trunk base
    ctx.translate(x + sz/2, y + sz - 4);
    ctx.rotate(sway);
    ctx.translate(-(x + sz/2), -(y + sz - 4));

    // 1. Soft Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Trunk with wood lines
    ctx.fillStyle = '#3e2723'; // shadow trunk
    ctx.fillRect(x + sz / 2 - 4, y + sz - 15, 8, 12);
    ctx.fillStyle = '#5d4037'; // light trunk
    ctx.fillRect(x + sz / 2 - 2, y + sz - 15, 4, 12);

    // 3. Jagged Layered Pine Foliage
    const shadowC = comNeve ? '#475569' : '#1b5e20';
    const baseC = comNeve ? '#cbd5e1' : '#2e7d32';
    const lightC = comNeve ? '#ffffff' : '#81c784';

    // Layer 3 (Bottom Large Tier)
    ctx.fillStyle = shadowC;
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 32);
    ctx.lineTo(x + sz/2 - 18, y + sz - 14);
    ctx.lineTo(x + sz/2 + 18, y + sz - 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = baseC;
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 32);
    ctx.lineTo(x + sz/2 - 15, y + sz - 16);
    ctx.lineTo(x + sz/2 + 15, y + sz - 16);
    ctx.closePath();
    ctx.fill();

    // Layer 2 (Middle Tier)
    ctx.fillStyle = shadowC;
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 42);
    ctx.lineTo(x + sz/2 - 14, y + sz - 24);
    ctx.lineTo(x + sz/2 + 14, y + sz - 24);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = baseC;
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 42);
    ctx.lineTo(x + sz/2 - 12, y + sz - 26);
    ctx.lineTo(x + sz/2 + 12, y + sz - 26);
    ctx.closePath();
    ctx.fill();

    // Layer 1 (Top Tier)
    ctx.fillStyle = shadowC;
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 50);
    ctx.lineTo(x + sz/2 - 10, y + sz - 34);
    ctx.lineTo(x + sz/2 + 10, y + sz - 34);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = baseC;
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 50);
    ctx.lineTo(x + sz/2 - 8, y + sz - 36);
    ctx.lineTo(x + sz/2 + 8, y + sz - 36);
    ctx.closePath();
    ctx.fill();

    // Foliage sun highlights
    ctx.fillStyle = lightC;
    ctx.fillRect(x + sz/2 - 2, y + sz - 48, 4, 3);
    ctx.fillRect(x + sz/2 - 3, y + sz - 40, 6, 2);
    ctx.fillRect(x + sz/2 - 4, y + sz - 30, 8, 2);

    ctx.restore();
  }

  // Decorative element: Prickly Desert Cactus with pink flower
  private desenharCacto(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    
    const time = Date.now() / 1500;
    const sway = Math.sin(time) * 0.02;
    ctx.translate(x + sz/2, y + sz - 4);
    ctx.rotate(sway);
    ctx.translate(-(x + sz/2), -(y + sz - 4));

    // 1. Soft Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 6, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Main Trunk with shaded ribs
    ctx.fillStyle = '#1b5e20'; // shadow rib
    ctx.fillRect(x + sz / 2 - 5, y + 8, 10, sz - 14);
    ctx.fillStyle = '#2e7d32'; // main green
    ctx.fillRect(x + sz / 2 - 3, y + 8, 6, sz - 14);
    ctx.fillStyle = '#4caf50'; // highlight rib
    ctx.fillRect(x + sz / 2 - 2, y + 8, 2, sz - 14);

    // 3. Left arm
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(x + sz / 2 - 13, y + 20, 9, 4);
    ctx.fillRect(x + sz / 2 - 13, y + 12, 4, 10);
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(x + sz / 2 - 12, y + 21, 7, 2);
    ctx.fillRect(x + sz / 2 - 12, y + 13, 2, 8);

    // 4. Right arm
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(x + sz / 2 + 4, y + 28, 9, 4);
    ctx.fillRect(x + sz / 2 + 9, y + 20, 4, 10);
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(x + sz / 2 + 4, y + 29, 7, 2);
    ctx.fillRect(x + sz / 2 + 10, y + 21, 2, 8);

    // 5. White pixel spikes (prickles)
    ctx.fillStyle = '#efebe9';
    // main body needles
    ctx.fillRect(x + sz/2 - 7, y + 14, 1, 2);
    ctx.fillRect(x + sz/2 + 6, y + 18, 1, 2);
    ctx.fillRect(x + sz/2 - 7, y + 28, 1, 2);
    ctx.fillRect(x + sz/2 + 6, y + 32, 1, 2);
    // left arm needles
    ctx.fillRect(x + sz/2 - 15, y + 14, 1, 2);
    // right arm needles
    ctx.fillRect(x + sz/2 + 14, y + 22, 1, 2);

    // 6. Beautiful pink cactus flower on top
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(x + sz/2 - 3, y + 4, 6, 4);
    ctx.fillStyle = '#f8bbd0';
    ctx.fillRect(x + sz/2 - 1, y + 3, 2, 2);

    ctx.restore();
  }

  // Decorative element: Ornate Shinto Torii gate with authentic pixel-art framing
  private desenharTorii(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();

    // 1. Double Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 13, y + sz - 3, 8, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(x + sz - 13, y + sz - 3, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Thick scarlet supporting columns (Pillars)
    ctx.fillStyle = '#810b0b'; // deepest shadow
    ctx.fillRect(x + 9, y + 8, 8, sz - 8);
    ctx.fillRect(x + sz - 17, y + 8, 8, sz - 8);

    ctx.fillStyle = '#b71c1c'; // main scarlet red
    ctx.fillRect(x + 10, y + 8, 6, sz - 8);
    ctx.fillRect(x + sz - 16, y + 8, 6, sz - 8);

    ctx.fillStyle = '#e53935'; // highlight
    ctx.fillRect(x + 10, y + 8, 2, sz - 8);
    ctx.fillRect(x + sz - 16, y + 8, 2, sz - 8);

    // 3. Black Column Foundations (Stone shoes)
    ctx.fillStyle = '#374151';
    ctx.fillRect(x + 8, y + sz - 6, 10, 6);
    ctx.fillRect(x + sz - 18, y + sz - 6, 10, 6);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 9, y + sz - 6, 3, 2);
    ctx.fillRect(x + sz - 17, y + sz - 6, 3, 2);

    // 4. Double Horizontal tie beams (Nuki wood bar)
    ctx.fillStyle = '#810b0b';
    ctx.fillRect(x + 4, y + 16, sz - 8, 5);
    ctx.fillStyle = '#b71c1c';
    ctx.fillRect(x + 4, y + 17, sz - 8, 3);

    // 5. Grand top curved beam (Kasagi tile roof)
    ctx.fillStyle = '#111827'; // Dark tile black
    ctx.fillRect(x - 2, y + 6, sz + 4, 6);
    // curved lintel ears
    ctx.fillRect(x - 4, y + 4, 3, 4);
    ctx.fillRect(x + sz + 1, y + 4, 3, 4);

    // Gold shrine medallion (Amulet) at the center of the bar
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + sz/2 - 4, y + 12, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + sz/2 - 2, y + 14, 2, 2);

    ctx.restore();
  }

  // Decorative element: Floating shaded lotus flowers
  private desenharLotus(ctx: CanvasRenderingContext2D, x: number, y: number, fase: number): void {
    ctx.save();
    const time = Date.now() / 1000;
    const osc = Math.sin(time + fase) * 2.5;
    
    // 1. Underwater lily pad shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + 24, y + 26 + osc, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Green Lily pad leaf
    ctx.fillStyle = '#1b5e20'; // shadow green
    ctx.beginPath();
    ctx.ellipse(x + 24, y + 24 + osc, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2e7d32'; // light green
    ctx.beginPath();
    ctx.ellipse(x + 23, y + 23 + osc, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // V-cut out in lily pad (classic look)
    ctx.fillStyle = '#0288d1'; // matches water color
    ctx.beginPath();
    ctx.moveTo(x + 24, y + 24 + osc);
    ctx.lineTo(x + 32, y + 21 + osc);
    ctx.lineTo(x + 31, y + 27 + osc);
    ctx.closePath();
    ctx.fill();

    // 3. Shaded Pink Lotus Flower
    ctx.fillStyle = '#ad1457'; // Deep dark pink
    ctx.beginPath();
    ctx.arc(x + 20, y + 20 + osc, 4, 0, Math.PI * 2);
    ctx.arc(x + 28, y + 20 + osc, 4, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 17 + osc, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ec4899'; // Bright rose pink petals
    ctx.beginPath();
    ctx.arc(x + 21, y + 19 + osc, 3, 0, Math.PI * 2);
    ctx.arc(x + 27, y + 19 + osc, 3, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 18 + osc, 4, 0, Math.PI * 2);
    ctx.fill();

    // Yellow pollen core
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x + 24, y + 19 + osc, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // Decorative element: Wind-swaying bamboo grove stalks with detailed nodes
  private desenharBambu(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();

    const time = Date.now() / 1200;
    const sway = Math.sin(time + x * 0.08) * 0.05;

    // Anchor at the base
    ctx.translate(x + sz/2, y + sz);
    ctx.rotate(sway);
    ctx.translate(-(x + sz/2), -(y + sz));

    // 1. Soft shadows under stems
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2 - 2, y + sz - 2, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Main Thick Bamboo Stalk
    ctx.fillStyle = '#0f3d0e'; // dark shading
    ctx.fillRect(x + sz/2 - 4, y, 8, sz);
    ctx.fillStyle = '#1b5e20'; // main stalk
    ctx.fillRect(x + sz/2 - 2, y, 5, sz);
    ctx.fillStyle = '#388e3c'; // light sheen
    ctx.fillRect(x + sz/2 - 1, y, 2, sz);

    // Render thick bamboo nodes (rings)
    ctx.fillStyle = '#0a2e0a';
    for (let j = 4; j < sz; j += 15) {
      ctx.fillRect(x + sz/2 - 5, y + j, 10, 3);
      ctx.fillStyle = '#81c784'; // highlight on node
      ctx.fillRect(x + sz/2 - 4, y + j + 1, 8, 1);
      ctx.fillStyle = '#0a2e0a';
    }

    // 3. Companion Thin Bamboo Stalk
    ctx.fillStyle = '#0f3d0e';
    ctx.fillRect(x + sz/2 + 6, y + 10, 4, sz - 10);
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(x + sz/2 + 7, y + 10, 2, sz - 10);
    for (let j = 18; j < sz; j += 12) {
      ctx.fillStyle = '#0a2e0a';
      ctx.fillRect(x + sz/2 + 5, y + j, 6, 2);
    }

    // 4. Overlapping Swaying Bamboo Leaves
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.ellipse(x + sz/2 + 12, y + 16, 9, 3, Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(x + sz/2 - 10, y + 32, 9, 3, -Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(x + sz/2 + 10, y + 42, 8, 2.5, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4caf50'; // Bright young leaves
    ctx.beginPath();
    ctx.ellipse(x + sz/2 + 11, y + 15, 7, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(x + sz/2 - 9, y + 31, 7, 2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Decorative element: Beautiful archery target easel stands
  private desenharAlvoArquearia(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    
    // 1. Soft shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Wooden stand (Tripod frame)
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz/2 - 6);
    ctx.lineTo(x + sz/2 - 10, y + sz - 5); // left leg
    ctx.moveTo(x + sz/2, y + sz/2 - 6);
    ctx.lineTo(x + sz/2 + 10, y + sz - 5); // right leg
    ctx.moveTo(x + sz/2, y + sz/2 - 6);
    ctx.lineTo(x + sz/2 + 2, y + sz - 3); // back support
    ctx.stroke();

    // Wood Grain Highlights
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + sz/2 - 8, y + sz - 8);
    ctx.lineTo(x + sz/2 - 4, y + sz/2 + 4);
    ctx.moveTo(x + sz/2 + 8, y + sz - 8);
    ctx.lineTo(x + sz/2 + 4, y + sz/2 + 4);
    ctx.stroke();

    // 3. Perfect Concentric Target Face
    const cx = x + sz/2;
    const cy = y + sz/2 - 8;

    // Outer Black Ring border
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();

    // White ring
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();

    // Blue ring
    ctx.fillStyle = '#0288d1';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    // Red Center Bullseye
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Golden arrow already shot in target!
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 8);
    ctx.lineTo(cx - 1, cy - 1);
    ctx.stroke();
    // Feathers
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 15, cy - 11, 2, 4);
    ctx.fillRect(cx - 17, cy - 9, 2, 4);

    ctx.restore();
  }

  // Decorative element: Branching Coral reefs and glowing shells
  private desenharCoral(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    
    const time = Date.now() / 1400;
    const wave = Math.sin(time) * 3;

    // 1. Soft Coral drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, 15, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Branching Coral structure (Pink/Purple)
    ctx.fillStyle = '#9c27b0'; // deep purple shadow
    ctx.fillRect(x + sz/2 - 4 + wave * 0.2, y + sz - 22, 8, 20);
    ctx.fillRect(x + sz/2 - 14 + wave * 0.2, y + sz - 15, 24, 4);
    ctx.fillRect(x + sz/2 - 14 + wave * 0.2, y + sz - 24, 4, 10);
    ctx.fillRect(x + sz/2 + 10 + wave * 0.2, y + sz - 20, 4, 8);

    ctx.fillStyle = '#e91e63'; // hot pink main
    ctx.fillRect(x + sz/2 - 2 + wave * 0.2, y + sz - 22, 5, 18);
    ctx.fillRect(x + sz/2 - 12 + wave * 0.2, y + sz - 14, 21, 2);
    ctx.fillRect(x + sz/2 - 13 + wave * 0.2, y + sz - 23, 2, 8);
    ctx.fillRect(x + sz/2 + 11 + wave * 0.2, y + sz - 19, 2, 6);

    // Glowing coral tip dots
    ctx.fillStyle = '#f8bbd0';
    ctx.fillRect(x + sz/2 - 3 + wave * 0.2, y + sz - 24, 2, 2);
    ctx.fillRect(x + sz/2 - 14 + wave * 0.2, y + sz - 25, 2, 2);
    ctx.fillRect(x + sz/2 + 11 + wave * 0.2, y + sz - 21, 2, 2);

    // 3. Spiral golden sea shell
    ctx.fillStyle = '#f9a825'; // dark gold
    ctx.fillRect(x + 8, y + sz - 10, 7, 5);
    ctx.fillStyle = '#fff59d'; // white gold
    ctx.fillRect(x + 9, y + sz - 9, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 9, y + sz - 9, 1, 1);

    ctx.restore();
  }

  // Decorative element: Skate pavement cones & grind obstacles
  private desenharObstaculoSkate(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    
    // 1. Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Grind Curb / Box
    ctx.fillStyle = '#1e293b'; // dark slate
    ctx.fillRect(x + 4, y + sz - 18, sz - 8, 14);
    ctx.fillStyle = '#475569'; // light concrete grey
    ctx.fillRect(x + 4, y + sz - 20, sz - 8, 4);

    // Metallic grind rail on top of curb
    ctx.fillStyle = '#94a3b8'; // shiny silver
    ctx.fillRect(x + 12, y + sz - 24, sz - 24, 3);
    ctx.fillStyle = '#cbd5e1'; // metal white highlight
    ctx.fillRect(x + 12, y + sz - 24, sz - 24, 1);
    // Rail supports
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 16, y + sz - 21, 3, 2);
    ctx.fillRect(x + sz - 19, y + sz - 21, 3, 2);

    // 3. Orange Traffic Cone
    const cx = x + 16;
    const cy = y + sz - 16;
    ctx.fillStyle = '#ea580c'; // cone base
    ctx.fillRect(cx - 6, cy + 10, 12, 2);
    // cone body
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 5, cy + 10);
    ctx.lineTo(cx + 5, cy + 10);
    ctx.closePath();
    ctx.fill();
    // white stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 2, cy + 4, 4, 2);

    ctx.restore();
  }

  // Decorative element: Ancient sandstone obelisks with hieroglyph cracks
  private desenharRuinaDeserto(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    
    // 1. Soft shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, sz * 0.4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Sandstone pillar base
    ctx.fillStyle = '#8d6e63'; // shadow brown
    ctx.fillRect(x + 8, y + sz - 8, sz - 16, 6);
    ctx.fillStyle = '#bcaaa4'; // clay pink
    ctx.fillRect(x + 10, y + sz - 8, sz - 20, 4);

    // 3. Ancient Obelisk column (tall sandstone brick)
    ctx.fillStyle = '#8d6e63'; // shadow
    ctx.fillRect(x + 12, y + 8, sz - 24, sz - 16);
    ctx.fillStyle = '#d7ccc8'; // main sandstone cream
    ctx.fillRect(x + 14, y + 10, sz - 28, sz - 18);
    ctx.fillStyle = '#efebe9'; // sun lit highlight
    ctx.fillRect(x + 14, y + 10, 4, sz - 18);

    // Crack and crumbling facets
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(x + 12, y + 16, 6, 2);
    ctx.fillRect(x + sz - 18, y + 26, 6, 2);
    // Hieroglyphic scratched markings
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x + sz/2 - 2, y + 18, 4, 1);
    ctx.fillRect(x + sz/2 - 1, y + 22, 2, 2);
    ctx.fillRect(x + sz/2 - 3, y + 28, 6, 1);

    ctx.restore();
  }

  // Decorative element: Lava volcanic fire crystals pulsing with magical light
  private desenharCristalLava(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    
    const time = Date.now() / 250;
    const pulse = Math.sin(time) * 0.12 + 1.0;
    const cx = x + sz/2;
    const cy = y + sz/2;

    // 1. Glowing outer halo
    const haloGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22 * pulse);
    haloGrad.addColorStop(0, 'rgba(255, 61, 0, 0.4)');
    haloGrad.addColorStop(0.5, 'rgba(230, 81, 0, 0.15)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 24 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // 2. Lava crystal double-faceted body
    ctx.fillStyle = '#dd2c00'; // darkest fire red shadow
    ctx.beginPath();
    ctx.moveTo(cx, cy - 18 * pulse);
    ctx.lineTo(cx - 10 * pulse, cy);
    ctx.lineTo(cx, cy + 18 * pulse);
    ctx.lineTo(cx + 10 * pulse, cy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff6d00'; // vibrant glowing orange
    ctx.beginPath();
    ctx.moveTo(cx, cy - 15 * pulse);
    ctx.lineTo(cx - 7 * pulse, cy);
    ctx.lineTo(cx, cy + 15 * pulse);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffd600'; // sun gold hot core
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10 * pulse);
    ctx.lineTo(cx - 3 * pulse, cy);
    ctx.lineTo(cx, cy + 10 * pulse);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Decorative element: Traditional Stone Lantern with bright warm core glow
  private desenharLanternaVila(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();

    // 1. Soft shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 3, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Stone base and stand post
    ctx.fillStyle = '#334155'; // deep slate shadow
    ctx.fillRect(x + sz/2 - 8, y + sz - 8, 16, 6);
    ctx.fillRect(x + sz/2 - 3, y + sz - 20, 6, 12);
    ctx.fillStyle = '#64748b'; // slate grey
    ctx.fillRect(x + sz/2 - 6, y + sz - 7, 12, 4);
    ctx.fillRect(x + sz/2 - 1, y + sz - 20, 3, 12);

    // 3. Hollow Light Cabin (stone windows)
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + sz/2 - 9, y + sz - 28, 18, 8);
    
    // Glowing warm amber lamp light
    const time = Date.now() / 150;
    const flicker = Math.sin(time) * 0.15 + 1.0;
    
    // Radial light circle
    const glow = ctx.createRadialGradient(x + sz/2, y + sz - 24, 1, x + sz/2, y + sz - 24, 10 * flicker);
    glow.addColorStop(0, 'rgba(255, 179, 0, 0.95)');
    glow.addColorStop(0.5, 'rgba(255, 143, 0, 0.45)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x + sz/2, y + sz - 24, 12 * flicker, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff8e1'; // glowing white center
    ctx.fillRect(x + sz/2 - 4, y + sz - 27, 8, 5);

    // 4. Black curved stone pagoda roof
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 34);
    ctx.lineTo(x + sz/2 - 11, y + sz - 28);
    ctx.lineTo(x + sz/2 + 11, y + sz - 28);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Decorative element: Adorable snowy snowman with twigs & wizard top-hat
  private desenharBonecoNeve(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();

    // 1. Soft Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Large Bottom snowball
    ctx.fillStyle = '#cbd5e1'; // shade blue snow
    ctx.beginPath();
    ctx.arc(x + sz/2, y + sz - 14, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff'; // white face
    ctx.beginPath();
    ctx.arc(x + sz/2 - 2, y + sz - 15, 9, 0, Math.PI * 2);
    ctx.fill();

    // Coal buttons on chest
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + sz/2 - 1, y + sz - 17, 2, 2);
    ctx.fillRect(x + sz/2 - 1, y + sz - 11, 2, 2);

    // 3. Left & Right twig arms
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + sz/2 - 8, y + sz - 22);
    ctx.lineTo(x + sz/2 - 19, y + sz - 26); // left arm
    ctx.moveTo(x + sz/2 + 8, y + sz - 22);
    ctx.lineTo(x + sz/2 + 19, y + sz - 25); // right arm
    ctx.stroke();

    // 4. Top Head snowball
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(x + sz/2, y + sz - 27, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + sz/2 - 1, y + sz - 28, 6, 0, Math.PI * 2);
    ctx.fill();

    // Face coal eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + sz/2 - 4, y + sz - 30, 2, 2);
    ctx.fillRect(x + sz/2 + 1, y + sz - 30, 2, 2);

    // Orange carrot nose
    ctx.fillStyle = '#ff6d00';
    ctx.beginPath();
    ctx.moveTo(x + sz/2 - 1, y + sz - 28);
    ctx.lineTo(x + sz/2 + 6, y + sz - 27);
    ctx.lineTo(x + sz/2 - 1, y + sz - 25);
    ctx.closePath();
    ctx.fill();

    // Red and white wool scarf
    ctx.fillStyle = '#d32f2f'; // red knit
    ctx.fillRect(x + sz/2 - 6, y + sz - 23, 12, 4);
    ctx.fillStyle = '#ffffff'; // white fringe
    ctx.fillRect(x + sz/2 + 2, y + sz - 23, 3, 6);

    // 5. Black wizard top hat
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + sz/2 - 9, y + sz - 35, 18, 3); // hat brim
    ctx.fillRect(x + sz/2 - 6, y + sz - 44, 12, 9); // crown
    ctx.fillStyle = '#d32f2f'; // red hat ribbon
    ctx.fillRect(x + sz/2 - 6, y + sz - 38, 12, 3);

    ctx.restore();
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (!this.texturas.gramaClara) {
      this.gerarMundo();
    }

    const sz = this.TILE_SIZE;
    ctx.imageSmoothingEnabled = false;

    const colInicio = Math.max(0, Math.floor(camera.x / sz));
    const colFim = Math.min(this.COLS, Math.ceil((camera.x + ctx.canvas.width) / sz));
    const rowInicio = Math.max(0, Math.floor(camera.y / sz));
    const rowFim = Math.min(this.ROWS, Math.ceil((camera.y + ctx.canvas.height) / sz));

    for (let r = rowInicio; r < rowFim; r++) {
      for (let c = colInicio; c < colFim; c++) {
        const posX = c * sz - camera.x;
        const posY = r * sz - camera.y;
        const tile = this.mapaMatriz[r][c];
        const biome = this.getBiomeAt(r, c);

        // 1. Mountains (Tile 3)
        if (tile === 3) {
          this.desenharBlocoMontanha(ctx, posX, posY, sz, biome);
          continue;
        }

        // 2. Bridges, paths, water, ground
        if (tile === 1) {
          if (this.texturas.ponte) {
            ctx.drawImage(this.texturas.ponte, posX, posY, sz, sz);
          }
        } else if (tile === 4) {
          if (this.texturas.terra) {
            ctx.drawImage(this.texturas.terra, posX, posY, sz, sz);
          }
        } else if (tile === 2) {
          // Check if there is a mountain cliff directly above this water tile to render a majestic waterfall!
          const hasCliffAbove = r > 0 && this.mapaMatriz[r - 1][c] === 3;
          if (hasCliffAbove && biome !== 'LAVA') {
            this.desenharCachoeira(ctx, posX, posY, sz);
          } else {
            if (biome === 'LAVA') {
              if (this.texturas.lava) ctx.drawImage(this.texturas.lava, posX, posY, sz, sz);
            } else {
              if (this.texturas.agua) ctx.drawImage(this.texturas.agua, posX, posY, sz, sz);
            }
          }
        } else {
          // Regular walking ground (Tile 0)
          if (biome === 'NEVE' && this.texturas.neve) {
            ctx.drawImage(this.texturas.neve, posX, posY, sz, sz);
          } else if (biome === 'DESERTO' && this.texturas.areia) {
            ctx.drawImage(this.texturas.areia, posX, posY, sz, sz);
          } else if (biome === 'LAVA' && this.texturas.lava) {
            ctx.drawImage(this.texturas.lava, posX, posY, sz, sz);
          } else if (biome === 'PALACIO_AGUA' && this.texturas.palacioAgua) {
            ctx.drawImage(this.texturas.palacioAgua, posX, posY, sz, sz);
          } else if (biome === 'CIDADE_SKATE' && this.texturas.cidadeSkate) {
            ctx.drawImage(this.texturas.cidadeSkate, posX, posY, sz, sz);
          } else if (biome === 'BAMBU' && this.texturas.gramaEscura) {
            ctx.drawImage(this.texturas.gramaEscura, posX, posY, sz, sz);
          } else if (biome === 'LAGO_LOTUS' && this.texturas.agua) {
            ctx.drawImage(this.texturas.agua, posX, posY, sz, sz);
          } else {
            // Default VILA
            if (this.texturas.gramaClara) {
              ctx.drawImage(this.texturas.gramaClara, posX, posY, sz, sz);
            }
          }
        }

        // 3. Render beautiful decorations (only on walkable, default tile 0)
        if (tile === 0) {
          // Hand-placed specific thematic sports equipment
          let handPlacedDrawn = false;
          if (r === 6 && c === 29) {
            this.desenharMesaPingPong(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          } else if (r === 5 && c === 29) {
            this.desenharTatamiSpectator(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          } else if (r === 6 && c === 7) {
            this.desenharParedeEscalada(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          } else if (r === 6 && c === 9) {
            this.desenharPlacaSinal(ctx, posX, posY, sz); // Reuse signpost as a "Snow Climb Sign"
            handPlacedDrawn = true;
          } else if (r === 6 && c === 51) {
            this.desenharSuporteBows(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          } else if (r === 6 && c === 49) {
            this.desenharAlvoArquearia(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          } else if (r === 21 && c === 8) {
            this.desenharRaiasNado(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          } else if (r === 22 && c === 7) {
            this.desenharSwimBlock(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          } else if (r === 22 && c === 50) {
            this.desenharRampaSkate(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          } else if (r === 22 && c === 52) {
            this.desenharObstaculoSkate(ctx, posX, posY, sz); // Reuse skate rails
            handPlacedDrawn = true;
          } else if (r === 37 && c === 13) {
            this.desenharHurdleCorrida(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          } else if (r === 37 && c === 44) {
            this.desenharLavaRugbyBall(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          } else if (r === 36 && c === 45) {
            this.desenharTraveRugby(ctx, posX, posY, sz);
            handPlacedDrawn = true;
          }

          if (handPlacedDrawn) continue;

          // Do not draw random procedural decorations near NPCs or Chests to prevent cluttering or blocking
          const isNearNPCDecor = 
            (Math.abs(r - 16) + Math.abs(c - 30) <= 2) || // Totem Guia
            (Math.abs(r - 6) + Math.abs(c - 30) <= 3) || // Tengu
            (Math.abs(r - 6) + Math.abs(c - 8) <= 3)  || // Fukuro (Mestre da Escalada)
            (Math.abs(r - 6) + Math.abs(c - 50) <= 3) || // Yoichi
            (Math.abs(r - 22) + Math.abs(c - 8) <= 3) || // Otohime
            (Math.abs(r - 22) + Math.abs(c - 51) <= 3) || // Tanuki
            (Math.abs(r - 37) + Math.abs(c - 12) <= 3) || // Kijimuna
            (Math.abs(r - 37) + Math.abs(c - 45) <= 3);   // Oni

          const isNearChestDecor =
            (Math.abs(r - 12) + Math.abs(c - 15) <= 1) ||
            (Math.abs(r - 5) + Math.abs(c - 25) <= 1) ||
            (Math.abs(r - 25) + Math.abs(c - 5) <= 1) ||
            (Math.abs(r - 25) + Math.abs(c - 35) <= 1);

          if (isNearNPCDecor || isNearChestDecor) continue;

          const hash = this.getHash(r, c);
          if (biome === 'NEVE') {
            if (hash < 0.14) {
              this.desenharPinheiro(ctx, posX, posY, sz, true);
            } else if (hash >= 0.14 && hash < 0.18) {
              this.desenharBonecoNeve(ctx, posX, posY, sz);
            } else if (hash >= 0.18 && hash < 0.21) {
              this.desenharFogueira(ctx, posX, posY, sz);
            }
          } else if (biome === 'BAMBU') {
            if (hash < 0.22) {
              this.desenharBambu(ctx, posX, posY, sz);
            } else if (hash >= 0.22 && hash < 0.25) {
              this.desenharPagoda(ctx, posX, posY, sz);
            }
          } else if (biome === 'LAGO_LOTUS') {
            if (hash < 0.08) {
              this.desenharLotus(ctx, posX, posY, r + c);
            } else if (hash >= 0.08 && hash < 0.11) {
              this.desenharAlvoArquearia(ctx, posX, posY, sz);
            } else if (hash >= 0.11 && hash < 0.17) {
              this.desenharCerejeira(ctx, posX, posY, sz);
            } else if (hash >= 0.17 && hash < 0.19) {
              this.desenharBarco(ctx, posX, posY, sz);
            }
          } else if (biome === 'PALACIO_AGUA') {
            if (hash < 0.14) {
              this.desenharCoral(ctx, posX, posY, sz);
            } else if (hash >= 0.14 && hash < 0.20) {
              this.desenharEstrelaDoMar(ctx, posX, posY, sz);
            }
          } else if (biome === 'CIDADE_SKATE') {
            if (hash < 0.12) {
              this.desenharObstaculoSkate(ctx, posX, posY, sz);
            }
          } else if (biome === 'DESERTO') {
            if (hash < 0.12) {
              this.desenharCacto(ctx, posX, posY, sz);
            } else if (hash >= 0.12 && hash < 0.17) {
              this.desenharRuinaDeserto(ctx, posX, posY, sz);
            } else if (hash >= 0.17 && hash < 0.20) {
              this.desenharFossil(ctx, posX, posY, sz);
            }
          } else if (biome === 'LAVA') {
            if (hash < 0.14) {
              this.desenharCristalLava(ctx, posX, posY, sz);
            }
          } else if (biome === 'VILA') {
            if (hash < 0.10) {
              this.desenharCerejeira(ctx, posX, posY, sz);
            } else if (hash >= 0.10 && hash < 0.16) {
              this.desenharPinheiro(ctx, posX, posY, sz, false);
            } else if (hash >= 0.16 && hash < 0.19) {
              this.desenharLanternaVila(ctx, posX, posY, sz);
            } else if (hash >= 0.19 && hash < 0.21) {
              this.desenharPoco(ctx, posX, posY, sz);
            } else if (hash >= 0.21 && hash < 0.23) {
              this.desenharPlacaSinal(ctx, posX, posY, sz);
            }
          }
        }

        // 4. Special iconic Torii Gate decoration (drawn on pathways / bridges / flatlands)
        if (tile === 0 || tile === 1 || tile === 4) {
          if (c === 30 && r === 15) this.desenharTorii(ctx, posX, posY, sz);
          if (c === 30 && r === 34) this.desenharTorii(ctx, posX, posY, sz);
        }
      }
    }

    // Beautiful dynamic drifting Cherry Blossom rain (Sakura breeze overlay)
    const time = Date.now() / 1500;
    ctx.fillStyle = 'rgba(244, 143, 177, 0.75)';
    for (let i = 0; i < 20; i++) {
      const px = ((camera.x * 0.08 + i * 160 + Math.sin(time + i) * 25) % (ctx.canvas.width + 100)) - 50;
      const py = ((camera.y * 0.08 + i * 95 + time * 40) % (ctx.canvas.height + 100)) - 50;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(time * 0.15 + i);
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Deterministic noise generator for decoration placement
  private getHash(r: number, c: number): number {
    const x = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453123;
    return x - Math.floor(x);
  }

  // Decorative element: Majestic Pink Cherry Blossom (Sakura) with falling petals
  private desenharCerejeira(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    
    const time = Date.now() / 1400;
    const sway = Math.sin(time + x * 0.04) * 0.04;

    // Anchor at base of trunk
    ctx.translate(x + sz/2, y + sz - 4);
    ctx.rotate(sway);
    ctx.translate(-(x + sz/2), -(y + sz - 4));

    // 1. Soft shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Thick Gnarled wood trunk and branches
    ctx.fillStyle = '#3e2723'; // shadow brown
    ctx.fillRect(x + sz/2 - 5, y + sz - 18, 10, 15);
    ctx.fillRect(x + sz/2 - 12, y + sz - 22, 20, 5); // left branch
    ctx.fillRect(x + sz/2 - 2, y + sz - 26, 6, 10); // top branch
    ctx.fillStyle = '#5d4037'; // main bark
    ctx.fillRect(x + sz/2 - 3, y + sz - 18, 6, 15);
    ctx.fillRect(x + sz/2 - 10, y + sz - 21, 16, 3);

    // 3. Layered fluffy pink blossom clouds (Foliage balls)
    const drawPetalCloud = (cx: number, cy: number, r: number) => {
      // shadow ball
      ctx.fillStyle = '#c2185b'; // deep hot pink
      ctx.beginPath();
      ctx.arc(cx, cy + 2, r, 0, Math.PI * 2);
      ctx.fill();
      // main rose pink ball
      ctx.fillStyle = '#f48fb1';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // highlight soft pink ball
      ctx.fillStyle = '#f8bbd0';
      ctx.beginPath();
      ctx.arc(cx - r*0.3, cy - r*0.3, r*0.6, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw three overlapping fluffy blossom clusters
    drawPetalCloud(x + sz/2 - 10, y + sz - 34, 14);
    drawPetalCloud(x + sz/2 + 10, y + sz - 30, 13);
    drawPetalCloud(x + sz/2, y + sz - 44, 16);

    ctx.restore();
  }

  // Decorative element: Miniature Shinto Shrine Pagoda (BAMBU biome)
  private desenharPagoda(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();

    // 1. Large Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, sz * 0.42, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Aged Stone Foundation
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 8, y + sz - 8, sz - 16, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 10, y + sz - 7, sz - 20, 3);

    // 3. Inner Sanctuary Columns and Golden amulet
    ctx.fillStyle = '#810b0b'; // dark wood
    ctx.fillRect(x + 14, y + sz - 22, 4, 14);
    ctx.fillRect(x + sz - 18, y + sz - 22, 4, 14);
    // golden amulet
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + sz/2 - 5, y + sz - 18, 10, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + sz/2 - 2, y + sz - 16, 3, 3);

    // 4. Curved Tiered Roof (Tile tiles)
    ctx.fillStyle = '#111827'; // Black roof slate
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 34);
    ctx.lineTo(x + 4, y + sz - 22);
    ctx.lineTo(x + sz - 4, y + sz - 22);
    ctx.closePath();
    ctx.fill();

    // Roof curls
    ctx.fillRect(x + 2, y + sz - 24, 3, 3);
    ctx.fillRect(x + sz - 5, y + sz - 24, 3, 3);

    // 5. Pagoda Spire (Gold finial)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + sz/2 - 2, y + sz - 42, 4, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + sz/2 - 1, y + sz - 42, 2, 2);

    ctx.restore();
  }

  // Decorative element: Rustic Village well with tiled roof (VILA biome)
  private desenharPoco(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();

    // 1. Base shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Stone Brick Base (Mossy cobblestones)
    ctx.fillStyle = '#374151'; // dark grout
    ctx.fillRect(x + 12, y + sz - 12, sz - 24, 12);
    ctx.fillStyle = '#64748b'; // stone face
    ctx.fillRect(x + 13, y + sz - 11, sz - 26, 10);
    // Draw tiny bricks and moss lines
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 18, y + sz - 7, 1, 5);
    ctx.fillRect(x + sz - 22, y + sz - 11, 1, 5);
    ctx.fillStyle = '#4caf50'; // Green moss patch
    ctx.fillRect(x + 24, y + sz - 12, 6, 2);

    // Well inner void hole
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 14, y + sz - 12, sz - 28, 2);

    // 3. Support Wooden columns & Winlass rope
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x + 14, y + sz - 28, 3, 16);
    ctx.fillRect(x + sz - 17, y + sz - 28, 3, 16);
    // wooden winch axle
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x + 17, y + sz - 24, sz - 34, 3);
    // hanging rope and wooden bucket
    ctx.strokeStyle = '#bcaaa4'; // rope
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + sz/2 + 2, y + sz - 21);
    ctx.lineTo(x + sz/2 + 2, y + sz - 14);
    ctx.stroke();
    ctx.fillStyle = '#8d6e63'; // bucket
    ctx.fillRect(x + sz/2, y + sz - 14, 5, 5);

    // 4. Elegant curved terracotta tile roof
    ctx.fillStyle = '#810b0b'; // terracotta shadow
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 35);
    ctx.lineTo(x + 8, y + sz - 28);
    ctx.lineTo(x + sz - 8, y + sz - 28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#b71c1c'; // terracotta tile red
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 35);
    ctx.lineTo(x + 10, y + sz - 28);
    ctx.lineTo(x + sz - 10, y + sz - 28);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Animated Cascading waterfall
  private desenharCachoeira(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    const time = Date.now() / 240;
    
    // 1. Water background column
    const grad = ctx.createLinearGradient(x, y, x + sz, y);
    grad.addColorStop(0, '#01579b'); // Deep blue
    grad.addColorStop(0.25, '#0288d1'); // Ocean blue
    grad.addColorStop(0.5, '#e0f2fe'); // White foam core
    grad.addColorStop(0.75, '#0288d1');
    grad.addColorStop(1, '#01579b');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, sz, sz);
    
    // 2. Shimmering animated foam flow lanes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let i = 0; i < 4; i++) {
      const foamY = ((time + i * 1.5) * 14) % sz;
      ctx.fillRect(x + 5, y + foamY, sz - 10, 3);
      // sparkle details
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 12 + (i * 10) % (sz - 24), y + foamY - 2, 2, 2);
    }
    
    // 3. Water vapor misty spray splashes at base of waterfall
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) {
      const splashX = x + Math.abs(Math.sin(time + i)) * (sz - 10) + 5;
      const size = 3 + Math.sin(time * 2.5 + i) * 2;
      ctx.beginPath();
      ctx.arc(splashX, y + sz - 2, Math.max(1, size), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Animated roaring bonfire campfire with burning logs
  private desenharFogueira(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    const time = Date.now() / 120;
    const flicker = Math.abs(Math.sin(time)) * 4;

    // 1. Soft shadow under camp circle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, 15, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Slate grey fireplace ring-stones
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(x + sz/2 - 12, y + sz - 8, 4, 0, Math.PI * 2);
    ctx.arc(x + sz/2 + 12, y + sz - 8, 4, 0, Math.PI * 2);
    ctx.arc(x + sz/2, y + sz - 4, 4, 0, Math.PI * 2);
    ctx.arc(x + sz/2, y + sz - 12, 4, 0, Math.PI * 2);
    ctx.arc(x + sz/2 - 8, y + sz - 11, 3.5, 0, Math.PI * 2);
    ctx.arc(x + sz/2 + 8, y + sz - 11, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Crossed fire wood logs
    ctx.strokeStyle = '#3e2723'; // dark brown log
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + sz/2 - 11, y + sz - 10);
    ctx.lineTo(x + sz/2 + 11, y + sz - 6);
    ctx.moveTo(x + sz/2 + 11, y + sz - 10);
    ctx.lineTo(x + sz/2 - 11, y + sz - 6);
    ctx.stroke();

    // 4. Burning flame core with sparks
    ctx.fillStyle = '#ff3d00'; // Fire deep red
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 24 - flicker);
    ctx.lineTo(x + sz/2 - 9, y + sz - 8);
    ctx.lineTo(x + sz/2 + 9, y + sz - 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff9100'; // Fire blazing gold
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 19 - flicker/2);
    ctx.lineTo(x + sz/2 - 6, y + sz - 8);
    ctx.lineTo(x + sz/2 + 6, y + sz - 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffea00'; // White gold hot center
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + sz - 14);
    ctx.lineTo(x + sz/2 - 3, y + sz - 8);
    ctx.lineTo(x + sz/2 + 3, y + sz - 8);
    ctx.closePath();
    ctx.fill();

    // Tiny rising sparks
    ctx.fillStyle = '#ffab00';
    ctx.fillRect(x + sz/2 - 6 + (time % 8), y + sz - 24 - (time % 12), 2, 2);
    ctx.fillRect(x + sz/2 + 4 - (time % 6), y + sz - 28 - (time % 10), 2, 2);

    ctx.restore();
  }

  // Scenic floating boat swaying on Lotus Lake
  private desenharBarco(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    const time = Date.now() / 1100;
    const sway = Math.sin(time) * 2.5;
    const tilt = Math.sin(time * 1.4) * 0.04;

    ctx.translate(x + sz/2, y + sz/2 + sway);
    ctx.rotate(tilt);
    ctx.translate(-(x + sz/2), -(y + sz/2 + sway));

    // 1. Water ripple underneath
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 12, 18, 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Wooden Hull
    ctx.fillStyle = '#5d4037'; // shadow hull
    ctx.beginPath();
    ctx.moveTo(x + 10, y + sz/2);
    ctx.lineTo(x + sz - 10, y + sz/2);
    ctx.lineTo(x + sz - 16, y + sz/2 + 10);
    ctx.lineTo(x + 16, y + sz/2 + 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#8d6e63'; // light wooden side
    ctx.beginPath();
    ctx.moveTo(x + 11, y + sz/2 + 1);
    ctx.lineTo(x + sz - 11, y + sz/2 + 1);
    ctx.lineTo(x + sz - 15, y + sz/2 + 8);
    ctx.lineTo(x + 15, y + sz/2 + 8);
    ctx.closePath();
    ctx.fill();

    // Deck bench seating
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x + 18, y + sz/2 + 1, sz - 36, 2);

    // 3. Wooden oars
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + sz/2 - 4, y + sz/2 - 3);
    ctx.lineTo(x + sz/2 - 16, y + sz/2 + 15);
    ctx.stroke();

    ctx.restore();
  }

  // Sea Star corals (Underwater ground details)
  private desenharEstrelaDoMar(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    const cx = x + sz/2;
    const cy = y + sz/2;
    
    // Five-pointed Starfish (Pink coral color)
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      ctx.lineTo(cx + Math.cos(angle) * 7, cy + Math.sin(angle) * 7);
      const innerAngle = angle + Math.PI / 5;
      ctx.lineTo(cx + Math.cos(innerAngle) * 3, cy + Math.sin(innerAngle) * 3);
    }
    ctx.closePath();
    ctx.fill();

    // Highlights on starfish arms
    ctx.fillStyle = '#ffe4e6';
    ctx.fillRect(cx - 1, cy - 1, 2, 2);

    ctx.restore();
  }

  // Wooden Signal Signboard
  private desenharPlacaSinal(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();

    // 1. Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 3, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Wooden support post
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x + sz/2 - 2, y + sz - 16, 4, 16);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x + sz/2 - 1, y + sz - 16, 2, 16);

    // 3. Carved sign board
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x + sz/2 - 13, y + sz - 25, 26, 11);
    ctx.fillStyle = '#8d6e63'; // lighter wood face
    ctx.fillRect(x + sz/2 - 12, y + sz - 24, 24, 9);

    // Decorative inscription lines
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x + sz/2 - 8, y + sz - 21, 16, 1.5);
    ctx.fillRect(x + sz/2 - 6, y + sz - 18, 12, 1.5);

    ctx.restore();
  }

  // Desert Bone Dinosaur Fossil
  private desenharFossil(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    const cx = x + sz/2;
    const cy = y + sz/2;

    // 1. Skull bone shadow (parched sand)
    ctx.fillStyle = 'rgba(141,110,99,0.3)';
    ctx.beginPath();
    ctx.arc(cx + 1, cy + 1, 7, 0, Math.PI * 2);
    ctx.fill();

    // 2. Bone white skull skull base
    ctx.fillStyle = '#efebe9';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    // snout block
    ctx.fillRect(cx - 3, cy + 2, 6, 4);

    // 3. Eye socket voids (cracked bone detail)
    ctx.fillStyle = '#5d4037'; // dark brown
    ctx.fillRect(cx - 3, cy - 2, 2, 3);
    ctx.fillRect(cx + 1, cy - 2, 2, 3);
    // nose ridge
    ctx.fillRect(cx - 1, cy + 3, 2, 2);

    ctx.restore();
  }

  // Custom: Ping Pong Table for Tengu
  private desenharMesaPingPong(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + 6, y + sz - 10, sz - 12, 6);

    // Legs
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 10, y + sz - 20, 3, 12);
    ctx.fillRect(x + sz - 13, y + sz - 20, 3, 12);
    ctx.fillRect(x + sz/2 - 1, y + sz - 20, 2, 12);

    // Table Board (Green canvas with white borders)
    ctx.fillStyle = '#065f46'; // Table body
    ctx.fillRect(x + 6, y + sz - 26, sz - 12, 7);
    ctx.fillStyle = '#10b981'; // Table top
    ctx.fillRect(x + 6, y + sz - 26, sz - 12, 4);

    // White center line and perimeter lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6, y + sz - 26, sz - 12, 1); // top edge
    ctx.fillRect(x + sz/2 - 0.5, y + sz - 26, 1, 4); // center line

    // Net
    ctx.fillStyle = '#94a3b8'; // metal posts
    ctx.fillRect(x + 4, y + sz - 29, 2, 5);
    ctx.fillRect(x + sz - 6, y + sz - 29, 2, 5);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; // white grid net
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + sz - 27);
    ctx.lineTo(x + sz - 5, y + sz - 27);
    ctx.stroke();

    // Rackets lying on the table
    ctx.fillStyle = '#ef4444'; // Red racket
    ctx.beginPath();
    ctx.arc(x + 14, y + sz - 24, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3b82f6'; // Blue racket
    ctx.beginPath();
    ctx.arc(x + sz - 14, y + sz - 24, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Small bouncing ping pong ball
    const time = Date.now() / 150;
    const ballY = y + sz - 26 - Math.abs(Math.sin(time)) * 8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + sz/2 + Math.cos(time) * 4, ballY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Custom: Climbing Wall for Fukuro
  private desenharParedeEscalada(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(x + 4, y + sz - 6, sz - 8, 4);

    // Wooden A-Frame board
    ctx.fillStyle = '#78350f'; // wood border shadow
    ctx.fillRect(x + 6, y + 4, sz - 12, sz - 8);
    ctx.fillStyle = '#b45309'; // wood panel face
    ctx.fillRect(x + 8, y + 6, sz - 16, sz - 12);

    // Colored Climbing holds (pegs)
    const holdColors = ['#ef4444', '#3b82f6', '#facc15', '#10b981', '#ec4899'];
    for (let i = 0; i < 6; i++) {
      const hx = x + 12 + (i * 7 + (i % 2 === 0 ? 3 : 0)) % (sz - 24);
      const hy = y + 10 + i * 5;
      ctx.fillStyle = holdColors[i % holdColors.length];
      ctx.beginPath();
      ctx.arc(hx, hy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Safety hanging rope
    ctx.strokeStyle = '#e2e8f0'; // white climbing rope
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + sz/2, y + 6);
    ctx.lineTo(x + sz/2 + Math.sin(Date.now() / 800) * 2, y + sz - 10);
    ctx.stroke();

    // Coiled rope pile at bottom
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(x + sz/2, y + sz - 8, 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Custom: Swim lane floating buoys for Otohime
  private desenharRaiasNado(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    // Lane line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + sz/2);
    ctx.lineTo(x + sz, y + sz/2);
    ctx.stroke();

    // Floating buoys (red/white alternating beads)
    for (let i = 4; i < sz; i += 12) {
      const bx = x + i;
      const isRed = (i / 12) % 2 === 0;

      // Buoy shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(bx, y + sz/2 + 2, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Colored bead
      ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';
      ctx.beginPath();
      ctx.arc(bx, y + sz/2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Small specular highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx - 1, y + sz/2 - 2, 1, 1);
    }
    ctx.restore();
  }

  // Custom: Swim block pedestal
  private desenharSwimBlock(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 10, y + sz - 12, sz - 20, 8);

    // Pedestal Base
    ctx.fillStyle = '#cbd5e1'; // grey plastic base
    ctx.fillRect(x + 12, y + sz - 18, sz - 24, 10);
    ctx.fillStyle = '#1e3a8a'; // blue panel highlight
    ctx.fillRect(x + 14, y + sz - 14, sz - 28, 4);

    // Starting block top slanted seat
    ctx.fillStyle = '#2563eb'; // blue fiberglass
    ctx.fillRect(x + 10, y + sz - 22, sz - 20, 4);
    ctx.fillStyle = '#ffffff'; // lane number 4 painted
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('4', x + sz/2, y + sz - 23);

    ctx.restore();
  }

  // Custom: Skateboard quarterpipe ramp for Tanuki
  private desenharRampaSkate(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + sz - 10, sz - 8, 6);

    // Ramp wood block
    ctx.fillStyle = '#4e342e'; // wood shade
    ctx.fillRect(x + 6, y + sz - 22, sz - 12, 14);

    // Slanted curved ramp top (light pine)
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + sz - 22);
    ctx.quadraticCurveTo(x + 12, y + sz - 14, x + sz - 6, y + sz - 8);
    ctx.lineTo(x + sz - 6, y + sz - 22);
    ctx.closePath();
    ctx.fill();

    // Metallic Coping pipe on the upper lip
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 4, y + sz - 24, 4, sz - 14); // Vertically oriented or horizontal
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 5, y + sz - 24, 2, sz - 14);

    // Skate stickers / graffiti on side
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(x + 12, y + sz - 14, 3, 3);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 18, y + sz - 12, 4, 2);

    ctx.restore();
  }

  // Custom: Archery Bow stand for Yoichi
  private desenharSuporteBows(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 4, 15, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vertical wooden frame posts
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x + 10, y + sz - 24, 3, 20);
    ctx.fillRect(x + sz - 13, y + sz - 24, 3, 20);
    // Horizontal shelf crossbars
    ctx.fillRect(x + 8, y + sz - 18, sz - 16, 3);
    ctx.fillRect(x + 8, y + sz - 10, sz - 16, 3);

    // Two archery bows (Yumi) resting on the shelf
    ctx.strokeStyle = '#b45309'; // reddish wood
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + sz/2, y + sz - 20, 10, -Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    // white strings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + sz/2 - 10, y + sz - 20);
    ctx.lineTo(x + sz/2 + 10, y + sz - 20);
    ctx.stroke();

    // A quiver of arrows sitting next to it
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x + sz - 10, y + sz - 14, 6, 11);
    ctx.fillStyle = '#ffffff'; // arrow feathers poking out
    ctx.fillRect(x + sz - 9, y + sz - 20, 1.5, 6);
    ctx.fillRect(x + sz - 6, y + sz - 18, 1.5, 4);

    ctx.restore();
  }

  // Custom: Athletic hurdle for Kijimuna
  private desenharHurdleCorrida(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    // Track lines (white chalk on red-brown ground)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(x, y + 2, sz, 2);
    ctx.fillRect(x, y + sz - 4, sz, 2);

    // Hurdle shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + sz/2, y + sz - 6, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hurdle legs (metal frame)
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 8, y + sz - 18, 2, 12);
    ctx.fillRect(x + sz - 10, y + sz - 18, 2, 12);
    ctx.fillRect(x + 6, y + sz - 8, 6, 2); // left foot
    ctx.fillRect(x + sz - 12, y + sz - 8, 6, 2); // right foot

    // Barricade board (yellow/black hash stripes)
    ctx.fillStyle = '#eab308'; // yellow base
    ctx.fillRect(x + 6, y + sz - 22, sz - 12, 5);

    ctx.fillStyle = '#0f172a'; // black hazard stripes
    ctx.fillRect(x + 10, y + sz - 22, 3, 5);
    ctx.fillRect(x + 18, y + sz - 22, 3, 5);
    ctx.fillRect(x + 26, y + sz - 22, 3, 5);
    ctx.fillRect(x + 34, y + sz - 22, 3, 5);

    ctx.restore();
  }

  // Custom: Volcanic Rugby Goalposts for Oni Supremo
  private desenharTraveRugby(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    // Giant shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x + 2, y + sz - 4, sz - 4, 4);

    // Left and Right Basalt stone columns extending high!
    ctx.fillStyle = '#1e293b'; // obsidian black
    ctx.fillRect(x + 6, y - 10, 8, sz + 10);
    ctx.fillRect(x + sz - 14, y - 10, 8, sz + 10);

    // Stone textures
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 6, y + 10, 8, 2);
    ctx.fillRect(x + sz - 14, y + 15, 8, 2);

    // Crossbar joining the two pillars
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 6, y + sz/2 - 6, sz - 12, 6);

    // Glowing orange/red lava line channels inside the pillars and crossbar!
    const pulse = Math.sin(Date.now() / 150) * 0.15 + 1.0;
    ctx.fillStyle = `rgba(249, 115, 22, ${0.7 * pulse})`; // lava orange glow
    ctx.fillRect(x + 9, y - 10, 2, sz + 10);
    ctx.fillRect(x + sz - 11, y - 10, 2, sz + 10);
    ctx.fillRect(x + 6, y + sz/2 - 4, sz - 12, 2);

    ctx.restore();
  }

  // Custom: Lava Rugby Ball
  private desenharLavaRugbyBall(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    const cx = x + sz/2;
    const cy = y + sz/2 + 2;

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rugby Ball (Oval with pointy ends)
    ctx.fillStyle = '#ea580c'; // magma orange
    ctx.beginPath();
    ctx.ellipse(cx, cy, 9, 6, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // White stitching laces
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 2);
    ctx.lineTo(cx + 5, cy + 3);
    ctx.stroke();

    // tiny glowing fire sparks
    ctx.fillStyle = '#facc15';
    ctx.fillRect(cx - 2, cy - 8 + Math.abs(Math.sin(Date.now()/120))*4, 2, 2);

    ctx.restore();
  }

  // Custom: Tatami Spectator Seat mat
  private desenharTatamiSpectator(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number): void {
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 4, y + 4, sz - 8, sz - 4);

    // Straw Tatami
    ctx.fillStyle = '#a1a852'; // dark straw
    ctx.fillRect(x + 4, y + 2, sz - 8, sz - 6);
    ctx.fillStyle = '#c5cc74'; // straw green
    ctx.fillRect(x + 6, y + 3, sz - 12, sz - 8);

    // Decorative cloth borders (Black borders)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 4, y + 2, 2, sz - 6);
    ctx.fillRect(x + sz - 6, y + 2, 2, sz - 6);

    ctx.restore();
  }
}
