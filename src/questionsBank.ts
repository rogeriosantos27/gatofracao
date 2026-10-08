/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiomeType, MinigameQuestion } from './types';

export interface BankQuestion {
  id: string;
  question: string;
  alternatives?: string[];
  correctAnswerIdx?: number;
  partesTotais?: number;
  objetivoPintar?: number;
}

export const QUESTIONS_BANK: Record<Exclude<BiomeType, 'VILA'>, BankQuestion[]> = {
  BAMBU: [
    {
      id: 'bambu_q1',
      question: "Tengu usou seu famoso 'Saque de Vento de Outono'! A raquete fez a bola girar na rotação de 12/18. Simplifique essa rotação para conseguir rebater a bola com o ângulo perfeito!",
      alternatives: ['2/3', '3/4', '1/2'],
      correctAnswerIdx: 0
    },
    {
      id: 'bambu_q2',
      question: "A torcida na mesa de bambu está animada! De 15/20 torcedores presentes, a maioria está usando máscaras de Tengu para torcer. Simplifique essa proporção de torcedores mascarados:",
      alternatives: ['3/4', '2/3', '4/5'],
      correctAnswerIdx: 0
    },
    {
      id: 'bambu_q3',
      question: "Durante uma jogada espetacular de ping pong rápido, a bola de bambu cobriu exatamente 18/24 da área útil da mesa. Qual é a fração irredutível correspondente a essa cobertura de área?",
      alternatives: ['3/4', '5/6', '2/3'],
      correctAnswerIdx: 0
    },
    {
      id: 'bambu_q4',
      question: "Tengu desafia seus reflexos enviando uma bola cortada que viaja a impressionantes 10/25 da velocidade do som! Simplifique a fração correspondente a essa velocidade supersônica:",
      alternatives: ['2/5', '1/5', '3/5'],
      correctAnswerIdx: 0
    },
    {
      id: 'bambu_q5',
      question: "Para planejar sua defesa de raquete dupla contra o Tengu, você dividiu a mesa em seções. Se seu rebote perfeito cobriu 14/21 do lado adversário, que fração simples representa essa precisão?",
      alternatives: ['2/3', '1/3', '4/7'],
      correctAnswerIdx: 0
    },
    {
      id: 'bambu_q6',
      question: "A rede de bambu da mesa de ping pong está ligeiramente desalinhada em 8/12 de milímetro. Reduza essa fração para ajustar a rede perfeitamente antes de iniciar o próximo ponto do rali!",
      alternatives: ['2/3', '3/4', '1/2'],
      correctAnswerIdx: 0
    },
    {
      id: 'bambu_q7',
      question: "O rali de ping pong foi extremamente disputado e durou exatamente 24/30 de um minuto inteiro! Simplifique esse tempo de rali para registrar seu feito heróico no templo de bambu:",
      alternatives: ['4/5', '3/5', '5/6'],
      correctAnswerIdx: 0
    },
    {
      id: 'bambu_q8',
      question: "Em uma jogada com muito efeito lateral, a bola de ping pong girou 16/32 vezes no próprio eixo antes de tocar a mesa do Tengu. Simplifique essa fração para descobrir a metade exata do efeito:",
      alternatives: ['1/2', '1/3', '2/3'],
      correctAnswerIdx: 0
    }
  ],
  NEVE: [
    {
      id: 'neve_q1',
      question: "Você e Fukuro estão escalando o 'Pico do Vento Gelado'. Dos 12 metros totais do paredão congelado, vocês já subiram 8 metros. Qual fração simplificada do paredão ainda falta escalar até o topo?",
      alternatives: ['1/3', '2/3', '1/4'],
      correctAnswerIdx: 0
    },
    {
      id: 'neve_q2',
      question: "Uma nevasca repentina cobriu o paredão de pedra! De uma trilha vertical de 15 metros, vocês venceram 5 metros com as picaretas de gelo. Que fração simplificada do caminho ainda resta sob a neve fria?",
      alternatives: ['2/3', '1/3', '1/5'],
      correctAnswerIdx: 0
    },
    {
      id: 'neve_q3',
      question: "Para escapar de um penhasco congelado de 18 metros de altura, o sábio Fukuro voa na frente marcando o caminho. Você já escalou 6 metros dele. Qual fração simplificada do percurso ainda falta conquistar?",
      alternatives: ['2/3', '1/3', '5/6'],
      correctAnswerIdx: 0
    },
    {
      id: 'neve_q4',
      question: "A rota de gelo da montanha sagrada tem 20 metros de extensão vertical. Depois de uma pausa rápida para tomar chá quente, você escalou 15 metros. Que fração irredutível ainda resta até o topo?",
      alternatives: ['1/4', '3/4', '1/2'],
      correctAnswerIdx: 0
    },
    {
      id: 'neve_q5',
      question: "Para alcançar o ninho sagrado de Fukuro, é preciso subir uma escadaria de gelo de 24 degraus gigantes. Você já subiu 18 degraus com muito esforço. Que fração de degraus faltam para o topo?",
      alternatives: ['1/4', '3/4', '1/6'],
      correctAnswerIdx: 0
    },
    {
      id: 'neve_q6',
      question: "Uma geleira brilhante de 10 metros se estende acima de você. Você crava seus grampos nos primeiros 4 metros de subida. Simplifique a fração de geleira que ainda separa você do pico!",
      alternatives: ['3/5', '2/5', '1/2'],
      correctAnswerIdx: 0
    },
    {
      id: 'neve_q7',
      question: "O grande pilar de neve firme mede 16 metros de altura. Com a corda de segurança presa, você escala os primeiros 12 metros com muita agilidade. Qual fração simples do pilar ainda resta subir?",
      alternatives: ['1/4', '3/4', '1/2'],
      correctAnswerIdx: 0
    },
    {
      id: 'neve_q8',
      question: "Na subida final da Montanha do Trovão de Neve, com 30 metros de altura, você atinge a cansativa marca dos 10 metros. Qual fração irredutível do paredão separa você da vitória gloriosa?",
      alternatives: ['2/3', '1/3', '3/5'],
      correctAnswerIdx: 0
    }
  ],
  LAGO_LOTUS: [
    {
      id: 'lotus_q1',
      question: "Mira firme com Yoichi! Para acertar a maçã flutuante no topo do santuário, você precisa disparar um tiro preciso. Quanto vale a metade da fração de 3/4 do vento lateral?",
      alternatives: ['3/8', '3/4', '6/4'],
      correctAnswerIdx: 0
    },
    {
      id: 'lotus_q2',
      question: "O arco de Yoichi foi tensionado em 2/3 de sua força máxima. No entanto, para o tiro parabólico sobre a água, você deve usar apenas a metade dessa tensão. Quanto vale essa nova fração de força?",
      alternatives: ['1/3', '1/4', '2/5'],
      correctAnswerIdx: 0
    },
    {
      id: 'lotus_q3',
      question: "Um alvo flutuante de lótus está posicionado a uma distância de 4/5 de um quilômetro. Você decide disparar na terça parte dessa distância para aquecer os braços. Qual é essa nova fração simplificada?",
      alternatives: ['4/15', '4/5', '12/5'],
      correctAnswerIdx: 0
    },
    {
      id: 'lotus_q4',
      question: "Uma rajada de vento afeta o voo do arco de Yoichi em 3/5 de segundo. Se você disparar na quarta parte desse tempo de rajada, evitará o desvio de vento. Qual fração representa esse instante perfeito?",
      alternatives: ['3/20', '3/5', '12/5'],
      correctAnswerIdx: 0
    },
    {
      id: 'lotus_q5',
      question: "A flecha dourada de Yoichi consome 5/8 de energia mágica do templo a cada disparo. Você quer usar uma flecha de treino que gaste apenas a metade dessa quantidade. Quanto de energia ela consome?",
      alternatives: ['5/16', '5/8', '10/8'],
      correctAnswerIdx: 0
    },
    {
      id: 'lotus_q6',
      question: "O grande arqueiro dividiu o alvo de lótus em setores. O setor dourado central ocupa 1/3 do alvo, e a área perfeita para pontuação máxima é a terça parte desse setor dourado. Qual fração do alvo ela representa?",
      alternatives: ['1/9', '1/3', '1/6'],
      correctAnswerIdx: 0
    },
    {
      id: 'lotus_q7',
      question: "Para competir no prestigiado torneio do Lago de Lótus, você precisa de 7/10 de aprovação nos testes do Yoichi. No primeiro dia de treino, você cumpre a metade dessa meta. Que fração total da aprovação você conquistou?",
      alternatives: ['7/20', '7/10', '14/10'],
      correctAnswerIdx: 0
    },
    {
      id: 'lotus_q8',
      question: "Um belo lago coberto de flores de lótus ocupa 5/6 da área do santuário. Yoichi quer treinar tiro rápido em uma área limpa correspondente a exatamente a terça parte do lago. Qual fração representa essa área?",
      alternatives: ['5/18', '5/6', '15/6'],
      correctAnswerIdx: 0
    }
  ],
  PALACIO_AGUA: [
    {
      id: 'agua_q1',
      question: "Nado sincronizado com as sereias! Para alinhar as nadadoras em um círculo concêntrico perfeito sob as ondas, pinte exatamente a proporção de 3/5 da barra de coreografia aquática:",
      partesTotais: 5,
      objetivoPintar: 3
    },
    {
      id: 'agua_q2',
      question: "A imperatriz Otohime pede sincronia absoluta de toda a corte! Calibre o nível das conchas dançantes marcando a fração exata de 4/7 na barra de pressão d'água:",
      partesTotais: 7,
      objetivoPintar: 4
    },
    {
      id: 'agua_q3',
      question: "Para o espetacular salto duplo sincronizado que encanta o palácio, as atletas precisam de exatamente 5/8 de impulso. Pinte essa fração na barra de energia de salto:",
      partesTotais: 8,
      objetivoPintar: 5
    },
    {
      id: 'agua_q4',
      question: "O grande espetáculo de golfinhos azuis do palácio começou! Pinte a barra na proporção de 2/6 para sincronizar o mergulho dos animais com a harpa imperial:",
      partesTotais: 6,
      objetivoPintar: 2
    },
    {
      id: 'agua_q5',
      question: "O coral místico submarino emite luzes coloridas mágicas! Para ativar a bela iluminação das Sereias do Palácio de Água, preencha exatamente a fração de 6/10 da barra de coral:",
      partesTotais: 10,
      objetivoPintar: 6
    },
    {
      id: 'agua_q6',
      question: "Otohime realiza seu giro espiral aquático! Para manter o equilíbrio perfeito na coreografia aquática, regule a barra marcando exatamente 3/4 da capacidade total de fluxo:",
      partesTotais: 4,
      objetivoPintar: 3
    },
    {
      id: 'agua_q7',
      question: "O rali de nado sob as ondas azuis exige um fôlego muito controlado. Pinte a proporção de 7/12 na barra de oxigênio para que as nadadoras finalizem a pose artística em perfeita harmonia:",
      partesTotais: 12,
      objetivoPintar: 7
    },
    {
      id: 'agua_q8',
      question: "As belas marés do palácio batem ritmicamente. Sintonize as marés flutuantes do palácio preenchendo exatamente a proporção de 5/9 da barra de equilíbrio das águas:",
      partesTotais: 9,
      objetivoPintar: 5
    }
  ],
  CIDADE_SKATE: [
    {
      id: 'skate_q1',
      question: "Você executou um giro incrível de 90° (um quarto de volta) sobre o corrimão de aço da Cidade do Skate! Que fração simplificada de uma volta completa de 360° essa manobra radical representa?",
      alternatives: ['1/4', '1/2', '1/3'],
      correctAnswerIdx: 0
    },
    {
      id: 'skate_q2',
      question: "Tanuki mandou um giro espetacular de 180° no ar, mudando de direção no halfpipe! Que fração reduzida e simplificada de um giro completo de 360° corresponde a essa manobra?",
      alternatives: ['1/2', '1/4', '2/3'],
      correctAnswerIdx: 0
    },
    {
      id: 'skate_q3',
      question: "Para ganhar a nota máxima dos jurízes na Cidade do Skate, você executa um salto com rotação de 270°. Qual fração irredutível de uma rotação completa de 360° essa manobra representa?",
      alternatives: ['3/4', '2/3', '5/6'],
      correctAnswerIdx: 0
    },
    {
      id: 'skate_q4',
      question: "Manobra secreta do skate urbano! Você rotacionou o skate em um slide preciso no asfalto girando exatamente 60°. Qual é a fração simplificada correspondente a esse giro parcial em relação ao círculo de 360°?",
      alternatives: ['1/6', '1/5', '1/8'],
      correctAnswerIdx: 0
    },
    {
      id: 'skate_q5',
      question: "Impressionante! Com muita velocidade acumulada na rampa de skate, você realiza uma rotação de 120° com o shape no ar. Simplifique a fração correspondente a esse belo giro parcial:",
      alternatives: ['1/3', '1/4', '2/5'],
      correctAnswerIdx: 0
    },
    {
      id: 'skate_q6',
      question: "Um pequeno ajuste no ângulo das rodinhas do seu skate em 30° pode melhorar muito sua estabilidade nas descidas. Qual fração simples de uma volta inteira esse pequeno ângulo representa?",
      alternatives: ['1/12', '1/10', '1/8'],
      correctAnswerIdx: 0
    },
    {
      id: 'skate_q7',
      question: "Giro ousado e perigoso no topo do corrimão! Você girou 240° antes de pousar perfeitamente com o skate na calçada. Simplifique a proporção dessa rotação em relação aos 360° de uma volta completa:",
      alternatives: ['2/3', '3/4', '1/3'],
      correctAnswerIdx: 0
    },
    {
      id: 'skate_q8',
      question: "Tanuki desafia você a executar um 'Tailslide' girando exatamente 45° no ar para escapar de um bueiro aberto. Qual fração simples de uma rotação total de 360° você realizou?",
      alternatives: ['1/8', '1/6', '1/4'],
      correctAnswerIdx: 0
    }
  ],
  DESERTO: [
    {
      id: 'deserto_q1',
      question: "Ajude Kijimuna na Maratona de Areia! Na primeira etapa ele correu 3/10 da pista, e na segunda etapa correu mais 4/10 sob o sol forte. Calcule a soma (3/10 + 4/10) e pinte o total na barra de areia:",
      partesTotais: 10,
      objetivoPintar: 7
    },
    {
      id: 'deserto_q2',
      question: "Corrida sob o sol escaldante do deserto! Kijimuna tinha abastecido 7/8 de sua garrafa d'água, mas bebeu 3/8 durante o sprint inicial. Calcule a diferença (7/8 - 3/8) e pinte a água que restou:",
      partesTotais: 8,
      objetivoPintar: 4
    },
    {
      id: 'deserto_q3',
      question: "Um vendaval de areia cobriu as marcas da pista de corrida! Para recuperar o trajeto, Kijimuna junta dois pedaços de mapas que cobrem 2/7 e 3/7 da rota. Calcule a soma total dos mapas (2/7 + 3/7) e marque na barra:",
      partesTotais: 7,
      objetivoPintar: 5
    },
    {
      id: 'deserto_q4',
      question: "Obstáculos de cactos gigantes bloqueiam o caminho do maratonista! Kijimuna planejou saltar 5/6 da pista para desviar, mas só conseguiu saltar 2/6. Calcule a diferença (5/6 - 2/6) e pinte o trecho restante na barra:",
      partesTotais: 6,
      objetivoPintar: 3
    },
    {
      id: 'deserto_q5',
      question: "A grande maratona de areia está dividida em etapas iguais. Se Kijimuna avançou 4/9 da distância no primeiro dia e 1/9 no segundo dia, qual é o progresso total? Some (4/9 + 1/9) e marque na barra:",
      partesTotais: 9,
      objetivoPintar: 5
    },
    {
      id: 'deserto_q6',
      question: "Kijimuna está correndo em dunas de areia muito fina! Ele precisa subir 5/5 de uma duna vertical, mas escorregou para trás o equivalente a 2/5 dela. Calcule a diferença (5/5 - 2/5) e marque a duna conquistada na barra:",
      partesTotais: 5,
      objetivoPintar: 3
    },
    {
      id: 'deserto_q7',
      question: "Para cruzar o oásis sagrado no meio das dunas, o corredor precisa completar a trilha de palmeiras. Ele já percorreu 1/12 da trilha e seu parceiro cobriu 6/12. Some os percursos (1/12 + 6/12) e pinte na barra:",
      partesTotais: 12,
      objetivoPintar: 7
    },
    {
      id: 'deserto_q8',
      question: "Cuidado com o calor intenso do deserto! A barra de resistência do atleta estava em 9/11 de energia, mas o trecho rochoso consumiu 4/11. Calcule a resistência atual do Kijimuna (9/11 - 4/11) e pinte na barra:",
      partesTotais: 11,
      objetivoPintar: 5
    }
  ],
  LAVA: [
    {
      id: 'lava_q1',
      question: "CONFRONTO DO ONI DE LAVA! Para furar o bloqueio defensivo pesado do rugby vulcânico, calcule a soma das táticas de ataque: 1/2 + 1/3. Qual é a fração resultante simplificada?",
      alternatives: ['5/6', '2/5', '1/6'],
      correctAnswerIdx: 0
    },
    {
      id: 'lava_q2',
      question: "O Oni Supremo lança uma onda de calor! Para criar uma barreira de proteção de rugby que resista ao fogo do magma, some as forças mágicas de terra e água: 1/4 + 1/3. Qual fração representa esse escudo?",
      alternatives: ['7/12', '2/7', '5/12'],
      correctAnswerIdx: 0
    },
    {
      id: 'lava_q3',
      question: "Passe tático rápido de rugby de lava! Um passe longo cobre 2/3 da largura do campo, e o segundo avanço em diagonal cobre mais 1/5. Some esses avanços (2/3 + 1/5) para planejar o touchdown do time:",
      alternatives: ['13/15', '3/8', '11/15'],
      correctAnswerIdx: 0
    },
    {
      id: 'lava_q4',
      question: "A armadura mística do Oni Supremo se alimenta de calor vulcânico. Você lança duas runas de gelo que neutralizam 1/2 e 1/5 dessa energia. Some as forças das runas (1/2 + 1/5) para desestabilizar o Oni:",
      alternatives: ['7/10', '2/7', '3/10'],
      correctAnswerIdx: 0
    },
    {
      id: 'lava_q5',
      question: "Rugby tático extremo! Para vencer a espessa barreira de magma, as nadadeiras de rugby correm 1/4 do campo na grama e mais 2/5 na rocha firme. Some essas distâncias (1/4 + 2/5) para registrar o avanço total:",
      alternatives: ['13/20', '3/9', '11/20'],
      correctAnswerIdx: 0
    },
    {
      id: 'lava_q6',
      question: "O vulcão ruge e lança fumaça e pedras incandescentes! Para desviar das cinzas, o time de rugby divide-se em duas rotas cobrindo 1/6 e 1/2 do campo seguro. Some essas rotas (1/6 + 1/2) na sua forma mais simples:",
      alternatives: ['2/3', '2/8', '5/6'],
      correctAnswerIdx: 0
    },
    {
      id: 'lava_q7',
      question: "O Oni Supremo tenta derrubar você com um tackle vulcânico pesado! Você desvia combinando saltos ágeis que cobrem 3/8 e 1/4 de segundo. Calcule a soma simplificada desses tempos de reação (3/8 + 1/4):",
      alternatives: ['5/8', '4/12', '1/2'],
      correctAnswerIdx: 0
    },
    {
      id: 'lava_q8',
      question: "Tudo ou nada na cratera vulcânica de lava! A jogada final de vitória exige passes rápidos que duram exatamente 1/3 e 1/5 de minuto. Calcule o tempo total somando essas frações (1/3 + 1/5) para derrotar o Oni de vez!",
      alternatives: ['8/15', '2/8', '7/15'],
      correctAnswerIdx: 0
    }
  ]
};

