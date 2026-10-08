/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Play, Info, RotateCcw, Volume2, VolumeX, Flame } from 'lucide-react';
import { MapManager } from './map';
import { Som } from './sound';
import { GameHUD } from './components/GameHUD';
import { DialogueBox } from './components/DialogueBox';
import { MinijogoScreen } from './components/MinijogoScreen';
import { GameCanvas } from './components/GameCanvas';
import { TouchControls } from './components/TouchControls';
import { GameState, Player, NPC, Chest, Particle } from './types';
import { INITIAL_NPCS, INITIAL_CHESTS } from './data';

export default function App() {
  // Game States
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [soundMuted, setSoundMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [virtualDir, setVirtualDir] = useState<{ x: number; y: number } | null>(null);

  // Global prevention of context menus and long-press page config triggers
  useEffect(() => {
    const handleContext = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleContext, { capture: true });
    return () => {
      window.removeEventListener('contextmenu', handleContext, { capture: true });
    };
  }, []);

  // Detect orientation and touch capabilities
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  const isMobile = isPortrait;

  // Keyboard Event Simulation for Mobile controls
  const simulateKeyDown = (key: string, code: string) => {
    const event = new KeyboardEvent('keydown', {
      key,
      code,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  const simulateKeyUp = (key: string, code: string) => {
    const event = new KeyboardEvent('keyup', {
      key,
      code,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  // Core entities
  const [player, setPlayer] = useState<Player>({
    x: 30 * 48,
    y: 18 * 48,
    width: 32,
    height: 32,
    speed: 240,
    hp: 100,
    maxHp: 100,
    level: 1,
    cristais: 0,
    andando: false,
    direcao: 'down',
    timerPasso: 0,
    timerAnimacao: 0,
  });

  const [npcs] = useState<NPC[]>(INITIAL_NPCS);
  const [chests, setChests] = useState<Chest[]>(INITIAL_CHESTS);
  const [activeNpc, setActiveNpc] = useState<NPC | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shakeState, setShakeState] = useState<{ duration: number; force: number }>({
    duration: 0,
    force: 0,
  });

  // Keep map instances stable
  const mapManager = useMemo(() => new MapManager(), []);

  // Show a beautifully animated slide-in notification
  const showNotificationMessage = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Sound control
  const handleToggleSound = () => {
    setSoundMuted((prev) => {
      const next = !prev;
      if (next) {
        // Mute hack (sound manager will play tones on very low volume, or we can guard inside playTone)
        // We'll simulate muting by keeping state. Let's make sure playTone respects muting.
      } else {
        Som.garantirContexto();
        Som.click();
      }
      return next;
    });
  };

  // Custom monkey-patched audio player respecting mute
  useEffect(() => {
    const originalPlayTone = Som.playTone.bind(Som);
    Som.playTone = (freq, type, dur, vol, glide) => {
      if (soundMuted) return;
      originalPlayTone(freq, type, dur, vol, glide);
    };
  }, [soundMuted]);

  // Handle using potions
  const handleUsePotion = () => {
    // Collect potions count dynamically from chests state remaining
    const totalChestsFound = chests.filter((c) => c.aberto).length;
    // Initial 2 potions + collected potions - used potions (stored as state)
    // To make it super robust, let's keep a direct counter for player's potions in a state
  };

  // We can track a direct player inventory of potions
  const [potionsCount, setPotionsCount] = useState(2);

  const triggerUsePotion = () => {
    if (potionsCount > 0) {
      if (player.hp >= player.maxHp) {
        showNotificationMessage('Sua energia já está completamente cheia! 💪');
        return;
      }
      setPotionsCount((prev) => prev - 1);
      setPlayer((p) => ({ ...p, hp: Math.min(p.maxHp, p.hp + 35) }));
      Som.coleta();
      showNotificationMessage('Você usou uma Poção de Cura! Recuperou +35 de Energia! 💚');

      // green healing sparks
      const sparks: Particle[] = [];
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 30 + Math.random() * 60;
        sparks.push({
          x: player.x + 16,
          y: player.y + 16,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          cor: '#22c55e',
          tamanho: 2.5 + Math.random() * 3,
          vidaMax: 0.5 + Math.random() * 0.3,
          vida: 0,
          tipo: 'explosao',
        });
      }
      setParticles((prev) => [...prev, ...sparks]);
    } else {
      showNotificationMessage('Nenhuma poção restante no inventário! Procure pelos baús na ilha! 📦');
    }
  };

  // Check if "P" key is pressed to use potion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p' && gameState === 'EXPLORACAO') {
        triggerUsePotion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [potionsCount, player, gameState]);

  // Handle interacting with an NPC
  const handleInteractNPC = (npc: NPC) => {
    Som.click();
    setActiveNpc(npc);
    setGameState('DIALOGO');
  };

  const handleStartCombat = () => {
    if (!activeNpc) return;

    if (activeNpc.biome === 'VILA') {
      setGameState('EXPLORACAO');
      setActiveNpc(null);
      return;
    }

    // Guard final boss entry
    if (activeNpc.biome === 'LAVA' && player.cristais < 6) {
      setGameState('EXPLORACAO');
      showNotificationMessage('A barreira vulcânica exige as outras 6 Medalhas de Campeão! 🌋🏅');
      Som.danoSofrido();
      return;
    }

    setGameState('MINIJOGO');
  };

  const handleVictory = () => {
    if (!activeNpc) return;

    Som.vitoria();
    const isFinalBoss = activeNpc.biome === 'LAVA';

    if (isFinalBoss) {
      setPlayer((prev) => ({ ...prev, cristais: 7 }));
      setGameState('WIN_GAME');
    } else {
      setPlayer((prev) => ({ ...prev, cristais: Math.min(6, prev.cristais + 1), level: prev.level + 1 }));
      setGameState('EXPLORACAO');
      showNotificationMessage(`Incrível! Você derrotou ${activeNpc.nome} e conquistou a Medalha da ilha! 🏆✨`);
    }
    setActiveNpc(null);
  };

  const handleDefeat = (damageTaken: number) => {
    const nextHp = player.hp - damageTaken;
    if (nextHp <= 0) {
      // Full respawn at village center
      setPlayer((prev) => ({
        ...prev,
        hp: 100,
        x: 30 * 48,
        y: 18 * 48,
      }));
      setPotionsCount(2); // replenishment
      setGameState('EXPLORACAO');
      showNotificationMessage('Sua energia esgotou! Você descansou na Vila Central e recuperou as forças... 🌸🩹');
      Som.danoSofrido();
      setActiveNpc(null);
    } else {
      setPlayer((prev) => ({ ...prev, hp: nextHp }));
    }
  };

  const handleRestartGame = () => {
    Som.click();
    setPlayer({
      x: 30 * 48,
      y: 18 * 48,
      width: 32,
      height: 32,
      speed: 220,
      hp: 100,
      maxHp: 100,
      level: 1,
      cristais: 0,
      andando: false,
      direcao: 'down',
      timerPasso: 0,
      timerAnimacao: 0,
    });
    setChests(INITIAL_CHESTS);
    setPotionsCount(2);
    setGameState('MENU');
    setActiveNpc(null);
  };

  // Support spacebar to skip menu screen
  useEffect(() => {
    const handleMenuSkip = (e: KeyboardEvent) => {
      if (gameState === 'MENU' && (e.key === ' ' || e.key === 'Enter')) {
        Som.garantirContexto();
        Som.click();
        setGameState('EXPLORACAO');
        showNotificationMessage('Explore a ilha, abra baús e fale com os Campeões dos Esportes! 🧭🗺️');
      }
    };
    window.addEventListener('keydown', handleMenuSkip);
    return () => window.removeEventListener('keydown', handleMenuSkip);
  }, [gameState]);

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-mono select-none p-0 sm:p-4">
      {/* Background visual graphics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />

      {/* Main 16:9 Screen container with unified, flawless scaling */}
      <div
        className="relative w-full aspect-[16/9] border-2 sm:border-8 border-red-700 rounded sm:rounded-lg shadow-2xl ring-1 sm:ring-4 ring-amber-400 bg-black overflow-hidden flex flex-col justify-between"
        style={{
          width: '100%',
          maxWidth: 'min(100%, min(177.78vh, 1200px))',
          maxHeight: 'min(100vh, 675px)',
        }}
      >
        
        {/* State Machine screens */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-red-950 flex flex-col justify-between p-4 sm:p-8 text-center z-50 select-none">
            {/* Ambient snow background simulation */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

            <div className="mt-4 sm:mt-12 space-y-2 sm:space-y-4">
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-amber-500/15 border border-amber-400/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-amber-400 text-[8px] sm:text-[10px] font-bold tracking-widest font-mono"
              >
                <Sparkles size={11} className="animate-spin text-amber-400" /> ROGERIO SANTOS
              </motion.div>

              <motion.h1
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm xs:text-base sm:text-2xl md:text-3xl font-extrabold tracking-wider text-yellow-400 font-mono drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
              >
                ILHA DOS CAMPEÕES DE FRAÇÃO 🐾
              </motion.h1>

              <p className="text-[7.5px] xs:text-[8.5px] sm:text-xs text-slate-300 max-w-xs sm:max-w-md mx-auto leading-relaxed font-mono">
                Aprenda simplificação, soma com denominadores iguais e frações com MMC enfrentando os campeões esportivos lendários!
              </p>
            </div>

            {/* Menu Controls */}
            <div className="mb-4 sm:mb-8 space-y-2 sm:space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  Som.garantirContexto();
                  Som.click();
                  setGameState('EXPLORACAO');
                  showNotificationMessage('Bem-vindo à Ilha! Encontre os 7 Campeões Sagrados!');
                }}
                className="px-4 sm:px-8 py-1.5 sm:py-3 bg-red-700 hover:bg-red-600 border-2 border-amber-400 text-white font-bold text-[9px] sm:text-xs rounded shadow-lg transition-transform hover:shadow-red-950 cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 font-mono tracking-wider"
              >
                <Play size={12} className="fill-white" /> JOGAR AGORA [ESPAÇO]
              </motion.button>

              <div className="flex justify-center gap-4 text-[8px] sm:text-[10px] text-slate-500 font-mono">
                <button onClick={() => setShowHelp(true)} className="hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1">
                  <Info size={10} /> Como Jogar
                </button>
                <span>•</span>
                <button onClick={handleToggleSound} className="hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1">
                  {soundMuted ? <VolumeX size={10} /> : <Volume2 size={10} />} Audio
                </button>
              </div>
            </div>

            {/* Bottom Spacer */}
            <div className="h-2" />
          </div>
        )}

        {/* WIN_GAME Screen */}
        {gameState === 'WIN_GAME' && (
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-950 via-slate-900 to-emerald-950 flex flex-col justify-between p-4 sm:p-8 text-center z-50 select-none font-mono">
            <div className="mt-4 sm:mt-12 space-y-2 sm:space-y-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-flex justify-center text-yellow-400"
              >
                <Trophy className="w-8 h-8 sm:w-12 sm:h-12 drop-shadow-[0_4px_12px_rgba(250,204,21,0.5)] fill-yellow-400/20" />
              </motion.div>

              <h1 className="text-sm sm:text-2xl font-black text-yellow-400 tracking-widest uppercase">
                GRANDE CAMPEÃO DA ILHA! 🏅👑
              </h1>

              <p className="text-[8px] sm:text-xs text-slate-200 max-w-xs sm:max-w-md mx-auto leading-relaxed">
                Parabéns! Você resolveu com maestria todos os desafios de frações dos deuses e unificou a paz e a sabedoria em toda a Champion Island!
              </p>
            </div>

            <button
              onClick={handleRestartGame}
              className="px-4 sm:px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] sm:text-xs rounded border border-yellow-400 cursor-pointer shadow-lg mx-auto inline-flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 mb-4"
            >
              <RotateCcw size={12} /> JOGAR NOVAMENTE
            </button>

            <div className="text-[7px] sm:text-[8px] text-slate-500 tracking-wider mb-2">
              Obrigado por completar o Fraction Champion Island! 🐾
            </div>
          </div>
        )}

        {/* Dialog / Chat Box overlay */}
        {gameState === 'DIALOGO' && activeNpc && (
          <DialogueBox
            npc={activeNpc}
            onComplete={handleStartCombat}
            onClose={() => {
              setGameState('EXPLORACAO');
              setActiveNpc(null);
            }}
          />
        )}

        {/* Fraction Battle Arena */}
        {gameState === 'MINIJOGO' && activeNpc && (
          <MinijogoScreen
            npc={activeNpc}
            biome={activeNpc.biome}
            playerLevel={player.level}
            onVictory={handleVictory}
            onDefeat={handleDefeat}
            onClose={() => {
              setGameState('EXPLORACAO');
              setActiveNpc(null);
            }}
            onCreateExplosion={(x, y, color) => {
              const explosionSparks: Particle[] = [];
              for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 60 + Math.random() * 120;
                explosionSparks.push({
                  x,
                  y,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  cor: color,
                  tamanho: 2 + Math.random() * 4,
                  vidaMax: 0.4 + Math.random() * 0.4,
                  vida: 0,
                  tipo: 'explosao',
                });
              }
              setParticles((prev) => [...prev, ...explosionSparks]);
            }}
            onShakeScreen={(dur, force) => setShakeState({ duration: dur, force })}
          />
        )}

        {/* Floating notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute top-14 sm:top-18 right-4 bg-slate-900 border-l-4 border-yellow-500 text-slate-200 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded text-[8px] sm:text-[10px] font-mono shadow-lg z-50 flex items-center gap-1.5 sm:gap-2 max-w-[200px] sm:max-w-xs"
            >
              <span>🔔</span>
              <span>{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global HUD Layout */}
        {(gameState === 'EXPLORACAO' || gameState === 'DIALOGO') && (
          <GameHUD
            playerHp={player.hp}
            playerMaxHp={player.maxHp}
            playerLevel={player.level}
            playerCristais={player.cristais}
            pocoes={potionsCount}
            onUsePotion={triggerUsePotion}
            onOpenHelp={() => setShowHelp(true)}
            soundMuted={soundMuted}
            onToggleSound={handleToggleSound}
          />
        )}

        {/* The World Game Canvas */}
        <GameCanvas
          player={player}
          setPlayer={setPlayer}
          npcs={npcs}
          chests={chests}
          setChests={setChests}
          gameState={gameState}
          onInteractNPC={handleInteractNPC}
          mapManager={mapManager}
          particles={particles}
          setParticles={setParticles}
          shakeState={shakeState}
          setShakeState={setShakeState}
          onShowNotification={showNotificationMessage}
          virtualDirection={virtualDir}
          onAddPotions={(q) => {
            setPotionsCount((prev) => prev + q);
            showNotificationMessage(`Encontrou +${q} Poção(ões) no Baú! 🧪✨ Recarregou energia!`);
          }}
        />

        {/* Modern, high-performance Touch Controls (D-Pad + Action Buttons A & B) */}
        {(gameState === 'EXPLORACAO' || gameState === 'DIALOGO') && (isTouch || isMobile) && (
          <TouchControls
            onDirectionChange={(dir) => setVirtualDir(dir)}
            onActionPress={() => simulateKeyDown(' ', 'Space')}
            onActionRelease={() => simulateKeyUp(' ', 'Space')}
            onPotionPress={triggerUsePotion}
            potionsCount={potionsCount}
            playerHp={player.hp}
            playerMaxHp={player.maxHp}
            disabled={gameState === 'DIALOGO'}
          />
        )}

        {/* Instructions overlay modal */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4 sm:p-6 z-50 select-none font-mono"
            >
              <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500 rounded p-4 sm:p-5 relative">
                <h3 className="text-xs sm:text-sm font-bold text-yellow-400 mb-3 tracking-wider text-center border-b border-slate-800 pb-2">
                  🎮 GUIA DO CAMPEÃO FRACIONÁRIO
                </h3>
                
                <div className="space-y-2 sm:space-y-3 text-[8px] sm:text-[10px] text-slate-300 leading-relaxed mb-4 sm:mb-5">
                  <div className="flex items-start gap-2">
                    <span className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 border border-slate-800 font-bold">W,A,S,D</span>
                    <span>ou</span>
                    <span className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 border border-slate-800 font-bold">Setas</span>
                    <span>Andar pela ilha e cruzar as pontes.</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 border border-slate-800 font-bold">ESPAÇO</span>
                    <span>ou</span>
                    <span className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 border border-slate-800 font-bold">E</span>
                    <span>Conversar com Campeões e abrir Diálogos.</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 border border-slate-800 font-bold">CLIQUE / TOQUE</span>
                    <span>Clique em qualquer lugar da tela e o gato andará até lá! 🐾</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 border border-slate-800 font-bold">P</span>
                    <span>ou</span>
                    <span className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400 border border-slate-800 font-bold">Botão B</span>
                    <span>Usar poção de cura instantânea (+35 HP).</span>
                  </div>

                  <p className="border-t border-slate-800 pt-3.5 text-[7px] sm:text-[9px] text-amber-400/80">
                    💡 <strong>Dica de Sobrevivência:</strong> Abra os baús amarelos no mapa para coletar mais poções. Você precisará de todas as 6 medalhas para passar pela barreira de lava do Oni Supremo!
                  </p>
                </div>

                <button
                  onClick={() => {
                    Som.click();
                    setShowHelp(false);
                  }}
                  className="w-full py-2 bg-red-700 hover:bg-red-600 text-white font-bold text-[10px] sm:text-xs rounded border border-red-500 cursor-pointer transition-transform hover:scale-105"
                >
                  FECHAR GUIA
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
