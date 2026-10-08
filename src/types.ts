/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'MENU' | 'EXPLORACAO' | 'DIALOGO' | 'MINIJOGO' | 'WIN_GAME' | 'HELP';

export type BiomeType = 'VILA' | 'NEVE' | 'BAMBU' | 'DESERTO' | 'LAVA' | 'LAGO_LOTUS' | 'PALACIO_AGUA' | 'CIDADE_SKATE';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  hp: number;
  maxHp: number;
  level: number;
  cristais: number;
  andando: boolean;
  direcao: 'up' | 'down' | 'left' | 'right';
  timerPasso: number;
  timerAnimacao: number;
}

export interface NPC {
  nome: string;
  x: number;
  y: number;
  color: string;
  mask: string;
  biome: BiomeType;
  dialogue: string[];
}

export interface Chest {
  id: number;
  x: number;
  y: number;
  aberto: boolean;
  tipoConteudo: 'pocao';
  quantidade: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  cor: string;
  tamanho: number;
  vidaMax: number;
  vida: number;
  tipo: 'explosao' | 'clima';
  oscilacao?: number;
}

export interface Camera {
  x: number;
  y: number;
}

export interface MinigameQuestion {
  question: string;
  alternatives?: string[];
  correctAnswerIdx?: number;
  partesTotais?: number;
  objetivoPintar?: number;
}