// Helper function to calculate Greatest Common Divisor
const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
};

// Helper function to simplify a fraction
const simplify = (num: number, den: number): [number, number] => {
  const d = gcd(num, den);
  return [num / d, den / d];
};

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Procedural generator for BAMBU (Tengu) - Fraction Simplification
function generateBambuQuestion(): BankQuestion {
  const simpleFractions = [
    { num: 1, den: 2 },
    { num: 1, den: 3 },
    { num: 2, den: 3 },
    { num: 1, den: 4 },
    { num: 3, den: 4 },
    { num: 1, den: 5 },
    { num: 2, den: 5 },
    { num: 3, den: 5 },
    { num: 4, den: 5 },
    { num: 1, den: 6 },
    { num: 5, den: 6 },
    { num: 3, den: 10 },
    { num: 7, den: 10 }
  ];
  const base = simpleFractions[Math.floor(Math.random() * simpleFractions.length)];
  const multiplier = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, or 5
  const bigNum = base.num * multiplier;
  const bigDen = base.den * multiplier;

  const correctStr = `${base.num}/${base.den}`;
  
  const wrongOptionsSet = new Set<string>();
  while (wrongOptionsSet.size < 2) {
    const wBase = simpleFractions[Math.floor(Math.random() * simpleFractions.length)];
    const wStr = `${wBase.num}/${wBase.den}`;
    if (wStr !== correctStr) {
      wrongOptionsSet.add(wStr);
    }
  }
  const wrongOptions = Array.from(wrongOptionsSet);

  const alternatives = [correctStr, wrongOptions[0], wrongOptions[1]];
  const shuffled = shuffleArray(alternatives);
  const correctAnswerIdx = shuffled.indexOf(correctStr);

  const questionTexts = [
    `Tengu usou seu famoso 'Saque de Vento de Outono'! A raquete fez a bola girar na rotação de ${bigNum}/${bigDen}. Simplifique essa rotação para conseguir rebater a bola com o ângulo perfeito!`,
    `A torcida na mesa de bambu está animada! De ${bigNum}/${bigDen} torcedores presentes, a maioria está usando máscaras de Tengu para torcer. Simplifique essa proporção de torcedores mascarados:`,
    `Durante uma jogada espetacular de ping pong rápido, a bola de bambu cobriu exatamente ${bigNum}/${bigDen} da área útil da mesa. Qual é a fração irredutível correspondente a essa cobertura de área?`,
    `Tengu desafia seus reflexos enviando uma bola cortada que viaja a impressionantes ${bigNum}/${bigDen} da velocidade do som! Simplifique a fração correspondente a essa velocidade supersônica:`,
    `Para planejar sua defesa de raquete dupla contra o Tengu, você dividiu a mesa em seções. Se seu rebote perfeito cobriu ${bigNum}/${bigDen} do lado adversário, que fração simples representa essa precisão?`,
    `A rede de bambu da mesa de ping pong está ligeiramente desalinhada em ${bigNum}/${bigDen} de milímetro. Reduza essa fração para ajustar a rede perfeitamente antes de iniciar o próximo ponto do rali!`,
    `O rali de ping pong foi extremamente disputado e durou exatamente ${bigNum}/${bigDen} de um minuto inteiro! Simplifique esse tempo de rali para registrar seu feito heróico no templo de bambu:`,
    `Em uma jogada com muito efeito lateral, a bola de ping pong girou ${bigNum}/${bigDen} vezes no próprio eixo antes de tocar a mesa do Tengu. Simplifique essa fração para descobrir a metade exata do efeito:`
  ];

  const text = questionTexts[Math.floor(Math.random() * questionTexts.length)];

  return {
    id: `bambu_dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    question: text,
    alternatives: shuffled,
    correctAnswerIdx
  };
}

// Procedural generator for NEVE (Fukuro) - Complementary Fraction (Distance left)
function generateNeveQuestion(): BankQuestion {
  const remainingFractions = [
    { num: 1, den: 3 },
    { num: 2, den: 3 },
    { num: 1, den: 4 },
    { num: 3, den: 4 },
    { num: 1, den: 2 },
    { num: 1, den: 5 },
    { num: 2, den: 5 },
    { num: 3, den: 5 },
    { num: 4, den: 5 },
    { num: 1, den: 6 },
    { num: 5, den: 6 }
  ];
  
  const base = remainingFractions[Math.floor(Math.random() * remainingFractions.length)];
  const multiplier = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, or 5
  const totalHeight = base.den * multiplier;
  const remainingHeight = base.num * multiplier;
  const climbedHeight = totalHeight - remainingHeight;

  const correctStr = `${base.num}/${base.den}`;

  const wrongOptionsSet = new Set<string>();
  while (wrongOptionsSet.size < 2) {
    const wBase = remainingFractions[Math.floor(Math.random() * remainingFractions.length)];
    const wStr = `${wBase.num}/${wBase.den}`;
    if (wStr !== correctStr) {
      wrongOptionsSet.add(wStr);
    }
  }
  const wrongOptions = Array.from(wrongOptionsSet);

  const alternatives = [correctStr, wrongOptions[0], wrongOptions[1]];
  const shuffled = shuffleArray(alternatives);
  const correctAnswerIdx = shuffled.indexOf(correctStr);

  const questionTexts = [
    `Você e Fukuro estão escalando o 'Pico do Vento Gelado'. Dos ${totalHeight} metros totais do paredão congelado, vocês já subiram ${climbedHeight} metros. Qual fração simplificada do paredão ainda falta escalar até o topo?`,
    `Uma nevasca repentina cobriu o paredão de pedra! De uma trilha vertical de ${totalHeight} metros, vocês venceram ${climbedHeight} metros com as picaretas de gelo. Que fração simplificada do caminho ainda resta sob a neve fria?`,
    `Para escapar de um penhasco congelado de ${totalHeight} metros de altura, o sábio Fukuro voa na frente marcando o caminho. Você já escalou ${climbedHeight} metros dele. Qual fração simplificada do percurso ainda falta conquistar?`,
    `A rota de gelo da montanha sagrada tem ${totalHeight} metros de extensão vertical. Depois de uma pausa rápida para tomar chá quente, você escalou ${climbedHeight} metros. Que fração irredutível ainda resta até o topo?`,
    `Para alcançar o ninho sagrado de Fukuro, é preciso subir uma escadaria de gelo de ${totalHeight} degraus gigantes. Você já subiu ${climbedHeight} degraus com muito esforço. Que fração de degraus faltam para o topo?`,
    `Uma geleira brilhante de ${totalHeight} metros se estende acima de você. Você crava seus grampos nos primeiros ${climbedHeight} metros de subida. Simplifique a fração de geleira que ainda separa você do pico!`,
    `O grande pilar de neve firme mede ${totalHeight} metros de altura. Com a corda de segurança presa, você escala os primeiros ${climbedHeight} metros com muita agilidade. Qual fração simples do pilar ainda resta subir?`
  ];

  const text = questionTexts[Math.floor(Math.random() * questionTexts.length)];

  return {
    id: `neve_dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    question: text,
    alternatives: shuffled,
    correctAnswerIdx
  };
}

