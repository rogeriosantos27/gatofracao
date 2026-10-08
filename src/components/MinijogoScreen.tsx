/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Som } from '../sound';
import { BiomeType, MinigameQuestion, NPC } from '../types';
import { getUniqueQuestion } from '../questionsBank';
import { Sparkles, Heart, HelpCircle, Flame } from 'lucide-react';
import { SportVisual } from './SportVisual';

interface MinijogoScreenProps {
  npc: NPC;
  biome: BiomeType;
  playerLevel: number;
  onVictory: () => void;
  onDefeat: (damageTaken: number) => void;
  onClose: () => void;
  onCreateExplosion: (x: number, y: number, color: string) => void;
  onShakeScreen: (duration: number, force: number) => void;
}

interface ExplanationData {
  titulo: string;
  conceito: string;
  regra: string;
  dica: string;
  renderVisual: () => React.ReactNode;
}

const getExplanationData = (biome: BiomeType, npc: NPC): ExplanationData => {
  switch (biome) {
    case 'BAMBU':
      return {
        titulo: '🥋 Tengu e o Truque de Encolher Frações',
        conceito: 'Encolher uma fração (simplificar) significa dividir o número de cima e o número de baixo pelo mesmo número, até eles ficarem bem pequenininhos! É como dividir uma barra de chocolate gigante em fatias maiores e mais fáceis de segurar!',
        regra: 'Divida o número de cima e o de baixo pelo mesmo número. Por exemplo: 12/18 dividindo ambos por 6 fica 2/3.',
        dica: 'Procure pelo maior número que divide os dois ao mesmo tempo para encolher super rápido!',
        renderVisual: () => (
          <div className="flex flex-col items-center justify-center p-2.5 bg-slate-950 rounded border border-slate-800 font-mono">
            <div className="text-[9px] text-slate-400 mb-1.5">Exemplo de Encolhimento (Simplificar):</div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex flex-col items-center">
                <span className="text-amber-400 font-bold">12</span>
                <div className="w-6 h-[1.5px] bg-slate-600 my-0.5" />
                <span className="text-amber-400 font-bold">18</span>
              </div>
              <div className="flex flex-col text-[9px] text-emerald-400 font-bold text-center leading-none">
                <span>÷ 6</span>
                <span>➔</span>
                <span>÷ 6</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-emerald-400 font-extrabold text-xs">2</span>
                <div className="w-6 h-[1.5px] bg-slate-400 my-0.5" />
                <span className="text-emerald-400 font-extrabold text-xs">3</span>
              </div>
            </div>
            <div className="text-[8px] text-slate-500 mt-1.5">Os dois pedaços representam a mesma quantidade gostosa!</div>
          </div>
        )
      };
    case 'NEVE':
      return {
        titulo: '❄️ Fukuro e o que Falta para o Topo',
        conceito: 'A fração restante mostra quanto ainda falta para terminar o nosso caminho! Se dividirmos a subida da montanha em partes iguais e já subimos algumas delas, a fração complementar diz quanto ainda temos que subir!',
        regra: 'Veja quantos metros faltam para chegar ao topo e monte a sua fração sobre o total de metros da montanha!',
        dica: 'Se a montanha tem 5 metros e você já subiu 3 metros, ainda faltam 2 metros! Ou seja, 2/5!',
        renderVisual: () => (
          <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded border border-slate-800 font-mono w-full">
            <div className="text-[9px] text-slate-400 mb-1.5">Montanha de 5 metros (Subiu 3m, restam 2m):</div>
            <div className="w-full flex gap-1 h-5">
              <div className="flex-1 bg-emerald-600 border border-emerald-500 rounded-sm flex items-center justify-center text-[7px] text-white font-bold leading-none">Subiu</div>
              <div className="flex-1 bg-emerald-600 border border-emerald-500 rounded-sm flex items-center justify-center text-[7px] text-white font-bold leading-none">Subiu</div>
              <div className="flex-1 bg-emerald-600 border border-emerald-500 rounded-sm flex items-center justify-center text-[7px] text-white font-bold leading-none">Subiu</div>
              <div className="flex-1 bg-slate-800 border border-slate-700 rounded-sm flex items-center justify-center text-[7px] text-amber-400 font-bold leading-none">Falta</div>
              <div className="flex-1 bg-slate-800 border border-slate-700 rounded-sm flex items-center justify-center text-[7px] text-amber-400 font-bold leading-none">Falta</div>
            </div>
            <div className="text-[8px] text-slate-400 mt-1.5">Falta escalar: 2 de 5 partes = <span className="text-amber-400 font-bold">2/5</span></div>
          </div>
        )
      };
    case 'LAGO_LOTUS':
      return {
        titulo: '🌸 Yoichi e as Frações de Fração',
        conceito: 'Pegar a metade (1/2) ou a terça parte (1/3) de um pedaço que já foi cortado é o mesmo que multiplicar as frações! É descobrir o tamanho de um pedacinho menor dentro de outro pedaço!',
        regra: 'Para multiplicar frações, basta fazer a conta de vezes com o número de cima pelo de cima, e o número de baixo pelo de baixo!',
        dica: 'A metade de 3/4 é igual a fazer 1/2 × 3/4, ou seja, multiplicamos embaixo por 2, virando 3/8!',
        renderVisual: () => (
          <div className="flex flex-col items-center justify-center p-2.5 bg-slate-950 rounded border border-slate-800 font-mono w-full">
            <div className="text-[9px] text-slate-400 mb-1">Calcular a metade (1/2) de 3/4:</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex flex-col items-center">
                <span>1</span>
                <div className="w-4 h-[1px] bg-slate-600 my-0.5" />
                <span>2</span>
              </div>
              <span className="text-amber-500 text-[10px]">×</span>
              <div className="flex flex-col items-center">
                <span>3</span>
                <div className="w-4 h-[1px] bg-slate-600 my-0.5" />
                <span>4</span>
              </div>
              <span className="text-emerald-500 text-[10px]">=</span>
              <div className="flex flex-col items-center font-bold text-emerald-400">
                <span>1 × 3</span>
                <div className="w-12 h-[1px] bg-slate-400 my-0.5" />
                <span>2 × 4</span>
              </div>
              <span className="text-emerald-400 font-bold text-[10px]">=</span>
              <div className="flex flex-col items-center font-bold text-emerald-400">
                <span>3</span>
                <div className="w-4 h-[1px] bg-slate-400 my-0.5" />
                <span>8</span>
              </div>
            </div>
          </div>
        )
      };
    case 'PALACIO_AGUA':
      return {
        titulo: '🌊 Otohime e os Pedaços Pintados',
        conceito: 'Uma fração é só um jeito legal de mostrar pedaços de alguma coisa! O número de baixo diz em quantos pedaços dividimos o todo, e o de cima diz quantos desses pedaços nós pintamos ou comemos!',
        regra: 'Olhe o número de baixo para ver em quantos quadradinhos a barra está dividida. Clique neles para pintar a quantidade que está escrita em cima!',
        dica: 'Para pintar 3/5, é só preencher exatamente 3 quadradinhos de um total de 5!',
        renderVisual: () => (
          <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded border border-slate-800 font-mono w-full">
            <div className="text-[9px] text-slate-400 mb-1.5">Representando a fração 3/5 na barra:</div>
            <div className="w-full flex gap-1 h-5">
              <div className="flex-1 bg-emerald-500 border border-emerald-400 rounded-sm flex items-center justify-center text-[7px] text-white font-bold leading-none">Pintado</div>
              <div className="flex-1 bg-emerald-500 border border-emerald-400 rounded-sm flex items-center justify-center text-[7px] text-white font-bold leading-none">Pintado</div>
              <div className="flex-1 bg-emerald-500 border border-emerald-400 rounded-sm flex items-center justify-center text-[7px] text-white font-bold leading-none">Pintado</div>
              <div className="flex-1 bg-slate-800 border border-slate-700 rounded-sm flex items-center justify-center text-[7px] text-slate-500 leading-none">Vazio</div>
              <div className="flex-1 bg-slate-800 border border-slate-700 rounded-sm flex items-center justify-center text-[7px] text-slate-500 leading-none">Vazio</div>
            </div>
            <div className="text-[8px] text-slate-400 mt-1.5">3 pintados (Número de Cima) / 5 totais (Número de Baixo)</div>
          </div>
        )
      };
    case 'CIDADE_SKATE':
      return {
        titulo: '🛹 Tanuki e os Giros de Skate',
        conceito: 'Dar um giro completo no ar com o skate é fazer uma volta inteira de 360 graus (360°)! Se a gente der só um giro menor, fizemos uma fração de uma volta inteira!',
        regra: 'Divida o valor em graus da sua manobra por 360 e encolha a fração dividindo em cima e embaixo para achar a fração simples!',
        dica: 'Meia-volta é 180° (que é a metade: 1/2). Um quarto de volta é 90° (que é 1/4)!',
        renderVisual: () => (
          <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded border border-slate-800 font-mono w-full">
            <div className="text-[9px] text-slate-400 mb-1.5">Giro de 90° em uma volta completa de 360°:</div>
            <div className="flex items-center gap-6">
              <div 
                className="w-10 h-10 rounded-full border border-slate-800 shadow-lg" 
                style={{ background: 'conic-gradient(#10b981 0deg 90deg, #1e293b 90deg 360deg)' }}
              />
              <div className="flex items-center gap-2 text-xs">
                <div className="flex flex-col items-center">
                  <span>90°</span>
                  <div className="w-8 h-[1px] bg-slate-600 my-0.5" />
                  <span>360°</span>
                </div>
                <span className="text-slate-500">➔</span>
                <div className="flex flex-col items-center text-emerald-400 font-bold">
                  <span>1</span>
                  <div className="w-4 h-[1px] bg-slate-400 my-0.5" />
                  <span>4</span>
                </div>
              </div>
            </div>
          </div>
        )
      };
    case 'DESERTO':
      return {
        titulo: '🌵 Kijimuna e as Contas de Somar Iguais',
        conceito: 'Quando somamos ou subtraímos frações com o mesmo número de baixo, a conta é muito fácil! Nós repetimos o número de baixo e só fazemos a conta de mais ou de menos com os números de cima!',
        regra: 'Mantenha o número de baixo igual e faça a conta com os números de cima! Nunca some os números de baixo!',
        dica: '3 fatias de pizza de um total de 10, mais 4 fatias de 10, são iguaizinhas a 7 fatias de 10!',
        renderVisual: () => (
          <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded border border-slate-800 font-mono w-full">
            <div className="text-[9px] text-slate-400 mb-1.5">Soma rápida: 3/10 + 4/10:</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex flex-col items-center text-amber-300">
                <span>3</span>
                <div className="w-4 h-[1px] bg-slate-600 my-0.5" />
                <span>10</span>
              </div>
              <span className="text-slate-500">+</span>
              <div className="flex flex-col items-center text-amber-300">
                <span>4</span>
                <div className="w-4 h-[1px] bg-slate-600 my-0.5" />
                <span>10</span>
              </div>
              <span className="text-slate-500">=</span>
              <div className="flex flex-col items-center text-emerald-400 font-bold">
                <span>3 + 4</span>
                <div className="w-12 h-[1px] bg-slate-400 my-0.5" />
                <span>10</span>
              </div>
              <span className="text-emerald-400 font-bold">=</span>
              <div className="flex flex-col items-center text-emerald-400 font-bold">
                <span>7</span>
                <div className="w-4 h-[1px] bg-slate-400 my-0.5" />
                <span>10</span>
              </div>
            </div>
          </div>
        )
      };
    case 'LAVA':
      return {
        titulo: '🌋 Oni Supremo e os Tamanhos Diferentes',
        conceito: 'Se as fatias têm tamanhos diferentes (números de baixo diferentes), não dá para somar direto! Primeiro, precisamos deixar todos do mesmo tamanho usando a multiplicação cruzada!',
        regra: 'Multiplique cruzado os números para descobrir os novos valores de cima, e multiplique os de baixo para achar o novo tamanho dos pedaços!',
        dica: 'Para somar 1/2 + 1/3, multiplique cruzado: (1×3 + 1×2) em cima, e (2×3) embaixo, dando 5/6!',
        renderVisual: () => (
          <div className="flex flex-col items-center justify-center p-2.5 bg-slate-950 rounded border border-slate-800 font-mono w-full">
            <div className="text-[9px] text-slate-400 mb-1 font-bold text-red-400">Atalho da Multiplicação Cruzada:</div>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="flex flex-col items-center text-slate-300">
                <span>1</span>
                <div className="w-4 h-[1px] bg-slate-600 my-0.5" />
                <span>2</span>
              </div>
              <span className="text-slate-500">+</span>
              <div className="flex flex-col items-center text-slate-300">
                <span>1</span>
                <div className="w-4 h-[1px] bg-slate-600 my-0.5" />
                <span>3</span>
              </div>
              <span className="text-slate-500">=</span>
              <div className="flex flex-col items-center text-amber-300">
                <span>1 × 3</span>
                <div className="w-10 h-[1px] bg-slate-600 my-0.5" />
                <span>6</span>
              </div>
              <span className="text-slate-500">+</span>
              <div className="flex flex-col items-center text-amber-300">
                <span>1 × 2</span>
                <div className="w-10 h-[1px] bg-slate-600 my-0.5" />
                <span>6</span>
              </div>
              <span className="text-slate-500">=</span>
              <div className="flex flex-col items-center text-emerald-400 font-bold animate-pulse">
                <span>5</span>
                <div className="w-4 h-[1px] bg-slate-400 my-0.5" />
                <span>6</span>
              </div>
            </div>
          </div>
        )
      };
    default:
      return {
        titulo: 'Frações Básicas',
        conceito: 'Aprenda sobre frações básicas com os mestres da ilha!',
        regra: 'Estude o conceito cuidadosamente antes de começar o desafio esportivo.',
        dica: 'As respostas corretas dão mais energia e garantem medalhas!',
        renderVisual: () => <div />
      };
  }
};

