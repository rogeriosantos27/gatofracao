/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NPC, Chest } from './types';

export const INITIAL_NPCS: NPC[] = [
  {
    nome: 'Totem Guia 💡',
    x: 30 * 48,
    y: 16 * 48,
    color: '#eab308',
    mask: 'totem',
    biome: 'VILA',
    dialogue: [
      'Olá, pequeno(a) aventureiro(a)! 🐾 Bem-vindo(a) à nossa maravilhosa ilha!',
      'Eu sou o Totem Guia e vou te ensinar o segredo mágico das Frações para você ser um super campeão!',
      'O que é uma fração? É super simples! Pense em uma pizza deliciosa dividida em pedaços iguais. 🍕',
      'O número de baixo (Denominador) diz em quantos pedaços dividimos a pizza. O de cima (Numerador) diz quantos pedaços você pegou para comer! Gostoso, né?',
      'Para aprender de um jeito muito fácil, recomendo seguir esta trilha divertida pela ilha:',
      'Passo 1: Vá para a ESQUERDA (Oeste) no PALÁCIO DA ÁGUA com Otohime. Lá você vai aprender a pintar frações na piscina! 🏊‍♂️🌊',
      'Passo 2: Suba para o NOROESTE no topo gelado com Fukuro. Ele te ensinará quanto falta para completar um caminho! 🧗❄️',
      'Passo 3: Vá para o NORTE no BAMBUZAL com Tengu para aprender a simplificar (encolher!) as frações! 🏓💨',
      'Passo 4: Siga para o NORDESTE até o LAGO DE LÓTUS com Yoichi para descobrir frações de frações (tipo a metade de um pedaço!) 🏹🎯',
      'Passo 5: Vá para a DIREITA (Leste) na CIDADE DO SKATE com Tanuki para girar seu skate convertendo ângulos em frações! 🛹🤙',
      'Passo 6: Vá para o SUL no DESERTO com Kijimuna para somar frações com pedacinhos do mesmo tamanho! 🏃‍♂️⚡',
      'Passo 7 (Desafio Final): Quando conseguir as 6 medalhas de campeão, vá para o SUL na LAVA brincar de Rugby com o Oni Supremo! 🌋🏉',
      'Agora, use as teclas W, A, S, D ou as setas para andar e divirta-se explorando!'
    ]
  },
  {
    nome: 'Tengu (Ping Pong)',
    x: 30 * 48,
    y: 6 * 48,
    color: '#15803d',
    mask: 'tengu',
    biome: 'BAMBU',
    dialogue: [
      'Oi, amiguinho(a)! 🏓 Eu sou o Tengu, o mestre do Ping Pong de Bambu!',
      'Para rebater os meus saques mágicos e super rápidos, vamos brincar de encolher as frações!',
      'Encolher uma fração (simplificar) é como dividir uma barra de chocolate gigante em pedaços maiores e mais fáceis de comer, mantendo a mesma quantidade gostosa! 🍫✨',
      'Mostre toda a sua agilidade e venha treinar seus reflexos comigo neste rali divertido!'
    ]
  },
  {
    nome: 'Fukuro (Escalada)',
    x: 8 * 48,
    y: 6 * 48,
    color: '#0284c7',
    mask: 'fukuro',
    biome: 'NEVE',
    dialogue: [
      'Brrr... que friozinho bom! 🧗❄️ Eu sou o Fukuro, o mestre da Escalada na Neve!',
      'Para subir esta parede de gelo super divertida, precisamos saber quanto falta para chegar lá no topo!',
      'Se o caminho todo tem 5 metros e já subimos 3 metros, ainda faltam 2 de 5 partes, ou seja, 2/5! É a fração que falta!',
      'Coloque suas luvas quentinhas e vamos escalar juntos com muita energia!'
    ]
  },
  {
    nome: 'Yoichi (Arquearia)',
    x: 50 * 48,
    y: 6 * 48,
    color: '#0d9488',
    mask: 'raposa',
    biome: 'LAGO_LOTUS',
    dialogue: [
      'Shh... sinta o vento calmo balançando as flores de lótus. 🌸🏹',
      'Eu sou o Yoichi, o arqueiro da floresta. Minhas flechas voam com precisão dividindo o ar!',
      'Imagine que você tem metade de uma melancia e divide essa metade com um amigo. Vocês ganham a metade de uma metade, que é 1/4 da melancia inteira! 🍉',
      'Isso é fração de fração! Ajuste a mira da sua mente e venha acertar o centro do alvo comigo!'
    ]
  },
  {
    nome: 'Otohime (Nado)',
    x: 8 * 48,
    y: 22 * 48,
    color: '#3b82f6',
    mask: 'peixe',
    biome: 'PALACIO_AGUA',
    dialogue: [
      'Glub, glub! Que água quentinha e deliciosa! 🏊‍♂️🌊 Eu sou a Otohime, rainha do Nado Sincronizado!',
      'As minhas amigas sereias precisam da sua ajuda para fazer um show de nado maravilhoso!',
      'O segredo é pintar a barra de água na quantidade certinha. Por exemplo, em 3/5, nós dividimos a barra em 5 pedacinhos iguais e você pinta exatamente 3! 🎨✨',
      'Venha mergulhar com a gente e faça o nosso show de dança aquática brilhar!'
    ]
  },
  {
    nome: 'Tanuki (Skate)',
    x: 51 * 48,
    y: 22 * 48,
    color: '#7c3aed',
    mask: 'tanuki',
    biome: 'CIDADE_SKATE',
    dialogue: [
      'E aí, amiguinho(a)! Beleza? 🛹🤙 Sou o Tanuki, o mestre das manobras de Skate!',
      'Quando damos uma volta completa com o skate, giramos um círculo de 360 graus!',
      'Se eu der só meia-volta (180 graus), fiz a fração de 1/2 volta! E se for só 1/4 de volta, girei 90 graus! É muito irado!',
      'Suba no skate, coloque o capacete e vamos fazer manobras fantásticas juntos!'
    ]
  },
  {
    nome: 'Kijimuna (Corrida)',
    x: 12 * 48,
    y: 37 * 48,
    color: '#ca8a04',
    mask: 'passaro',
    biome: 'DESERTO',
    dialogue: [
      'Ufa! Que corrida divertida na areia morna do deserto! 🏃‍♂️⚡ Eu sou o Kijimuna, o corredor mais rápido da ilha!',
      'Para correr super rápido, nós somamos os nossos passos!',
      'Quando somamos frações com pedacinhos do mesmo tamanho, é muito fácil: nós guardamos o número de baixo e só somamos os números de cima! 🍰',
      'Prepare seu tênis de corrida e venha apostar uma corrida amigável comigo até a linha de chegada!'
    ]
  },
  {
    nome: 'Oni Supremo (Rugby)',
    x: 45 * 48,
    y: 37 * 48,
    color: '#b91c1c',
    mask: 'oni',
    biome: 'LAVA',
    dialogue: [
      'MUAHAHA! QUEM OUSA ENTRAR NO MEU PARQUE DE DIVERSÕES DE LAVA? 🌋 Rugby do poder!',
      'Eu sou o Oni Supremo, o grandioso mas amigável campeão do Rugby de Fogo!',
      'Para passar pela minha barreira de calor, você precisa ter as 6 Medalhas de Esporte que ganhou dos outros mestres!',
      'Nosso jogo final é somar frações de pedaços de tamanhos diferentes! Vamos usar o truque da multiplicação cruzada para juntar tudo! 🏉🔥',
      'Prepare seu escudo de campeão e vamos fazer o touchdown mais divertido de todos!'
    ]
  }
];

export const INITIAL_CHESTS: Chest[] = [
  { id: 1, x: 15 * 48, y: 12 * 48, aberto: false, tipoConteudo: 'pocao', quantidade: 1 },
  { id: 2, x: 25 * 48, y: 5 * 48, aberto: false, tipoConteudo: 'pocao', quantidade: 2 },
  { id: 3, x: 5 * 48, y: 25 * 48, aberto: false, tipoConteudo: 'pocao', quantidade: 1 },
  { id: 4, x: 35 * 48, y: 25 * 48, aberto: false, tipoConteudo: 'pocao', quantidade: 2 }
];