// Procedural generator for LAGO LOTUS (Yoichi) - Multiplication (Fraction of a fraction)
function generateLotusQuestion(): BankQuestion {
  const baseFractions = [
    { num: 1, den: 2 },
    { num: 3, den: 4 },
    { num: 2, den: 3 },
    { num: 4, den: 5 },
    { num: 3, den: 5 },
    { num: 5, den: 8 },
    { num: 7, den: 10 },
    { num: 5, den: 6 }
  ];

  const base = baseFractions[Math.floor(Math.random() * baseFractions.length)];
  const divisor = Math.random() > 0.5 ? 2 : 3;
  const divisorWord = divisor === 2 ? 'metade' : 'terça parte';

  const [resNum, resDen] = simplify(base.num, base.den * divisor);
  const correctStr = `${resNum}/${resDen}`;

  const wrongOptionsSet = new Set<string>();
  wrongOptionsSet.add(`${base.num}/${base.den}`); // Unchanged error
  
  // Multiply numerator instead of denominator error
  const [wNum, wDen] = simplify(base.num * divisor, base.den);
  const wStr = `${wNum}/${wDen}`;
  if (wStr !== correctStr) {
    wrongOptionsSet.add(wStr);
  }
  
  while (wrongOptionsSet.size < 2) {
    const randomDen = [6, 8, 9, 12, 15, 16, 20, 24, 30][Math.floor(Math.random() * 9)];
    const randomNum = Math.floor(Math.random() * (randomDen - 1)) + 1;
    const [rwNum, rwDen] = simplify(randomNum, randomDen);
    const rwStr = `${rwNum}/${rwDen}`;
    if (rwStr !== correctStr) {
      wrongOptionsSet.add(rwStr);
    }
  }

  const wrongOptions = Array.from(wrongOptionsSet);
  const alternatives = [correctStr, wrongOptions[0], wrongOptions[1]];
  const shuffled = shuffleArray(alternatives);
  const correctAnswerIdx = shuffled.indexOf(correctStr);

  const questionTexts = [
    `Mira firme com Yoichi! Para acertar a maçã flutuante no topo do santuário, você precisa disparar um tiro preciso. Quanto vale a ${divisorWord} da fração de ${base.num}/${base.den} do vento lateral?`,
    `O arco de Yoichi foi tensionado em ${base.num}/${base.den} de sua força máxima. No entanto, para o tiro parabólico sobre a água, você deve usar apenas a ${divisorWord} dessa tensão. Quanto vale essa nova fração de força?`,
    `Um alvo flutuante de lótus está posicionado a uma distância de ${base.num}/${base.den} de um quilômetro. Você decide disparar na ${divisorWord} dessa distância para aquecer os braços. Qual é essa nova fração simplificada?`,
    `Uma rajada de vento afeta o voo do arco de Yoichi em ${base.num}/${base.den} de segundo. Se você disparar na ${divisorWord} desse tempo de rajada, evitará o desvio de vento. Qual fração representa esse instante perfeito?`,
    `A flecha dourada de Yoichi consome ${base.num}/${base.den} de energia mágica do templo a cada disparo. Você quer usar uma flecha de treino que gaste apenas a ${divisorWord} dessa quantidade. Quanto de energia ela consome?`,
    `O grande arqueiro dividiu o alvo de lótus em setores. O setor dourado central ocupa ${base.num}/${base.den} do alvo, e a área perfeita para pontuação máxima é a ${divisorWord} desse setor dourado. Qual fração do alvo ela representa?`,
    `Para competir no prestigiado torneio do Lago de Lótus, você precisa de ${base.num}/${base.den} de aprovação nos testes do Yoichi. No primeiro dia de treino, você cumpre a ${divisorWord} dessa meta. Que fração total da aprovação você conquistou?`
  ];

  const text = questionTexts[Math.floor(Math.random() * questionTexts.length)];

  return {
    id: `lotus_dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    question: text,
    alternatives: shuffled,
    correctAnswerIdx
  };
}

// Procedural generator for PALACIO AGUA (Otohime) - Painting representation
function generateAguaQuestion(): BankQuestion {
  const parts = Math.floor(Math.random() * 8) + 4; // 4 to 11
  const paint = Math.floor(Math.random() * (parts - 2)) + 2; // 2 to parts-1

  const questionTexts = [
    `Nado sincronizado com as sereias! Para alinhar as nadadoras em um círculo concêntrico perfeito sob as ondas, pinte exatamente a proporção de ${paint}/${parts} da barra de coreografia aquática:`,
    `A imperatriz Otohime pede sincronia absoluta de toda a corte! Calibre o nível das conchas dançantes marcando a fração exata de ${paint}/${parts} na barra de pressão d'água:`,
    `Para o espetacular salto duplo sincronizado que encanta o palácio, as atletas precisam de exatamente ${paint}/${parts} de impulso. Pinte essa fração na barra de energia de salto:`,
    `O grande espetáculo de golfinhos azuis do palácio começou! Pinte a barra na proporção de ${paint}/${parts} para sincronizar o mergulho dos animais com a harpa imperial:`,
    `O coral místico submarino emite luzes coloridas mágicas! Para ativar a bela iluminação das Sereias do Palácio de Água, preencha exatamente a fração de ${paint}/${parts} da barra de coral:`,
    `Otohime realiza seu giro espiral aquático! Para manter o equilíbrio perfeito na coreografia aquática, regule a barra marcando exatamente ${paint}/${parts} da capacidade total de fluxo:`,
    `O rali de nado sob as ondas azuis exige um fôlego muito controlado. Pinte a proporção de ${paint}/${parts} na barra de oxigênio para que as nadadoras finalizem a pose artística em perfeita harmonia:`,
    `As belas marés do palácio batem ritmicamente. Sintonize as marés flutuantes do palácio preenchendo exatamente a proporção de ${paint}/${parts} da barra de equilíbrio das águas:`
  ];

  const text = questionTexts[Math.floor(Math.random() * questionTexts.length)];

  return {
    id: `agua_dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    question: text,
    partesTotais: parts,
    objetivoPintar: paint
  };
}

// Procedural generator for CIDADE SKATE (Tanuki) - Angle to Fraction Conversion
function generateSkateQuestion(): BankQuestion {
  const angles = [
    { deg: 30, num: 1, den: 12 },
    { deg: 45, num: 1, den: 8 },
    { deg: 60, num: 1, den: 6 },
    { deg: 90, num: 1, den: 4 },
    { deg: 120, num: 1, den: 3 },
    { deg: 135, num: 3, den: 8 },
    { deg: 150, num: 5, den: 12 },
    { deg: 180, num: 1, den: 2 },
    { deg: 210, num: 7, den: 12 },
    { deg: 240, num: 2, den: 3 },
    { deg: 270, num: 3, den: 4 },
    { deg: 300, num: 5, den: 6 },
    { deg: 315, num: 7, den: 8 },
    { deg: 330, num: 11, den: 12 }
  ];

  const choice = angles[Math.floor(Math.random() * angles.length)];
  const correctStr = `${choice.num}/${choice.den}`;

  const wrongOptionsSet = new Set<string>();
  while (wrongOptionsSet.size < 2) {
    const wChoice = angles[Math.floor(Math.random() * angles.length)];
    const wStr = `${wChoice.num}/${wChoice.den}`;
    if (wStr !== correctStr) {
      wrongOptionsSet.add(wStr);
    }
  }
  const wrongOptions = Array.from(wrongOptionsSet);
  const alternatives = [correctStr, wrongOptions[0], wrongOptions[1]];
  const shuffled = shuffleArray(alternatives);
  const correctAnswerIdx = shuffled.indexOf(correctStr);

  const questionTexts = [
    `Você executou um giro incrível de ${choice.deg}° (um quarto de volta) sobre o corrimão de aço da Cidade do Skate! Que fração simplificada de uma volta completa de 360° essa manobra radical representa?`,
    `Tanuki mandou um giro espetacular de ${choice.deg}° no ar, mudando de direção no halfpipe! Que fração reduzida e simplificada de um giro completo de 360° corresponde a essa manobra?`,
    `Para ganhar a nota máxima dos jurízes na Cidade do Skate, você executa um salto com rotação de ${choice.deg}°. Qual fração irredutível de uma rotação completa de 360° essa manobra representa?`,
    `Manobra secreta do skate urbano! Você rotacionou o skate em um slide preciso no asfalto girando exatamente ${choice.deg}°. Qual é a fração simplificada correspondente a esse giro parcial em relação ao círculo de 360°?`,
    `Impressionante! Com muita velocidade acumulada na rampa de skate, você realiza uma rotação de ${choice.deg}° com o shape no ar. Simplifique a fração correspondente a esse belo giro parcial:`,
    `Um pequeno ajuste no ângulo das rodinhas do seu skate em ${choice.deg}° pode melhorar muito sua estabilidade nas descidas. Qual fração simples de uma volta inteira esse pequeno ângulo representa?`,
    `Giro ousado e perigoso no topo do corrimão! Você girou ${choice.deg}° antes de pousar perfeitamente com o skate na calçada. Simplifique a proporção dessa rotação em relação aos 360° de uma volta completa:`
  ];

  const text = questionTexts[Math.floor(Math.random() * questionTexts.length)];

  return {
    id: `skate_dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    question: text,
    alternatives: shuffled,
    correctAnswerIdx
  };
}