export const MinijogoScreen: React.FC<MinijogoScreenProps> = ({
  npc,
  biome,
  playerLevel,
  onVictory,
  onDefeat,
  onClose,
  onCreateExplosion,
  onShakeScreen,
}) => {
  const [bossHp, setBossHp] = useState(100);
  const [maxBossHp] = useState(100);
  const [question, setQuestion] = useState<MinigameQuestion>({ question: '' });
  const [selectedCells, setSelectedCells] = useState<boolean[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showingExplanation, setShowingExplanation] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleHeightResize = () => {
      const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      setViewportHeight(h);
    };
    handleHeightResize();
    window.addEventListener('resize', handleHeightResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleHeightResize);
    }
    return () => {
      window.removeEventListener('resize', handleHeightResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleHeightResize);
      }
    };
  }, []);

  const isShortHeight = viewportHeight < 500;

  const usedQuestionIdsRef = useRef<string[]>([]);

  // Generate a random fraction challenge based on the biome
  const generateQuestion = (): void => {
    setFeedback(null);
    if (biome === 'VILA') return;

    try {
      const q = getUniqueQuestion(biome, usedQuestionIdsRef.current);
      usedQuestionIdsRef.current.push(q.id);

      setQuestion({
        question: q.question,
        alternatives: q.alternatives,
        correctAnswerIdx: q.correctAnswerIdx,
        partesTotais: q.partesTotais,
        objetivoPintar: q.objetivoPintar,
      });

      if (q.partesTotais !== undefined) {
        setSelectedCells(new Array(q.partesTotais).fill(false));
      }
    } catch (err) {
      console.error('Error selecting unique question:', err);
    }
  };

  // Generate first question on mount and reset explanation state
  useEffect(() => {
    setShowingExplanation(true);
    generateQuestion();
  }, [biome]);

  // Handle answers
  const handleMultipleChoice = (index: number): void => {
    if (feedback) return;

    if (index === question.correctAnswerIdx) {
      handleSuccess();
    } else {
      handleFailure();
    }
  };

  const handleCellClick = (index: number): void => {
    if (feedback) return;
    Som.passo();
    setSelectedCells((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handlePintarSubmit = (): void => {
    if (feedback) return;
    const markedCount = selectedCells.filter(Boolean).length;
    
    if (markedCount === question.objetivoPintar) {
      handleSuccess();
    } else {
      handleFailure();
    }
  };

  const handleSuccess = (): void => {
    setFeedback('correct');
    Som.ataqueAcerto();
    onShakeScreen(0.4, 15);
    
    // Create green sparks
    onCreateExplosion(400, 180, '#10b981');
    onCreateExplosion(380, 160, '#34d399');
    onCreateExplosion(420, 200, '#ffffff');

    // Reduce boss HP
    const damage = 50; // 2 rounds to win
    const nextHp = Math.max(0, bossHp - damage);
    setBossHp(nextHp);

    setTimeout(() => {
      if (nextHp <= 0) {
        onVictory();
      } else {
        setCurrentRound((prev) => prev + 1);
        generateQuestion();
      }
    }, 1500);
  };

  const handleFailure = (): void => {
    setFeedback('wrong');
    Som.danoSofrido();
    onShakeScreen(0.5, 25);

    // Create red sparks
    onCreateExplosion(400, 280, '#ef4444');
    onCreateExplosion(350, 290, '#f97316');

    // Inflict damage to player
    const damage = 25;

    setTimeout(() => {
      onDefeat(damage);
      generateQuestion();
    }, 1500);
  };

  // Show the educational explanation screen if state is true
  if (showingExplanation) {
    const exp = getExplanationData(biome, npc);
    return (
      <div className="absolute inset-0 bg-slate-950/98 z-40 flex flex-col justify-between p-4 sm:p-5 overflow-y-auto select-none font-mono">
        {/* Header */}
        <div className="bg-slate-900 border-2 border-amber-500 rounded p-2.5 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded border border-red-500 flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: npc.color }}>
              {biome === 'LAVA' ? <Flame className="text-orange-500 animate-bounce" size={14} /> : npc.nome[0]}
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] text-amber-400 font-extrabold tracking-wider">{npc.nome}</div>
              <div className="text-[8px] sm:text-[9px] text-slate-400">Escola de Treinamento Fracionário</div>
            </div>
          </div>
          <div className="text-[8px] sm:text-[9px] text-emerald-400 font-bold animate-pulse">📖 APRENDENDO FRAÇÕES</div>
        </div>

        {/* Lesson Body */}
        <div className="my-auto flex flex-col items-center justify-center max-w-lg mx-auto w-full gap-3 py-1">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 sm:p-4 w-full shadow-2xl relative"
          >
            <HelpCircle size={20} className="absolute -top-3 -left-2 text-yellow-400 bg-slate-950 rounded-full p-0.5 border border-slate-800" />
            <h2 className="text-[11px] sm:text-xs font-black text-yellow-400 tracking-wider mb-2 uppercase border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
              <span>{exp.titulo}</span>
            </h2>
            
            <p className="text-slate-200 text-[9px] sm:text-[10px] leading-relaxed mb-2.5">
              {exp.conceito}
            </p>
            
            <div className="bg-slate-950/50 p-2 sm:p-2.5 rounded border border-slate-800/80 mb-2.5 text-[9px] sm:text-[10px] text-slate-300">
              <strong className="text-amber-400 block mb-0.5">Regra Prática:</strong>
              {exp.regra}
            </div>

            {/* Render dynamically designed CSS diagrams */}
            <div className="my-2.5">
              {exp.renderVisual()}
            </div>

            <div className="mt-2.5 bg-amber-500/10 border border-amber-500/20 p-2 rounded text-[8px] sm:text-[9px] text-amber-300 leading-relaxed">
              💡 <strong>Dica do Guardião:</strong> "{exp.dica}"
            </div>
          </motion.div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 justify-between items-center border-t border-slate-900 pt-2.5">
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 transition-colors font-bold text-[9px] sm:text-[10px] cursor-pointer"
          >
            [CORRER] Fugir do Combate
          </button>
          
          <button
            onClick={() => {
              Som.click();
              setShowingExplanation(false);
            }}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 active:scale-95 text-white font-bold text-[9px] sm:text-[10px] rounded border-2 border-amber-400 cursor-pointer shadow-lg hover:scale-105 tracking-wider font-mono flex items-center gap-1.5 transition-transform"
          >
            ENTENDI, JOGAR DESAFIO! ⚡
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 bg-slate-950/95 z-40 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto select-none font-mono"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Minigame Header */}
      <div className="bg-slate-900 border-2 border-amber-500 rounded p-3 flex flex-col sm:flex-row justify-between items-center shadow-lg gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border-2 border-red-500 flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: npc.color }}>
            {biome === 'LAVA' ? <Flame className="text-orange-500 animate-bounce" size={16} /> : npc.nome[0]}
          </div>
          <div>
            <div className="text-[11px] text-amber-400 font-extrabold tracking-wider">{npc.nome}</div>
            <div className="text-[9px] text-slate-400">Desafio de Esporte Fracionário (Rodada {currentRound})</div>
          </div>
        </div>

        {/* Boss HP Bar */}
        <div className="w-full sm:w-64 flex flex-col">
          <div className="flex justify-between items-center text-[9px] text-red-400 font-bold mb-1">
            <span>🔴 ENERGIA DO CAMPEÃO</span>
            <span>{bossHp}/{maxBossHp}</span>
          </div>
          <div className="w-full h-3.5 bg-slate-950 border border-slate-700 rounded-sm overflow-hidden p-[1px]">
            <div
              className="h-full bg-red-600 rounded-sm transition-all duration-300"
              style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Challenge Area */}
      <div className={`my-auto flex flex-col items-center justify-center ${isShortHeight ? 'py-2' : 'py-6'} max-w-xl mx-auto w-full`}>
        {/* Dynamic Sport Arena Widget - Hidden on short screen heights to save vertical real estate */}
        {!isShortHeight && (
          <div className="w-full mb-4">
            <SportVisual biome={biome} feedback={feedback} bossHp={bossHp} />
          </div>
        )}

        {/* Question Panel */}
        <div className={`bg-slate-900/60 border border-slate-800 rounded-lg w-full text-center relative ${isShortHeight ? 'p-3 mb-3' : 'p-5 mb-6'}`}>
          <HelpCircle size={isShortHeight ? 14 : 20} className="absolute -top-2.5 -left-2.5 text-amber-500 bg-slate-950 rounded-full" />
          <p className={`text-white leading-relaxed tracking-wide font-medium ${isShortHeight ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'}`}>
            {question.question}
          </p>
        </div>

        {/* Dynamic Answer Feedback Overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`font-black flex items-center gap-2 tracking-widest uppercase ${isShortHeight ? 'text-[10px] mb-2' : 'text-sm mb-6'} ${
                feedback === 'correct' ? 'text-emerald-400' : 'text-rose-500'
              }`}
            >
              <Sparkles size={isShortHeight ? 12 : 16} className="animate-spin" />
              {feedback === 'correct' ? '✦ ACERTO CRÍTICO! ✦' : '✖ DEFENSA FALHOU! ✖'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render interactive coloring bar */}
        {question.partesTotais !== undefined && (
          <div className={`w-full flex flex-col items-center ${isShortHeight ? 'gap-3' : 'gap-6'}`}>
            {/* Interactive Grid Bar */}
            <div className={`w-full bg-slate-950 border-2 sm:border-4 border-amber-500 rounded overflow-hidden flex ${isShortHeight ? 'h-10' : 'h-16'}`}>
              {new Array(question.partesTotais).fill(null).map((_, i) => {
                const isSelected = selectedCells[i];
                return (
                  <button
                    key={i}
                    onClick={() => handleCellClick(i)}
                    disabled={feedback !== null}
                    className={`flex-1 h-full border-r border-slate-800 last:border-none cursor-pointer transition-colors flex items-center justify-center font-bold text-[10px] sm:text-xs select-none min-h-[36px] ${
                      isSelected 
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {i + 1}/{question.partesTotais}
                  </button>
                );
              })}
            </div>

            {/* Submit spell button */}
            <button
              onClick={handlePintarSubmit}
              disabled={feedback !== null}
              className={`rounded-md font-bold text-[10px] sm:text-xs transition-all tracking-wider flex items-center gap-2 select-none ${isShortHeight ? 'py-2 px-6' : 'py-3 px-8'} ${
                feedback !== null
                  ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                  : 'bg-red-700 hover:bg-red-600 active:scale-95 text-white border-2 border-amber-400 cursor-pointer shadow-lg hover:scale-105'
              }`}
              style={{ minHeight: '44px' }}
            >
              🪄 LANÇAR FEITIÇO FRACIONÁRIO
            </button>
          </div>
        )}

        {/* Render multiple choice cards */}
        {question.alternatives && (
          <div className={`w-full flex flex-col ${isShortHeight ? 'gap-2' : 'gap-3'}`}>
            {question.alternatives.map((alt, i) => (
              <button
                key={i}
                onClick={() => handleMultipleChoice(i)}
                disabled={feedback !== null}
                className={`w-full rounded-md font-bold text-[10px] sm:text-xs text-center border-2 cursor-pointer transition-all ${isShortHeight ? 'py-2 px-4' : 'py-3.5 px-6'} ${
                  feedback !== null
                    ? 'bg-slate-900/40 border-slate-800 text-slate-600'
                    : 'bg-slate-900 border-amber-500 hover:bg-slate-800 text-slate-200 hover:text-white hover:border-white hover:scale-[1.01] active:scale-[0.99]'
                }`}
                style={{ minHeight: '44px' }}
              >
                {alt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Minigame Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-3">
        <span>Foco mental • Esporte Sagrado</span>
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-300 transition-colors font-bold select-none cursor-pointer"
        >
          [CORRER] Fugir do Combate
        </button>
      </div>
    </div>
  );
};
