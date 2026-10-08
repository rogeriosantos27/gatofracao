/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Player, NPC, Chest, Particle } from '../types';
import { MapManager } from '../map';
import { Som } from '../sound';
import { MiniMap } from './MiniMap';

interface GameCanvasProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  npcs: NPC[];
  chests: Chest[];
  setChests: React.Dispatch<React.SetStateAction<Chest[]>>;
  gameState: string;
  onInteractNPC: (npc: NPC) => void;
  mapManager: MapManager;
  particles: Particle[];
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  shakeState: { duration: number; force: number };
  setShakeState: React.Dispatch<React.SetStateAction<{ duration: number; force: number }>>;
  onAddPotions: (count: number) => void;
  onShowNotification?: (msg: string) => void;
  virtualDirection?: { x: number; y: number } | null;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  setPlayer,
  npcs,
  chests,
  setChests,
  gameState,
  onInteractNPC,
  mapManager,
  particles,
  setParticles,
  shakeState,
  setShakeState,
  onAddPotions,
  onShowNotification,
  virtualDirection = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);
  const lastInteractedSportsRef = useRef<{ [key: string]: number }>({});

  // Synchronize mutable states in stable Refs so the continuous physics loop doesn't tear down on every state update
  const playerRef = useRef<Player>(player);
  const chestsRef = useRef<Chest[]>(chests);
  const particlesRef = useRef<Particle[]>(particles);
  const shakeStateRef = useRef<{ duration: number; force: number }>(shakeState);
  const gameStateRef = useRef<string>(gameState);
  const virtualDirectionRef = useRef<{ x: number; y: number } | null>(virtualDirection);

  // Click-to-move / Tap-to-move refs
  const clickTargetRef = useRef<{
    x: number;
    y: number;
    originalX: number;
    originalY: number;
    targetNpc?: NPC | null;
  } | null>(null);
  const isPointerDraggingOnCanvasRef = useRef(false);
  const stuckTimerRef = useRef(0);
  const lastPlayerStateSyncRef = useRef(0);

  useEffect(() => {
    virtualDirectionRef.current = virtualDirection;
  }, [virtualDirection]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    chestsRef.current = chests;
  }, [chests]);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  useEffect(() => {
    shakeStateRef.current = shakeState;
  }, [shakeState]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Keep camera state in ref for rendering loop to prevent React state stuttering
  const cameraRef = useRef<Camera>({ x: player.x - 400, y: player.y - 225 });

  // Floating indicator state to show "E" to talk
  const [nearbyNPC, setNearbyNPC] = useState<NPC | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;
      keysPressed.current[e.code.toLowerCase()] = true;

      // Prevent scrolling
      if (['space', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase()) || e.code.toLowerCase() === 'space') {
        e.preventDefault();
      }

      if (gameStateRef.current === 'EXPLORACAO') {
        if (k === 'e' || e.code.toLowerCase() === 'space') {
          // Check if close to an NPC
          const activeNpc = findNearbyNPC();
          if (activeNpc) {
            onInteractNPC(activeNpc);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = false;
      keysPressed.current[e.code.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInteractNPC]);

  const findNearbyNPC = (): NPC | null => {
    for (const npc of npcs) {
      const dist = Math.hypot(playerRef.current.x - npc.x, playerRef.current.y - npc.y);
      if (dist < 72) {
        return npc;
      }
    }
    return null;
  };

  // Perform a lightweight check for nearby NPCs without setting state or causing re-renders unless the value actually changes
  const checkNearbyNPC = () => {
    if (gameStateRef.current === 'EXPLORACAO') {
      const npc = findNearbyNPC();
      setNearbyNPC((prev) => {
        if (prev?.nome === npc?.nome) return prev;
        return npc;
      });
    } else {
      setNearbyNPC((prev) => (prev ? null : null));
    }
  };

  const updatePhysics = (dt: number) => {
    if (gameStateRef.current !== 'EXPLORACAO') return;

    // 1. Move Player
    let dx = 0;
    let dy = 0;
    let isMoving = false;
    let dir: 'up' | 'down' | 'left' | 'right' = playerRef.current.direcao;

    const keys = keysPressed.current;
    const hasKeyInput =
      keys['arrowup'] ||
      keys['w'] ||
      keys['arrowdown'] ||
      keys['s'] ||
      keys['arrowleft'] ||
      keys['a'] ||
      keys['arrowright'] ||
      keys['d'];

    const vDir = virtualDirectionRef.current;
    const hasVirtualDir = vDir !== null && (vDir.x !== 0 || vDir.y !== 0);

    if (hasKeyInput || hasVirtualDir) {
      // Manual input cancels click-to-move target
      clickTargetRef.current = null;

      if (hasVirtualDir && vDir) {
        dx = vDir.x;
        dy = vDir.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          dir = dx > 0 ? 'right' : 'left';
        } else {
          dir = dy > 0 ? 'down' : 'up';
        }
      } else {
        if (keys['arrowup'] || keys['w']) {
          dy = -1;
          dir = 'up';
        }
        if (keys['arrowdown'] || keys['s']) {
          dy = 1;
          dir = 'down';
        }
        if (keys['arrowleft'] || keys['a']) {
          dx = -1;
          dir = 'left';
        }
        if (keys['arrowright'] || keys['d']) {
          dx = 1;
          dir = 'right';
        }
      }
    } else if (clickTargetRef.current) {
      // Tap-to-move / Click-to-move autonomous navigation
      const tgt = clickTargetRef.current;
      const toX = tgt.x - playerRef.current.x;
      const toY = tgt.y - playerRef.current.y;
      const dist = Math.hypot(toX, toY);

      if (dist < 8) {
        // Destination reached
        if (tgt.targetNpc) {
          onInteractNPC(tgt.targetNpc);
        }
        clickTargetRef.current = null;
      } else {
        dx = toX / dist;
        dy = toY / dist;
        if (Math.abs(toX) > Math.abs(toY)) {
          dir = toX > 0 ? 'right' : 'left';
        } else {
          dir = toY > 0 ? 'down' : 'up';
        }

        // Auto-interact if reached within comfortable dialogue range of targeted NPC
        if (tgt.targetNpc) {
          const distToNpc = Math.hypot(
            playerRef.current.x - tgt.targetNpc.x,
            playerRef.current.y - tgt.targetNpc.y
          );
          if (distToNpc < 64) {
            onInteractNPC(tgt.targetNpc);
            clickTargetRef.current = null;
          }
        }
      }
    }

    let nextX = playerRef.current.x;
    let nextY = playerRef.current.y;
    let stepTimer = playerRef.current.timerPasso;
    let animTimer = playerRef.current.timerAnimacao;

    if (dx !== 0 || dy !== 0) {
      isMoving = true;
      const len = Math.hypot(dx, dy);
      const moveSpeed = playerRef.current.speed || 240;
      const moveX = (dx / len) * moveSpeed * dt;
      const moveY = (dy / len) * moveSpeed * dt;

      // Realistic feet collision box (allows smooth sliding past doors, bridges, and trees)
      const feetOffsetX = 5;
      const feetOffsetY = 16;
      const feetW = 22;
      const feetH = 15;

      let movedX = false;
      let movedY = false;

      if (
        mapManager.verificarPassabilidade(
          playerRef.current.x + moveX + feetOffsetX,
          playerRef.current.y + feetOffsetY,
          feetW,
          feetH
        )
      ) {
        nextX += moveX;
        movedX = true;
      }
      if (
        mapManager.verificarPassabilidade(
          playerRef.current.x + feetOffsetX,
          playerRef.current.y + moveY + feetOffsetY,
          feetW,
          feetH
        )
      ) {
        nextY += moveY;
        movedY = true;
      }

      // If clickTarget is active and player is blocked by an impassable wall
      if (clickTargetRef.current && !movedX && !movedY) {
        stuckTimerRef.current += dt;
        if (stuckTimerRef.current > 0.35) {
          clickTargetRef.current = null;
          stuckTimerRef.current = 0;
        }
      } else {
        stuckTimerRef.current = 0;
      }

      // Footstep sounds
      stepTimer += dt;
      if (stepTimer >= 0.26) {
        Som.passo();
        stepTimer = 0;
      }
      animTimer += dt * 14;
    } else {
      animTimer += dt * 4;
    }

    const updatedPlayer = {
      ...playerRef.current,
      x: nextX,
      y: nextY,
      andando: isMoving,
      direcao: dir,
      timerPasso: stepTimer,
      timerAnimacao: animTimer,
    };
    playerRef.current = updatedPlayer;

    // Throttle React state updates to avoid micro-stutters, keeping 60fps canvas buttery smooth
    const nowTimestamp = performance.now();
    if (!isMoving || nowTimestamp - lastPlayerStateSyncRef.current > 120) {
      lastPlayerStateSyncRef.current = nowTimestamp;
      setPlayer(updatedPlayer);
    }

    // Proximity checking for interactive sports equipment
    const checkSportsEquipmentCollisions = () => {
      const px = nextX + 16;
      const py = nextY + 16;
      const now = Date.now();

      const sportsItems = [
        { key: 'pingpong', name: 'Mesa de Ping Pong', x: 29 * 48 + 24, y: 6 * 48 + 24, r: 32, msg: 'Você rebateu uma bola de Ping Pong de Bambu! 🏓💨' },
        { key: 'escalada', name: 'Parede de Escalada', x: 7 * 48 + 24, y: 6 * 48 + 24, r: 32, msg: 'Você escalou a corda de Fukuro e treinou seus reflexos! 🧗❄️' },
        { key: 'bows', name: 'Suporte de Arcos', x: 51 * 48 + 24, y: 6 * 48 + 24, r: 32, msg: 'Você inspecionou os arcos de precisão de Yoichi! 🏹🎯' },
        { key: 'swimblock', name: 'Bloco de Partida', x: 7 * 48 + 24, y: 22 * 48 + 24, r: 32, msg: 'Mergulho olímpico perfeito da plataforma de Otohime! 🏊‍♂️🌊' },
        { key: 'skate', name: 'Rampa de Skate', x: 50 * 48 + 24, y: 22 * 48 + 24, r: 32, msg: 'Manobra insana! Você mandou um Kickflip grindado! 🛹🤙' },
        { key: 'hurdle', name: 'Hurdle de Corrida', x: 13 * 48 + 24, y: 37 * 48 + 24, r: 32, msg: 'Aceleração total! Você saltou o obstáculo com super velocidade! 🏃‍♂️⚡' },
        { key: 'rugbyball', name: 'Bola de Rugby de Lava', x: 44 * 48 + 24, y: 37 * 48 + 24, r: 32, msg: 'Você chutou a bola vulcânica de Rugby para um Drop Goal! 🏉🔥' },
      ];

      for (const item of sportsItems) {
        const dist = Math.hypot(px - item.x, py - item.y);
        if (dist < item.r) {
          const lastTime = lastInteractedSportsRef.current[item.key] || 0;
          if (now - lastTime > 2000) { // 2 seconds debounce cooldown
            lastInteractedSportsRef.current[item.key] = now;

            // 1. Play unique synthesizer notes
            if (item.key === 'pingpong') {
              Som.playTone(620, 'triangle', 0.12, 0.08, 900);
            } else if (item.key === 'escalada') {
              Som.playTone(160, 'sawtooth', 0.18, 0.06, 95);
            } else if (item.key === 'bows') {
              Som.playTone(450, 'sine', 0.1, 0.08);
              setTimeout(() => Som.playTone(280, 'triangle', 0.22, 0.12, 60), 80);
            } else if (item.key === 'swimblock') {
              Som.playTone(220, 'sine', 0.35, 0.15, 650);
            } else if (item.key === 'skate') {
              Som.playTone(180, 'sawtooth', 0.38, 0.12, 220);
              const skateShake = { duration: 0.25, force: 4.5 };
              shakeStateRef.current = skateShake;
              setShakeState(skateShake);
            } else if (item.key === 'hurdle') {
              Som.playTone(320, 'sine', 0.15, 0.1, 850);
              // SPEED POWER-UP
              setPlayer(prev => ({ ...prev, speed: 340 }));
              playerRef.current.speed = 340;
              setTimeout(() => {
                setPlayer(prev => ({ ...prev, speed: 220 }));
                playerRef.current.speed = 220;
              }, 1200);
            } else if (item.key === 'rugbyball') {
              Som.playTone(110, 'triangle', 0.45, 0.2, 450);
              const rugbyShake = { duration: 0.3, force: 7 };
              shakeStateRef.current = rugbyShake;
              setShakeState(rugbyShake);
            }

            // 2. Spawn thematic splash particles
            const sparks: Particle[] = [];
            let particleColor = '#ffffff';
            if (item.key === 'pingpong') particleColor = '#10b981';
            else if (item.key === 'escalada') particleColor = '#e2e8f0';
            else if (item.key === 'bows') particleColor = '#facc15';
            else if (item.key === 'swimblock') particleColor = '#3b82f6';
            else if (item.key === 'skate') particleColor = '#a855f7';
            else if (item.key === 'hurdle') particleColor = '#eab308';
            else if (item.key === 'rugbyball') particleColor = '#f97316';

            for (let i = 0; i < 15; i++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 40 + Math.random() * 60;
              sparks.push({
                x: item.x,
                y: item.y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                cor: particleColor,
                tamanho: 2.5 + Math.random() * 3,
                vidaMax: 0.45,
                vida: 0,
                tipo: 'explosao',
              });
            }

            const updatedParticles = [...particlesRef.current, ...sparks];
            particlesRef.current = updatedParticles;
            setParticles(updatedParticles);

            // 3. Display HUD Notification
            if (onShowNotification) {
              onShowNotification(item.msg);
            }
          }
        }
      }
    };
    checkSportsEquipmentCollisions();

    // 2. Camera tracking player with smooth lerp
    const targetCamX = nextX - 400 + playerRef.current.width / 2;
    const targetCamY = nextY - 225 + playerRef.current.height / 2;
    const maxCamX = mapManager.COLS * mapManager.TILE_SIZE - 800;
    const maxCamY = mapManager.ROWS * mapManager.TILE_SIZE - 450;

    cameraRef.current.x += (Math.max(0, Math.min(maxCamX, targetCamX)) - cameraRef.current.x) * 7 * dt;
    cameraRef.current.y += (Math.max(0, Math.min(maxCamY, targetCamY)) - cameraRef.current.y) * 7 * dt;

    // 3. Chests check proximity to open
    chestsRef.current.forEach((chest) => {
      if (!chest.aberto) {
        const dist = Math.hypot((nextX + 16) - (chest.x + 24), (nextY + 16) - (chest.y + 24));
        if (dist < 42) {
          // Open Chest
          const updatedChests = chestsRef.current.map((c) => (c.id === chest.id ? { ...c, aberto: true } : c));
          chestsRef.current = updatedChests;
          setChests(updatedChests);
          Som.coleta();

          const newShake = { duration: 0.35, force: 12 };
          shakeStateRef.current = newShake;
          setShakeState(newShake);

          // Spawn gold & white particles
          const newSparks: Particle[] = [];
          for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 40 + Math.random() * 80;
            newSparks.push({
              x: chest.x + 24,
              y: chest.y + 24,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              cor: Math.random() > 0.4 ? '#fbbf24' : '#ffffff',
              tamanho: 2 + Math.random() * 4,
              vidaMax: 0.4 + Math.random() * 0.4,
              vida: 0,
              tipo: 'explosao',
            });
          }
          const updatedParticles = [...particlesRef.current, ...newSparks];
          particlesRef.current = updatedParticles;
          setParticles(updatedParticles);

          // Reward player with potions
          const healedPlayer = { ...playerRef.current, hp: Math.min(playerRef.current.maxHp, playerRef.current.hp + 20) };
          playerRef.current = healedPlayer;
          setPlayer(healedPlayer);
          onAddPotions(chest.quantidade);
        }
      }
    });

    // 4. Weather Climate Particles generator
    if (Math.random() < 0.25 && particlesRef.current.filter((p) => p.tipo === 'clima').length < 120) {
      const biome = getBiomaAt(nextX, nextY);
      const margem = 80;
      const spawnX = cameraRef.current.x + Math.random() * (800 + margem * 2) - margem;
      const spawnY = cameraRef.current.y - 20;

      const newWeatherParticle: Particle | null = (() => {
        if (biome === 'NEVE') {
          return {
            x: spawnX,
            y: spawnY,
            vx: -15 + Math.random() * 30,
            vy: 40 + Math.random() * 30,
            cor: '#ffffff',
            tamanho: 1.5 + Math.random() * 3,
            vidaMax: 6,
            vida: 0,
            tipo: 'clima',
            oscilacao: Math.random() * 100,
          };
        } else if (biome === 'BAMBU') {
          return {
            x: spawnX,
            y: spawnY,
            vx: -40 - Math.random() * 40,
            vy: 30 + Math.random() * 20,
            cor: '#10b981',
            tamanho: 2 + Math.random() * 3,
            vidaMax: 6,
            vida: 0,
            tipo: 'clima',
            oscilacao: Math.random() * 100,
          };
        } else if (biome === 'VILA' || biome === 'LAGO_LOTUS') {
          // Floating pink sakura petals
          return {
            x: spawnX,
            y: spawnY,
            vx: -30 - Math.random() * 30,
            vy: 30 + Math.random() * 25,
            cor: Math.random() > 0.5 ? '#fbcfe8' : '#f472b6',
            tamanho: 2.5 + Math.random() * 2.5,
            vidaMax: 6.5,
            vida: 0,
            tipo: 'clima',
            oscilacao: Math.random() * 100,
          };
        } else if (biome === 'DESERTO') {
          return {
            x: cameraRef.current.x - 20,
            y: cameraRef.current.y + Math.random() * 450,
            vx: 120 + Math.random() * 80,
            vy: -10 + Math.random() * 20,
            cor: '#f5d79c',
            tamanho: 1 + Math.random() * 2.5,
            vidaMax: 4,
            vida: 0,
            tipo: 'clima',
          };
        } else if (biome === 'LAVA') {
          return {
            x: cameraRef.current.x + Math.random() * 800,
            y: cameraRef.current.y + 470, // Float up from bottom
            vx: -20 + Math.random() * 40,
            vy: -50 - Math.random() * 50,
            cor: Math.random() > 0.4 ? '#f97316' : '#ef4444',
            tamanho: 1.5 + Math.random() * 3,
            vidaMax: 4.5,
            vida: 0,
            tipo: 'clima',
          };
        } else if (biome === 'PALACIO_AGUA') {
          // Underwater blue rising bubbles
          return {
            x: cameraRef.current.x + Math.random() * 800,
            y: cameraRef.current.y + 470,
            vx: -15 + Math.random() * 30,
            vy: -40 - Math.random() * 30,
            cor: 'rgba(128, 222, 234, 0.55)',
            tamanho: 2 + Math.random() * 4,
            vidaMax: 5.5,
            vida: 0,
            tipo: 'clima',
            oscilacao: Math.random() * 100,
          };
        } else if (biome === 'CIDADE_SKATE') {
          // Grey wind/skate dust
          return {
            x: spawnX,
            y: spawnY,
            vx: -45 - Math.random() * 40,
            vy: 20 + Math.random() * 20,
            cor: '#cbd5e1',
            tamanho: 1.5 + Math.random() * 2,
            vidaMax: 4.5,
            vida: 0,
            tipo: 'clima',
          };
        }
        return null;
      })();

      if (newWeatherParticle) {
        const updatedParticles = [...particlesRef.current, newWeatherParticle];
        particlesRef.current = updatedParticles;
        setParticles(updatedParticles);
      }
    }

    // 5. Update active particles and shake time
    if (shakeStateRef.current.duration > 0) {
      const updatedShake = { ...shakeStateRef.current, duration: Math.max(0, shakeStateRef.current.duration - dt) };
      shakeStateRef.current = updatedShake;
      setShakeState(updatedShake);
    }

    const nextParticles: Particle[] = [];
    for (const p of particlesRef.current) {
      const nextVida = p.vida + dt;
      if (nextVida < p.vidaMax) {
        let nx = p.x;
        let ny = p.y;
        if (p.tipo === 'clima' && p.oscilacao !== undefined) {
          const osc = p.oscilacao + dt * 2;
          nx += p.vx * dt + Math.sin(osc) * 0.5;
          ny += p.vy * dt;
          nextParticles.push({ ...p, x: nx, y: ny, vida: nextVida, oscilacao: osc });
        } else {
          nx += p.vx * dt;
          ny += p.vy * dt;
          nextParticles.push({ ...p, x: nx, y: ny, vida: nextVida });
        }
      }
    }
    particlesRef.current = nextParticles;
    setParticles(nextParticles);

    // 6. Check nearby NPCs to talk
    checkNearbyNPC();
  };

  const getBiomaAt = (x: number, y: number): string => {
    const r = Math.floor(y / 48);
    const c = Math.floor(x / 48);
    return mapManager.getBiomeAt(r, c);
  };

  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // SCREEN SHAKE IMPLEMENTATION
    if (shakeStateRef.current.duration > 0) {
      const dx = (Math.random() - 0.5) * shakeStateRef.current.force;
      const dy = (Math.random() - 0.5) * shakeStateRef.current.force;
      ctx.translate(dx, dy);
    }

    const cam = cameraRef.current;

    // 1. Draw Map Tiles
    mapManager.render(ctx, cam);

    // Draw Click-to-Move / Tap-to-Move Target Indicator on the Ground
    if (clickTargetRef.current) {
      const tgt = clickTargetRef.current;
      const tx = tgt.originalX - cam.x;
      const ty = tgt.originalY - cam.y;

      if (tx > -50 && tx < 850 && ty > -50 && ty < 500) {
        const time = performance.now() * 0.005;
        const pulse = Math.sin(time * 3);
        const radius1 = 14 + pulse * 2.5;
        const radius2 = 7 + pulse * 1.5;

        ctx.save();
        // Ground shadow ring
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(tx, ty + 2, radius1 * 1.1, radius1 * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Expanding ripple
        const ripplePhase = (time * 1.5) % 1;
        const rippleR = 8 + ripplePhase * 16;
        ctx.strokeStyle = `rgba(251, 191, 36, ${Math.max(0, 1 - ripplePhase)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(tx, ty, rippleR, rippleR * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Glowing outer target ring
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(tx, ty, radius1, radius1 * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing ring
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(tx, ty, radius2, radius2 * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Center cute paw/target dot
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();

        // 3 mini paw toes
        ctx.beginPath();
        ctx.arc(tx - 3.5, ty - 3.5, 1.2, 0, Math.PI * 2);
        ctx.arc(tx, ty - 4.5, 1.2, 0, Math.PI * 2);
        ctx.arc(tx + 3.5, ty - 3.5, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // 2. Draw Chests (Baus)
    chestsRef.current.forEach((chest) => {
      const bx = chest.x - cam.x;
      const by = chest.y - cam.y;

      // Draw only if visible
      if (bx > -48 && bx < 848 && by > -48 && by < 498) {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath();
        ctx.ellipse(bx + 24, by + 34, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!chest.aberto) {
          // --- CLOSED CHEST ---
          // Wood Body
          ctx.fillStyle = '#78350f'; // Dark shadow wood
          ctx.fillRect(bx + 8, by + 12, 32, 24);
          ctx.fillStyle = '#b45309'; // Main warm oak wood
          ctx.fillRect(bx + 10, by + 14, 28, 20);

          // Wood Planks vertical lines
          ctx.fillStyle = '#78350f';
          ctx.fillRect(bx + 18, by + 14, 2, 20);
          ctx.fillRect(bx + 28, by + 14, 2, 20);

          // Lid Top (Rounded chest look)
          ctx.fillStyle = '#78350f';
          ctx.fillRect(bx + 6, by + 6, 36, 8);
          ctx.fillStyle = '#d97706'; // Lid main
          ctx.fillRect(bx + 8, by + 7, 32, 6);

          // Iron corner brackets (Golden corners)
          ctx.fillStyle = '#facc15'; // Bright gold
          ctx.fillRect(bx + 6, by + 6, 4, 6);
          ctx.fillRect(bx + 38, by + 6, 4, 6);
          ctx.fillRect(bx + 6, by + 30, 4, 6);
          ctx.fillRect(bx + 38, by + 30, 4, 6);

          // Central Lock plate and keyhole
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(bx + 20, by + 13, 8, 8);
          ctx.fillStyle = '#1e293b'; // Lock hole
          ctx.fillRect(bx + 23, by + 16, 2, 4);
        } else {
          // --- OPENED CHEST WITH GLOWING REWARDS ---
          // Rising magic sparkles
          const osc = Math.sin(Date.now() / 200) * 3;
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(bx + 14, by + 2 - osc, 3, 3);
          ctx.fillRect(bx + 30, by - 2 + osc, 2, 2);

          // Chest Open Body
          ctx.fillStyle = '#451a03'; // Dark opened void
          ctx.fillRect(bx + 8, by + 18, 32, 18);

          // Overflowing Gold and Treasures inside
          ctx.fillStyle = '#f59e0b'; // Gold coins pile
          ctx.fillRect(bx + 10, by + 15, 28, 5);
          // Gems sparkles
          ctx.fillStyle = '#60a5fa'; // Blue diamond
          ctx.fillRect(bx + 14, by + 14, 3, 3);
          ctx.fillStyle = '#ec4899'; // Pink ruby
          ctx.fillRect(bx + 28, by + 13, 3, 3);

          // Open Lid (Thrown backwards at an angle)
          ctx.fillStyle = '#78350f';
          ctx.fillRect(bx + 8, by + 4, 32, 6);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(bx + 10, by + 5, 28, 4);
          ctx.fillStyle = '#facc15'; // Gold brackets
          ctx.fillRect(bx + 8, by + 4, 3, 3);
          ctx.fillRect(bx + 37, by + 4, 3, 3);
        }
      }
    });

    // 3. Draw NPCs (Stunning custom Pixel-Art Sports Champions)
    npcs.forEach((npc) => {
      const nx = npc.x - cam.x;
      const ny = npc.y - cam.y;
      const cx = nx + 16;
      const cy = ny + 16;

      if (nx > -48 && nx < 848 && ny > -48 && ny < 498) {
        // NPC feet shadow
        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.beginPath();
        ctx.ellipse(cx, ny + 30, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Staggered bounce idle animation
        const npcBounce = Math.sin((Date.now() / 250) + (nx * 0.05)) * 1.5;

        ctx.save();
        ctx.translate(0, npcBounce);

        // Render based on character identity
        const mask = npc.mask;
        if (mask === 'tengu') {
          // --- TENGU (PING PONG) ---
          // Red face with long beak nose
          ctx.fillStyle = '#991b1b'; // Red face
          ctx.fillRect(cx - 8, cy - 14, 16, 12);
          ctx.fillStyle = '#eab308'; // Long yellow beak nose
          ctx.fillRect(cx - 3, cy - 8, 14, 4);

          // Black Tokin cap on head
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(cx - 4, cy - 17, 8, 4);

          // Green elegant athletic robes
          ctx.fillStyle = '#15803d';
          ctx.fillRect(cx - 10, cy - 2, 20, 16);
          ctx.fillStyle = '#ffffff'; // White sash belt
          ctx.fillRect(cx - 10, cy + 4, 20, 3);

          // Ping Pong paddle held in hand
          ctx.fillStyle = '#78350f'; // wooden handle
          ctx.fillRect(cx + 8, cy + 4, 3, 8);
          ctx.fillStyle = '#ef4444'; // Red paddle rubber
          ctx.beginPath();
          ctx.arc(cx + 9, cy + 3, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (mask === 'fukuro') {
          // --- FUKURO (ESCALADA) ---
          // Owl round body & head
          ctx.fillStyle = '#0369a1'; // Sky feather blue
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(cx - 10, cy, 20, 14);

          // White chest fluff feather plate
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.ellipse(cx, cy + 5, 7, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          // Owl big yellow glasses frame and black pupils
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx - 4, cy - 3, 4, 0, Math.PI * 2);
          ctx.arc(cx + 4, cy - 3, 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#1e293b'; // black eyes inside
          ctx.fillRect(cx - 5, cy - 4, 2, 2);
          ctx.fillRect(cx + 3, cy - 4, 2, 2);

          // Little yellow beak
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(cx - 1, cy, 2, 3);
        } else if (mask === 'raposa') {
          // --- YOICHI (ARQUEARIA - FOX ARCHER) ---
          // Fox face, ears & body (orange / white)
          ctx.fillStyle = '#e65100'; // Kitsune orange
          ctx.fillRect(cx - 8, cy - 14, 16, 12);
          // White kitsune whiskers mask sides
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 8, cy - 6, 3, 4);
          ctx.fillRect(cx + 5, cy - 6, 3, 4);
          ctx.fillRect(cx - 2, cy - 4, 4, 2);

          // Pointy kitsune ears
          ctx.fillStyle = '#e65100';
          ctx.beginPath();
          ctx.moveTo(cx - 8, cy - 14);
          ctx.lineTo(cx - 9, cy - 21);
          ctx.lineTo(cx - 3, cy - 14);
          ctx.moveTo(cx + 8, cy - 14);
          ctx.lineTo(cx + 9, cy - 21);
          ctx.lineTo(cx + 3, cy - 14);
          ctx.fill();

          // Elegant teal hakama robes
          ctx.fillStyle = '#0f766e';
          ctx.fillRect(cx - 10, cy - 2, 20, 16);
          ctx.fillStyle = '#ffffff'; // White overlay scarf
          ctx.fillRect(cx - 4, cy - 3, 8, 4);

          // Beautiful traditional bow
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx - 12, cy + 2, 9, -Math.PI * 0.5, Math.PI * 0.7);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff'; // bow string
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(cx - 12, cy - 7);
          ctx.lineTo(cx - 12, cy + 11);
          ctx.stroke();
        } else if (mask === 'peixe') {
          // --- OTOHIME (NADO - UNDERWATER EMPIRE) ---
          // Beautiful sea princess with teal hair
          ctx.fillStyle = '#00acc1'; // Teal hair flow
          ctx.fillRect(cx - 10, cy - 14, 20, 16);
          ctx.fillRect(cx - 11, cy - 4, 3, 12);
          ctx.fillRect(cx + 8, cy - 4, 3, 12);

          // Face
          ctx.fillStyle = '#ffedd5';
          ctx.fillRect(cx - 7, cy - 11, 14, 10);

          // Eyes
          ctx.fillStyle = '#006064';
          ctx.fillRect(cx - 4, cy - 8, 2, 3);
          ctx.fillRect(cx + 2, cy - 8, 2, 3);

          // Golden princess tiara / crown
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(cx - 6, cy - 14);
          ctx.lineTo(cx, cy - 18);
          ctx.lineTo(cx + 6, cy - 14);
          ctx.closePath();
          ctx.fill();

          // Royal royal-blue gown
          ctx.fillStyle = '#1d4ed8';
          ctx.fillRect(cx - 9, cy, 18, 14);
          ctx.fillStyle = '#ff4081'; // pink sash
          ctx.fillRect(cx - 9, cy + 4, 18, 3);
        } else if (mask === 'tanuki') {
          // --- TANUKI (SKATE CHAMP) ---
          // Raccoon mask eyes face
          ctx.fillStyle = '#8d6e63'; // Raccoon brown
          ctx.fillRect(cx - 9, cy - 12, 18, 12);
          // Dark brown raccoon eyes patch
          ctx.fillStyle = '#4e342e';
          ctx.fillRect(cx - 8, cy - 8, 16, 4);
          ctx.fillStyle = '#ffffff'; // white eyes dots
          ctx.fillRect(cx - 6, cy - 7, 2, 2);
          ctx.fillRect(cx + 4, cy - 7, 2, 2);

          // Cute round tanuki ears
          ctx.fillStyle = '#8d6e63';
          ctx.beginPath();
          ctx.arc(cx - 7, cy - 12, 3, 0, Math.PI * 2);
          ctx.arc(cx + 7, cy - 12, 3, 0, Math.PI * 2);
          ctx.fill();

          // Purple athletic t-shirt and white street cap
          ctx.fillStyle = '#6b21a8';
          ctx.fillRect(cx - 9, cy, 18, 14);
          ctx.fillStyle = '#ffffff'; // Forward cap
          ctx.fillRect(cx - 8, cy - 15, 15, 3);
          ctx.fillStyle = '#ef4444'; // Red cap visor
          ctx.fillRect(cx - 1, cy - 15, 8, 2);

          // Holds a cool skateboard
          ctx.fillStyle = '#d97706'; // Skateboard wooden deck
          ctx.fillRect(cx + 8, cy - 2, 4, 15);
          ctx.fillStyle = '#475569'; // wheels
          ctx.fillRect(cx + 7, cy + 1, 1, 2);
          ctx.fillRect(cx + 7, cy + 10, 1, 2);
        } else if (mask === 'passaro') {
          // --- KIJIMUNA (CORRIDA - DESERT RUNNER) ---
          // Wild flaming-red spiky hair
          ctx.fillStyle = '#ca8a04'; // Skin tone
          ctx.fillRect(cx - 7, cy - 10, 14, 10);

          ctx.fillStyle = '#d84315'; // Spiky flame-red hair
          ctx.beginPath();
          ctx.moveTo(cx - 10, cy - 5);
          ctx.lineTo(cx - 12, cy - 16);
          ctx.lineTo(cx - 4, cy - 10);
          ctx.lineTo(cx, cy - 19);
          ctx.lineTo(cx + 4, cy - 10);
          ctx.lineTo(cx + 12, cy - 16);
          ctx.lineTo(cx + 10, cy - 5);
          ctx.closePath();
          ctx.fill();

          // Straw skirt outfit
          ctx.fillStyle = '#7c2d12'; // Straw skirt
          ctx.fillRect(cx - 9, cy, 18, 14);
          ctx.fillStyle = '#ca8a04'; // Gold ribbon belt
          ctx.fillRect(cx - 9, cy + 1, 18, 2);
        } else if (mask === 'oni') {
          // --- ONI SUPREMO (RUGBY MONSTER) ---
          // Giant Red Oni head
          ctx.fillStyle = '#b91c1c'; // Fierce red skin
          ctx.fillRect(cx - 11, cy - 15, 22, 14);

          // Shaggy wild black hair
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(cx - 12, cy - 17, 24, 4);
          ctx.fillRect(cx - 12, cy - 13, 2, 10);
          ctx.fillRect(cx + 10, cy - 13, 2, 10);

          // Golden horns
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(cx - 7, cy - 16);
          ctx.lineTo(cx - 9, cy - 22);
          ctx.lineTo(cx - 3, cy - 16);
          ctx.moveTo(cx + 7, cy - 16);
          ctx.lineTo(cx + 9, cy - 22);
          ctx.lineTo(cx + 3, cy - 16);
          ctx.closePath();
          ctx.fill();

          // Glowing gold/yellow eyes
          ctx.fillStyle = '#facc15';
          ctx.fillRect(cx - 6, cy - 9, 3, 3);
          ctx.fillRect(cx + 3, cy - 9, 3, 3);

          // Rugby bold striped jersey
          ctx.fillStyle = '#0f172a'; // dark shirt
          ctx.fillRect(cx - 12, cy - 1, 24, 15);
          ctx.fillStyle = '#ef4444'; // red horizontal stripes
          ctx.fillRect(cx - 12, cy + 3, 24, 3);
          ctx.fillRect(cx - 12, cy + 9, 24, 3);
        } else if (mask === 'totem') {
          // --- TOTEM GUIA (ANCIENT GUIDING STONE) ---
          // Stone Pillar body
          ctx.fillStyle = '#64748b'; // Slate stone
          ctx.fillRect(cx - 10, cy - 12, 20, 26);
          
          // Stone borders/shading
          ctx.fillStyle = '#475569'; // Darker slate
          ctx.fillRect(cx - 10, cy + 10, 20, 4);
          ctx.fillRect(cx - 10, cy - 12, 3, 22);

          // Golden horizontal bands
          ctx.fillStyle = '#facc15';
          ctx.fillRect(cx - 10, cy - 6, 20, 3);
          ctx.fillRect(cx - 10, cy + 3, 20, 3);

          // Guiding glowing light bulb/sphere on top
          const glowY = cy - 20 + Math.sin(Date.now() / 200) * 2;
          ctx.fillStyle = '#fef08a'; // Bright yellow
          ctx.beginPath();
          ctx.arc(cx, glowY, 6, 0, Math.PI * 2);
          ctx.fill();

          // Little light halo rays
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1.5;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * 8, glowY + Math.sin(a) * 8);
            ctx.lineTo(cx + Math.cos(a) * 12, glowY + Math.sin(a) * 12);
            ctx.stroke();
          }

          // Cute glowing face on the stone totem
          ctx.fillStyle = '#1e293b'; // Dark eyes
          ctx.fillRect(cx - 5, cy - 1, 2, 2);
          ctx.fillRect(cx + 3, cy - 1, 2, 2);
          ctx.fillRect(cx - 2, cy + 6, 4, 2); // Small smiley mouth
        } else {
          // --- FALLBACK DETAILED NINJA / KEEPER ---
          ctx.fillStyle = '#475569';
          ctx.fillRect(cx - 8, cy - 10, 16, 24);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(cx - 6, cy - 8, 12, 6);
          ctx.fillStyle = '#0f172a'; // mask slit
          ctx.fillRect(cx - 6, cy - 6, 12, 3);
        }

        ctx.restore();

        // NPC Hover label name with clean borders
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(cx - 50, ny - 16, 100, 12);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 50, ny - 16, 100, 12);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(npc.nome, cx, ny - 7);
      }
    });

    // 4. Draw Player (Highly-Polished Custom Feline Pixel-Art Rendering with Dynamic Quadruped Articulation)
    const px = playerRef.current.x - cam.x;
    const py = playerRef.current.y - cam.y;
    const pCx = px + 16;
    const pCy = py + 16;

    const isMoving = playerRef.current.andando;
    const dir = playerRef.current.direcao;

    // Bouncing squash factors based on walking cycles
    const cycle = isMoving ? (Date.now() / 60) : (Date.now() / 180);
    const intensity = isMoving ? 0.12 : 0.04;
    const squashX = 1 + Math.sin(cycle) * intensity;
    const squashY = 1 - Math.sin(cycle) * intensity;

    // Quadruped walking cycle physics for paws alternation
    const walkCycle = isMoving ? (Date.now() / 50) : (Date.now() / 160);
    const legSwing = Math.sin(walkCycle) * 4.5;
    const legLift = Math.abs(Math.cos(walkCycle)) * -2;
    const legSwingAlt = -Math.sin(walkCycle) * 4.5;
    const legLiftAlt = Math.abs(Math.sin(walkCycle)) * -2;

    const legFR = isMoving ? { x: legSwing, y: legLift } : { x: 0, y: 0 };
    const legFL = isMoving ? { x: legSwingAlt, y: legLiftAlt } : { x: 0, y: 0 };
    const legBR = isMoving ? { x: legSwingAlt, y: legLiftAlt } : { x: 0, y: 0 };
    const legBL = isMoving ? { x: legSwing, y: legLift } : { x: 0, y: 0 };

    const tailSway = Math.sin(walkCycle * 0.7) * (isMoving ? 8 : 4);
    const headBob = isMoving ? Math.sin(walkCycle * 2) * 1.2 : Math.sin(walkCycle * 0.5) * 0.5;
    const scarfFlutter = Math.sin(cycle * 1.5) * 3;

    ctx.save();
    // Anchor scales centered at the feet
    ctx.translate(pCx, py + 32);
    ctx.scale(squashX, squashY);
    ctx.translate(-pCx, -(py + 32));

    // Player Shadow under feet
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(pCx, py + 31, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Helper to draw a detailed, jointed leg & paw
    const drawLeg = (ax: number, ay: number, tx: number, ty: number, color: string, pawColor: string) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // Cute white sock or pink paw pad tip
      ctx.fillStyle = pawColor;
      ctx.beginPath();
      ctx.arc(tx, ty + 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Draw Cat Anatomy depending on movement direction
    if (dir === 'right') {
      // 1. BACK LEGS (drawn behind the body)
      drawLeg(pCx - 7, pCy + 8, pCx - 7 + legBR.x, py + 31 + legBR.y, '#f97316', '#ffffff'); // Orange leg with white sock
      drawLeg(pCx + 4, pCy + 8, pCx + 4 + legFR.x, py + 31 + legFR.y, '#ffffff', '#fda4af'); // White leg with pink toes

      // 2. TAIL (swaying rear left)
      ctx.save();
      ctx.strokeStyle = '#f97316'; // Orange base
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pCx - 10, pCy + 4);
      ctx.quadraticCurveTo(pCx - 15 + tailSway, pCy - 1, pCx - 14 + tailSway * 1.4, pCy - 9);
      ctx.stroke();
      // White tip for tail
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx - 15 + tailSway * 1.2, pCy - 5);
      ctx.lineTo(pCx - 14 + tailSway * 1.4, pCy - 9);
      ctx.stroke();
      ctx.restore();

      // 3. MAIN CAT BODY (Horizontal pill shape)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(pCx - 2, pCy + 4, 11, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Calico Spots (Beautiful organic patches)
      ctx.fillStyle = '#f97316'; // Orange patch
      ctx.beginPath();
      ctx.ellipse(pCx - 5, pCy + 2, 6, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#451a03'; // Charcoal brown patch
      ctx.beginPath();
      ctx.ellipse(pCx + 1, pCy + 3, 4, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. FRONT LEGS (drawn in front of the body)
      drawLeg(pCx - 9, pCy + 8, pCx - 9 + legBL.x, py + 31 + legBL.y, '#ffffff', '#ffffff');
      drawLeg(pCx + 2, pCy + 8, pCx + 2 + legFL.x, py + 31 + legFL.y, '#451a03', '#ffffff'); // Calico dark leg

      // 5. RED ATHLETE SCARF (Neck collar and fluttering back)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(pCx + 1, pCy - 2, 4, 5); // Neck collar
      // Scarf end fluttering backwards
      ctx.beginPath();
      ctx.moveTo(pCx + 1, pCy + 1);
      ctx.quadraticCurveTo(pCx - 5, pCy + 2 + scarfFlutter, pCx - 9, pCy - 1 + scarfFlutter * 0.8);
      ctx.lineTo(pCx - 8, pCy - 4 + scarfFlutter * 0.8);
      ctx.quadraticCurveTo(pCx - 4, pCy + scarfFlutter, pCx + 1, pCy - 1);
      ctx.closePath();
      ctx.fill();

      // 6. CAT HEAD (with bobbing motion)
      ctx.save();
      ctx.translate(0, headBob);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pCx + 7, pCy - 5, 8, 0, Math.PI * 2);
      ctx.fill();

      // Orange patch on face
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(pCx + 10, pCy - 7, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // EARS with pink inner lobes
      // Left Ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx + 2, pCy - 10);
      ctx.lineTo(pCx + 1, pCy - 18);
      ctx.lineTo(pCx + 7, pCy - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(pCx + 3, pCy - 11);
      ctx.lineTo(pCx + 2, pCy - 15);
      ctx.lineTo(pCx + 6, pCy - 12);
      ctx.closePath();
      ctx.fill();

      // Right Ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx + 8, pCy - 12);
      ctx.lineTo(pCx + 10, pCy - 19);
      ctx.lineTo(pCx + 13, pCy - 11);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(pCx + 9, pCy - 13);
      ctx.lineTo(pCx + 10, pCy - 16);
      ctx.lineTo(pCx + 12, pCy - 12);
      ctx.closePath();
      ctx.fill();

      // FACE FEATURES
      // Friendly eye (Black pupil)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(pCx + 10, pCy - 8, 2, 3.5);
      // Pink nose
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(pCx + 13, pCy - 5, 1.5, 1.5);

      // Cute Whiskers
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pCx + 12, pCy - 4);
      ctx.lineTo(pCx + 18, pCy - 4);
      ctx.moveTo(pCx + 11, pCy - 3);
      ctx.lineTo(pCx + 17, pCy - 1);
      ctx.stroke();

      ctx.restore();

    } else if (dir === 'left') {
      // 1. BACK LEGS
      drawLeg(pCx + 7, pCy + 8, pCx + 7 + legBR.x, py + 31 + legBR.y, '#f97316', '#ffffff');
      drawLeg(pCx - 4, pCy + 8, pCx - 4 + legFR.x, py + 31 + legFR.y, '#ffffff', '#fda4af');

      // 2. TAIL (swaying rear right)
      ctx.save();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pCx + 10, pCy + 4);
      ctx.quadraticCurveTo(pCx + 15 + tailSway, pCy - 1, pCx + 14 + tailSway * 1.4, pCy - 9);
      ctx.stroke();
      // White tail tip
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx + 15 + tailSway * 1.2, pCy - 5);
      ctx.lineTo(pCx + 14 + tailSway * 1.4, pCy - 9);
      ctx.stroke();
      ctx.restore();

      // 3. MAIN BODY
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(pCx + 2, pCy + 4, 11, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Calico Spots
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(pCx + 5, pCy + 2, 6, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(pCx - 1, pCy + 3, 4, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. FRONT LEGS
      drawLeg(pCx + 9, pCy + 8, pCx + 9 + legBL.x, py + 31 + legBL.y, '#ffffff', '#ffffff');
      drawLeg(pCx - 2, pCy + 8, pCx - 2 + legFL.x, py + 31 + legFL.y, '#451a03', '#ffffff');

      // 5. RED ATHLETE SCARF
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(pCx - 5, pCy - 2, 4, 5); // Neck collar
      // Scarf end fluttering backwards
      ctx.beginPath();
      ctx.moveTo(pCx - 5, pCy + 1);
      ctx.quadraticCurveTo(pCx + 1, pCy + 2 + scarfFlutter, pCx + 5, pCy - 1 + scarfFlutter * 0.8);
      ctx.lineTo(pCx + 4, pCy - 4 + scarfFlutter * 0.8);
      ctx.quadraticCurveTo(pCx, pCy + scarfFlutter, pCx - 5, pCy - 1);
      ctx.closePath();
      ctx.fill();

      // 6. CAT HEAD (with bobbing motion)
      ctx.save();
      ctx.translate(0, headBob);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pCx - 7, pCy - 5, 8, 0, Math.PI * 2);
      ctx.fill();

      // Orange patch on face
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(pCx - 10, pCy - 7, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // EARS with pink inner lobes
      // Right Ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx - 2, pCy - 10);
      ctx.lineTo(pCx - 1, pCy - 18);
      ctx.lineTo(pCx - 7, pCy - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(pCx - 3, pCy - 11);
      ctx.lineTo(pCx - 2, pCy - 15);
      ctx.lineTo(pCx - 6, pCy - 12);
      ctx.closePath();
      ctx.fill();

      // Left Ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx - 8, pCy - 12);
      ctx.lineTo(pCx - 10, pCy - 19);
      ctx.lineTo(pCx - 13, pCy - 11);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(pCx - 9, pCy - 13);
      ctx.lineTo(pCx - 10, pCy - 16);
      ctx.lineTo(pCx - 12, pCy - 12);
      ctx.closePath();
      ctx.fill();

      // FACE FEATURES
      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(pCx - 12, pCy - 8, 2, 3.5);
      // Pink nose
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(pCx - 14, pCy - 5, 1.5, 1.5);

      // Whiskers
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pCx - 13, pCy - 4);
      ctx.lineTo(pCx - 19, pCy - 4);
      ctx.moveTo(pCx - 12, pCy - 3);
      ctx.lineTo(pCx - 18, pCy - 1);
      ctx.stroke();

      ctx.restore();

    } else if (dir === 'up') {
      // 1. BACK LEGS (Drawn in front when facing away)
      drawLeg(pCx - 7, pCy + 8, pCx - 7 + legBL.x, py + 31 + legBL.y, '#ffffff', '#ffffff');
      drawLeg(pCx + 7, pCy + 8, pCx + 7 + legBR.x, py + 31 + legBR.y, '#f97316', '#ffffff');

      // 2. TAIL (high and proud back-up view)
      ctx.save();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pCx, pCy + 6);
      ctx.quadraticCurveTo(pCx + tailSway, pCy - 4, pCx + tailSway * 1.5, pCy - 11);
      ctx.stroke();
      // White tail tip
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx + tailSway * 1.2, pCy - 7);
      ctx.lineTo(pCx + tailSway * 1.5, pCy - 11);
      ctx.stroke();
      ctx.restore();

      // 3. MAIN BODY (Round oval shape)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(pCx, pCy + 7, 10, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Back Calico Spots
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(pCx - 3, pCy + 5, 5, 6, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(pCx + 4, pCy + 6, 4, 4.5, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // 4. FRONT LEGS
      drawLeg(pCx - 4, pCy + 8, pCx - 4 + legFL.x, py + 31 + legFL.y, '#ffffff', '#fda4af');
      drawLeg(pCx + 4, pCy + 8, pCx + 4 + legFR.x, py + 31 + legFR.y, '#451a03', '#ffffff');

      // 5. RED ATHLETE SCARF (Back collar band with blowy tails)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(pCx - 6, pCy - 2, 12, 4);
      // fluttering scarf tails
      ctx.fillRect(pCx + 4, pCy + 1 + scarfFlutter * 0.4, 3, 6);
      ctx.fillRect(pCx + 6, pCy + 2 - scarfFlutter * 0.2, 2.5, 4.5);

      // 6. HEAD (Back view, no face features, stripes on back)
      ctx.save();
      ctx.translate(0, headBob);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pCx, pCy - 5, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Back of head stripe markings
      ctx.fillStyle = '#f97316';
      ctx.fillRect(pCx - 4, pCy - 12, 2.5, 5);
      ctx.fillRect(pCx + 1, pCy - 11, 2.5, 5.5);

      // EARS
      // Left Ear (pointed away, so we see back of ear)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx - 8, pCy - 10);
      ctx.lineTo(pCx - 11, pCy - 18);
      ctx.lineTo(pCx - 3, pCy - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f97316'; // Back of ears has cute orange tips!
      ctx.beginPath();
      ctx.moveTo(pCx - 9, pCy - 13);
      ctx.lineTo(pCx - 11, pCy - 18);
      ctx.lineTo(pCx - 6, pCy - 14);
      ctx.closePath();
      ctx.fill();

      // Right Ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx + 8, pCy - 10);
      ctx.lineTo(pCx + 11, pCy - 18);
      ctx.lineTo(pCx + 3, pCy - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(pCx + 9, pCy - 13);
      ctx.lineTo(pCx + 11, pCy - 18);
      ctx.lineTo(pCx + 6, pCy - 14);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

    } else {
      // --- DEFAULT / DOWN (FRONT FACING VIEW) ---
      // 1. BACK LEGS
      drawLeg(pCx - 7, pCy + 8, pCx - 7 + legBL.x, py + 31 + legBL.y, '#f97316', '#ffffff');
      drawLeg(pCx + 7, pCy + 8, pCx + 7 + legBR.x, py + 31 + legBR.y, '#ffffff', '#ffffff');

      // 2. TAIL (swaying side-out)
      ctx.save();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pCx - 6, pCy + 7);
      ctx.quadraticCurveTo(pCx - 12 + tailSway, pCy + 5, pCx - 10 + tailSway * 1.3, pCy - 2);
      ctx.stroke();
      // White tail tip
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx - 11 + tailSway * 1.1, pCy + 1);
      ctx.lineTo(pCx - 10 + tailSway * 1.3, pCy - 2);
      ctx.stroke();
      ctx.restore();

      // 3. MAIN BODY (Round cuddly body)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(pCx, pCy + 7, 10, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chest Calico Patches
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(pCx - 4, pCy + 6, 4.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(pCx + 4, pCy + 7, 3.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. FRONT LEGS (articulating actively in front)
      drawLeg(pCx - 3.5, pCy + 8, pCx - 3.5 + legFL.x, py + 31 + legFL.y, '#ffffff', '#fda4af');
      drawLeg(pCx + 3.5, pCy + 8, pCx + 3.5 + legFR.x, py + 31 + legFR.y, '#451a03', '#ffffff');

      // 5. RED SCARF
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(pCx - 6, pCy - 2, 12, 4);
      // Scarf fluttering end blown to the side
      ctx.beginPath();
      ctx.moveTo(pCx - 5, pCy + 1);
      ctx.quadraticCurveTo(pCx - 9, pCy + 3 + scarfFlutter, pCx - 12, pCy + scarfFlutter * 0.9);
      ctx.lineTo(pCx - 11, pCy - 3 + scarfFlutter * 0.9);
      ctx.quadraticCurveTo(pCx - 7, pCy + 1 + scarfFlutter, pCx - 5, pCy);
      ctx.closePath();
      ctx.fill();

      // 6. CAT HEAD (with bobbing motion)
      ctx.save();
      ctx.translate(0, headBob);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pCx, pCy - 5, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Face markings
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(pCx - 4, pCy - 7, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // EARS
      // Left Ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx - 6, pCy - 10);
      ctx.lineTo(pCx - 10, pCy - 18);
      ctx.lineTo(pCx - 2, pCy - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(pCx - 6, pCy - 11);
      ctx.lineTo(pCx - 8, pCy - 15);
      ctx.lineTo(pCx - 3, pCy - 12);
      ctx.closePath();
      ctx.fill();

      // Right Ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pCx + 6, pCy - 10);
      ctx.lineTo(pCx + 10, pCy - 18);
      ctx.lineTo(pCx + 2, pCy - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(pCx + 6, pCy - 11);
      ctx.lineTo(pCx + 8, pCy - 15);
      ctx.lineTo(pCx + 3, pCy - 12);
      ctx.closePath();
      ctx.fill();

      // FACE EXPRESSION
      // Big friendly black eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(pCx - 4, pCy - 7, 2, 3);
      ctx.fillRect(pCx + 2, pCy - 7, 2, 3);

      // Pink small nose
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(pCx - 0.5, pCy - 4.5, 1, 1);

      // Tiny sweet cat mouth lines (w shape)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(pCx - 2, pCy - 3);
      ctx.quadraticCurveTo(pCx - 1, pCy - 2, pCx, pCy - 3);
      ctx.quadraticCurveTo(pCx + 1, pCy - 2, pCx + 2, pCy - 3);
      ctx.stroke();

      // Whiskers (Left and Right)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Left
      ctx.moveTo(pCx - 6, pCy - 4);
      ctx.lineTo(pCx - 11, pCy - 5);
      ctx.moveTo(pCx - 6, pCy - 3);
      ctx.lineTo(pCx - 12, pCy - 3);
      // Right
      ctx.moveTo(pCx + 6, pCy - 4);
      ctx.lineTo(pCx + 11, pCy - 5);
      ctx.moveTo(pCx + 6, pCy - 3);
      ctx.lineTo(pCx + 12, pCy - 3);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();

    // 5. Render Climate & Burst Particles
    particlesRef.current.forEach((p) => {
      const rx = p.x - cam.x;
      const ry = p.y - cam.y;

      if (rx > -20 && rx < 820 && ry > -20 && ry < 470) {
        ctx.fillStyle = p.cor;
        ctx.beginPath();
        ctx.arc(rx, ry, p.tamanho, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();

    // 6. Draw floating speech bubbles near NPCs
    if (nearbyNPC) {
      const nX = nearbyNPC.x - cam.x + 16;
      const nY = nearbyNPC.y - cam.y - 28;

      ctx.save();
      // Draw a retro bubble container
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(nX - 44, nY - 14, 88, 14);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(nX - 44, nY - 14, 88, 14);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[ESPAÇO] Conversar', nX, nY - 5);
      ctx.restore();
    }
  };

  // Pointer & Tap to move handlers on the Canvas
  const updateClickTargetFromPointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 450 / rect.height;
    const screenX = (clientX - rect.left) * scaleX;
    const screenY = (clientY - rect.top) * scaleY;

    const worldX = screenX + cameraRef.current.x;
    const worldY = screenY + cameraRef.current.y;

    // Check if clicked near an NPC (interactive target)
    let foundNpc: NPC | null = null;
    for (const npc of npcs) {
      if (Math.hypot(worldX - (npc.x + 16), worldY - (npc.y + 16)) < 48) {
        foundNpc = npc;
        break;
      }
    }

    clickTargetRef.current = {
      x: Math.max(16, Math.min(mapManager.COLS * 48 - 48, worldX - 16)),
      y: Math.max(16, Math.min(mapManager.ROWS * 48 - 48, worldY - 16)),
      originalX: worldX,
      originalY: worldY,
      targetNpc: foundNpc,
    };
    stuckTimerRef.current = 0;
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'EXPLORACAO') return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
    isPointerDraggingOnCanvasRef.current = true;
    updateClickTargetFromPointer(e.clientX, e.clientY);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDraggingOnCanvasRef.current) return;
    if (gameStateRef.current !== 'EXPLORACAO') return;
    updateClickTargetFromPointer(e.clientX, e.clientY);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDraggingOnCanvasRef.current = false;
  };

  // Keep latest handlers in refs to avoid any stale closure issues in the continuous requestAnimationFrame loop
  const updatePhysicsRef = useRef(updatePhysics);
  const renderGameRef = useRef(renderGame);

  useEffect(() => {
    updatePhysicsRef.current = updatePhysics;
    renderGameRef.current = renderGame;
  }); // Runs on every render to ensure game loop always executes with latest props and closure variables

  // Main physical physics & render loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (!prevTimeRef.current) prevTimeRef.current = timestamp;
      let dt = (timestamp - prevTimeRef.current) / 1000;
      if (dt > 0.1) dt = 0.1; // Clamp delta time to avoid huge leaps
      prevTimeRef.current = timestamp;

      if (updatePhysicsRef.current) updatePhysicsRef.current(dt);
      if (renderGameRef.current) renderGameRef.current();

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); // Fully stable dependencies: loop is initiated once and runs continuously

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center pt-12 sm:pt-16 select-none bg-slate-950"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Scanline Screen Retro Effect Overlay */}
      <div className="absolute inset-0 top-12 sm:top-16 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.08)_50%)] bg-[length:100%_4px]" />

      <canvas
        ref={canvasRef}
        id="gameCanvas"
        width={800}
        height={450}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="w-full max-w-full max-h-full aspect-[16/9] border-2 sm:border-4 border-red-800 rounded bg-black outline-none block image-render-pixelated shadow-2xl cursor-pointer touch-none"
        tabIndex={1}
        style={{
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          userSelect: 'none',
        }}
      />

      {/* Floating Minimap Overlay */}
      {gameState === 'EXPLORACAO' && (
        <MiniMap player={player} npcs={npcs} chests={chests} mapManager={mapManager} />
      )}
    </div>
  );
};