// Procedural generator for DESERTO (Kijimuna) - Addition & Subtraction of like fractions
function generateDesertoQuestion(): BankQuestion {
  const isAddition = Math.random() > 0.5;
  const den = Math.floor(Math.random() * 6) + 5; // 5 to 10

  if (isAddition) {
    const a1 = Math.floor(Math.random() * 3) + 1; // 1 to 3
    const a2 = Math.floor(Math.random() * 3) + 1; // 1 to 3
    const sum = a1 + a2;
    const finalSum = sum >= den ? den - 1 : sum;
    const finalA2 = Math.max(1, finalSum - a1);
    const finalA1 = finalSum - finalA2;

    const questionTexts = [
      `Ajude Kijimuna na Maratona de Areia! Na primeira etapa ele correu ${finalA1}/${den} da pista, e na segunda etapa correu mais ${finalA2}/${den} sob o sol forte. Calcule a soma (${finalA1}/${den} + ${finalA2}/${den}) e pinte o total na barra de areia:`,
      `Um vendaval de areia cobriu as marcas da pista de corrida! Para recuperar o trajeto, Kijimuna junta dois pedaços de mapas que cobrem ${finalA1}/${den} e ${finalA2}/${den} da rota. Calcule a soma total dos mapas (${finalA1}/${den} + ${finalA2}/${den}) e marque na barra:`,
      `A grande maratona de areia está dividida em etapas iguais. Se Kijimuna avançou ${finalA1}/${den} da distância no primeiro dia e ${finalA2}/${den} no segundo dia, qual é o progresso total? Some (${finalA1}/${den} + ${finalA2}/${den}) e marque na barra:`,
      `Para cruzar o oásis sagrado no meio das dunas, o corredor precisa completar a trilha de palmeiras. Ele já percorreu ${finalA1}/${den} da trilha e seu parceiro cobriu ${finalA2}/${den}. Some os percursos (${finalA1}/${den} + ${finalA2}/${den}) e pinte na barra:`
    ];

    const text = questionTexts[Math.floor(Math.random() * questionTexts.length)];

    return {
      id: `deserto_dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      question: text,
      partesTotais: den,
      objetivoPintar: finalA1 + finalA2
    };
  } else {
    const a1 = Math.floor(Math.random() * 4) + 4; // 4 to 7
    const a2 = Math.floor(Math.random() * 3) + 1; // 1 to 3
    const finalA1 = a1 > den ? den : a1;
    const finalA2 = a2 >= finalA1 ? finalA1 - 1 : a2;

    const questionTexts = [
      `Corrida sob o sol escaldante do deserto! Kijimuna tinha abastecido ${finalA1}/${den} de sua garrafa d'água, mas bebeu ${finalA2}/${den} durante o sprint inicial. Calcule a diferença (${finalA1}/${den} - ${finalA2}/${den}) e pinte a água que restou:`,
      `Obstáculos de cactos gigantes bloqueiam o caminho do maratonista! Kijimuna planejou saltar ${finalA1}/${den} da pista para desviar, mas só conseguiu saltar ${finalA2}/${den}. Calcule a diferença (${finalA1}/${den} - ${finalA2}/${den}) e pinte o trecho restante na barra:`,
      `Kijimuna está correndo em dunas de areia muito fina! Ele subiu ${finalA1}/${den} de uma duna vertical, mas escorregou para trás o equivalente a ${finalA2}/${den} dela. Calcule a diferença (${finalA1}/${den} - ${finalA2}/${den}) e marque a duna conquistada na barra:`,
      `Cuidado com o calor intenso do deserto! A barra de resistência do atleta estava em ${finalA1}/${den} de energia, mas o trecho rochoso consumiu ${finalA2}/${den}. Calcule a resistência atual do Kijimuna (${finalA1}/${den} - ${finalA2}/${den}) e pinte na barra:`
    ];

    const text = questionTexts[Math.floor(Math.random() * questionTexts.length)];

    return {
      id: `deserto_dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      question: text,
      partesTotais: den,
      objetivoPintar: finalA1 - finalA2
    };
  }
}

// Procedural generator for LAVA (Oni Supremo) - Fractions addition with MMC (different denominators)
function generateLavaQuestion(): BankQuestion {
  const options = [
    { n1: 1, d1: 2, n2: 1, d2: 3, sumN: 5, sumD: 6 },   // 1/2 + 1/3 = 5/6
    { n1: 1, d1: 2, n2: 1, d2: 4, sumN: 3, sumD: 4 },   // 1/2 + 1/4 = 3/4
    { n1: 1, d1: 2, n2: 1, d2: 5, sumN: 7, sumD: 10 },  // 1/2 + 1/5 = 7/10
    { n1: 1, d1: 3, n2: 1, d2: 4, sumN: 7, sumD: 12 },  // 1/3 + 1/4 = 7/12
    { n1: 1, d1: 3, n2: 1, d2: 5, sumN: 8, sumD: 15 },  // 1/3 + 1/5 = 8/15
    { n1: 1, d1: 4, n2: 1, d2: 5, sumN: 9, sumD: 20 },  // 1/4 + 1/5 = 9/20
    { n1: 1, d1: 2, n2: 2, d2: 5, sumN: 9, sumD: 10 },  // 1/2 + 2/5 = 9/10
    { n1: 1, d1: 3, n2: 2, d2: 5, sumN: 11, sumD: 15 }, // 1/3 + 2/5 = 11/15
    { n1: 2, d1: 3, n2: 1, d2: 5, sumN: 13, sumD: 15 }, // 2/3 + 1/5 = 13/15
    { n1: 1, d1: 4, n2: 2, d2: 5, sumN: 13, sumD: 20 }, // 1/4 + 2/5 = 13/20
    { n1: 1, d1: 2, n2: 1, d2: 6, sumN: 2, sumD: 3 },   // 1/2 + 1/6 = 2/3
    { n1: 1, d1: 3, n2: 1, d2: 6, sumN: 1, sumD: 2 },   // 1/3 + 1/6 = 1/2
    { n1: 1, d1: 3, n2: 2, d2: 6, sumN: 2, sumD: 3 }    // 1/3 + 2/6 = 2/3
  ];

  const choice = options[Math.floor(Math.random() * options.length)];
  const correctStr = `${choice.sumN}/${choice.sumD}`;

  // Common direct-sum mistake (numerator sum / denominator sum)
  const [mistakeN, mistakeD] = simplify(choice.n1 + choice.n2, choice.d1 + choice.d2);
  const mistakeStr = `${mistakeN}/${mistakeD}`;

  const wrongOptionsSet = new Set<string>();
  if (mistakeStr !== correctStr) {
    wrongOptionsSet.add(mistakeStr);
  }

  while (wrongOptionsSet.size < 2) {
    const wChoice = options[Math.floor(Math.random() * options.length)];
    const wStr = `${wChoice.sumN}/${wChoice.sumD}`;
    if (wStr !== correctStr) {
      wrongOptionsSet.add(wStr);
    }
  }

  const wrongOptions = Array.from(wrongOptionsSet);
  const alternatives = [correctStr, wrongOptions[0], wrongOptions[1]];
  const shuffled = shuffleArray(alternatives);
  const correctAnswerIdx = shuffled.indexOf(correctStr);

  const questionTexts = [
    `CONFRONTO DO ONI DE LAVA! Para furar o bloqueio defensivo pesado do rugby vulcânico, calcule a soma das táticas de ataque: ${choice.n1}/${choice.d1} + ${choice.n2}/${choice.d2}. Qual é a fração resultante simplificada?`,
    `O Oni Supremo lança uma onda de calor! Para criar uma barreira de proteção de rugby que resista ao fogo do magma, some as forças mágicas de terra e água: ${choice.n1}/${choice.d1} + ${choice.n2}/${choice.d2}. Qual fração representa esse escudo?`,
    `Passe tático rápido de rugby de lava! Um passe longo cobre ${choice.n1}/${choice.d1} da largura do campo, e o segundo avanço em diagonal cobre mais ${choice.n2}/${choice.d2}. Some esses avanços (${choice.n1}/${choice.d1} + ${choice.n2}/${choice.d2}) para planejar o touchdown do time:`,
    `A armadura mística do Oni Supremo se alimenta de calor vulcânico. Você lança duas runas de gelo que neutralizam ${choice.n1}/${choice.d1} e ${choice.n2}/${choice.d2} dessa energia. Some as forças das runas para desestabilizar o Oni:`,
    `Rugby tático extremo! Para vencer a espessa barreira de magma, as atletas de rugby correm ${choice.n1}/${choice.d1} do campo na cinza e mais ${choice.n2}/${choice.d2} na rocha firme. Some essas distâncias para registrar o avanço total:`,
    `O vulcão ruge e lança fumaça e pedras incandescentes! Para desviar das cinzas, o time de rugby divide-se em duas rotas cobrindo ${choice.n1}/${choice.d1} e ${choice.n2}/${choice.d2} do campo seguro. Some essas rotas na sua forma mais simples:`
  ];

  const text = questionTexts[Math.floor(Math.random() * questionTexts.length)];

  return {
    id: `lava_dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    question: text,
    alternatives: shuffled,
    correctAnswerIdx
  };
}

// Global history tracking of recently answered questions (across minigame rounds)
// to prevent repeating the same questions too frequently during the game session.
let globalRecentlyUsedIds: string[] = [];
const MAX_GLOBAL_HISTORY = 16;

/**
 * Gets a random question from the bank for a specific biome.
 * Ensures the question is not in currentChallengeUsedIds and tries to avoid globalRecentlyUsedIds.
 */
export function getUniqueQuestion(
  biome: Exclude<BiomeType, 'VILA'>,
  currentChallengeUsedIds: string[]
): BankQuestion {
  if (biome === 'BAMBU') return generateBambuQuestion();
  if (biome === 'NEVE') return generateNeveQuestion();
  if (biome === 'LAGO_LOTUS') return generateLotusQuestion();
  if (biome === 'PALACIO_AGUA') return generateAguaQuestion();
  if (biome === 'CIDADE_SKATE') return generateSkateQuestion();
  if (biome === 'DESERTO') return generateDesertoQuestion();
  if (biome === 'LAVA') return generateLavaQuestion();
  
  return generateBambuQuestion();
}

