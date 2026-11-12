(() => {
  "use strict";

  const canvas = document.querySelector("#arena-canvas");
  const ctx = canvas.getContext("2d");
  const playerHealth = document.querySelector("#player-health");
  const opponentHealth = document.querySelector("#opponent-health");
  const playerMeter = document.querySelector("#player-meter");
  const opponentMeter = document.querySelector("#opponent-meter");
  const playerName = document.querySelector("#player-character");
  const opponentName = document.querySelector("#opponent-character");
  const playerDisplayName = document.querySelector("#player-display-name");
  const opponentDisplayName = document.querySelector("#opponent-display-name");
  const playerPreviewName = document.querySelector("#player-preview-name");
  const opponentPreviewName = document.querySelector("#opponent-preview-name");
  const playerPreviewSuper = document.querySelector("#player-preview-super");
  const opponentPreviewSuper = document.querySelector("#opponent-preview-super");
  const playerPreviewSwatch = document.querySelector("#player-preview-swatch");
  const opponentPreviewSwatch = document.querySelector("#opponent-preview-swatch");
  const gameMode = document.querySelector("#game-mode");
  const gameDifficulty = document.querySelector("#game-difficulty");
  const arenaSelect = document.querySelector("#arena-select");
  const difficultyField = document.querySelector("#difficulty-field");
  const opponentLabel = document.querySelector("#opponent-label");
  const playerTwoControls = document.querySelector("#player-two-controls");
  const playerSuperCaption = document.querySelector("#player-super-caption");
  const opponentSuperCaption = document.querySelector("#opponent-super-caption");
  const timerLabel = document.querySelector("#timer");
  const statusMessage = document.querySelector("#status-message");
  const restartButton = document.querySelector("#restart-button");

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const FLOOR = 425;
  const GRAVITY = 1550;
  const keys = new Set();
  const touchControls = new Set();
  const BOT_DIFFICULTIES = {
    easy: { approachSpeed: 90, cooldown: 1.8, cooldownJitter: 0.9, damage: 5, superChance: 0.012, blockChance: 0 },
    medium: { approachSpeed: 135, cooldown: 1.15, cooldownJitter: 0.55, damage: 8, superChance: 0.025, blockChance: 0 },
    hard: { approachSpeed: 185, cooldown: 0.62, cooldownJitter: 0.28, damage: 11, superChance: 0.06, blockChance: 0.55 },
  };

  const CHARACTERS = {
    kim: {
      name: "Kim Jong-un",
      color: "#e58655",
      trim: "#263c67",
      superCaption: "SUPER: sirene + mini cogumelo de fumaça",
    },
    trump: {
      name: "Trump",
      color: "#ad3d36",
      trim: "#233b68",
      superCaption: "SUPER: dança Y.M.C.A. que congela o rival",
    },
    bolsonaro: {
      name: "Bolsonaro",
      color: "#d8d1b3",
      trim: "#278f59",
      superCaption: "SUPER: motociata em círculos",
    },
    lula: {
      name: "Lula",
      color: "#c33b43",
      trim: "#273954",
      superCaption: "SUPER: churrasco de campanha, fumaça e cheiro que distrai",
    },
    obama: {
      name: "Obama",
      color: "#274a77",
      trim: "#1d2d42",
      superCaption: "SUPER: drible e arremesso que deixam o rival tonto",
    },
    putin: {
      name: "Putin",
      color: "#ece8da",
      trim: "#355278",
      superCaption: "SUPER: golpe de judô",
    },
    getulio: {
      name: "Getúlio Vargas",
      color: "#263c5a",
      trim: "#372f2e",
      superCaption: "SUPER: xícara gigante com vapor confunde o rival",
    },
    jk: {
      name: "JK",
      color: "#79899a",
      trim: "#344557",
      superCaption: "SUPER: 50 anos em 5 — tempo parado e país se desenvolvendo",
    },
    "queen-elizabeth": {
      name: "Rainha Elizabeth",
      color: "#a68ac3",
      trim: "#f0d57e",
      superCaption: "SUPER: carruagem real, cavalos, corgis e guardas de brinquedo",
    },
    gandhi: {
      name: "Mahatma Gandhi",
      color: "#e7dfc9",
      trim: "#8a9b70",
      superCaption: "SUPER: oração, abraço e trégua",
    },
    churchill: {
      name: "Winston Churchill",
      color: "#3d454e",
      trim: "#8b6a54",
      superCaption: "SUPER: discurso e nuvens de fumaça em forma de V",
    },
    mandela: {
      name: "Nelson Mandela",
      color: "#d0b886",
      trim: "#4b7759",
      superCaption: "SUPER: discurso de união e chuva de confete",
    },
    chavez: {
      name: "Hugo Chávez",
      color: "#a83b37",
      trim: "#303b47",
      superCaption: "SUPER: jatos de tinta preta viram confete",
    },
    "training-dummy": {
      name: "Alvo de treino",
      color: "#78bfc2",
      trim: "#3d6070",
      superCaption: "Adversário de prática",
    },
  };

  const fighters = [
    { id: "kim", x: 265, facing: 1, health: 100, meter: 0, block: false, onGround: true, vy: 0, attack: 0, attackCooldown: 0, flash: 0, knockedDown: false, frozenTimer: 0 },
    { id: "training-dummy", x: 695, facing: -1, health: 100, meter: 0, block: false, onGround: true, vy: 0, attack: 0, attackCooldown: 1.1, flash: 0, knockedDown: false, frozenTimer: 0 },
  ];
  const [player, opponent] = fighters;

  const PAIR_INTERACTIONS = [
    { key: "kim:trump", type: "handshake", label: "Kim e Trump apertam as mãos!" },
    { key: "lula:trump", type: "line", label: "Você não conhece o sangue de Lampião!" },
    { key: "lula:bolsonaro", type: "line", label: "O Bozo vai comer calanguinho" },
    { key: "obama:trump", type: "obama-trump", label: "Obama começa a driblar; Trump responde com YMCA; o juiz apita!" },
    { key: "putin:trump", type: "putin-trump", label: "Os dois ligam para seus agentes: disputa cartunesca de espionagem!" },
    { key: "queen-elizabeth:trump", type: "queen-trump", label: "Trump tenta um aperto de mão; reverência real e um corgi interrompem a pose!" },
    { key: "gandhi:queen-elizabeth", type: "gandhi-queen", label: "Convite para chá e trégua!" },
    { key: "churchill:queen-elizabeth", type: "churchill-queen", label: "Churchill faz o V da vitória; a Rainha acena e um corgi leva o charuto cenográfico!" },
    { key: "mandela:gandhi", type: "mandela-gandhi", label: "Mandela oferece um aperto de mão; Gandhi responde com reverência e o juiz hesita entre luta e cerimônia de paz!" },
    { key: "chavez:trump", type: "chavez-trump", label: "Chávez e Trump disputam o microfone; o juiz corta o som e surge INTERVALO COMERCIAL!" },
  ];
  const BOLSONARO_MATCHUP_VARIANTS = {
    "bolsonaro:lula": {
      kind: "fireworks",
      line: "Hoje à noite a petralhada vai chorar",
    },
  };
  const PUTIN_MATCHUP_REACTIONS = {
    "putin:trump": "Putin ergue a bandeira da URSS (piada histórica)",
    "trump:putin": "Trump ri de Putin",
  };
  const pairKey = (first, second) => `${first}:${second}`;
  const findPairInteraction = (first, second) =>
    PAIR_INTERACTIONS.find((interaction) =>
      interaction.key === pairKey(first, second) || interaction.key === pairKey(second, first)
    );

  function updateModeUi() {
    const isPvp = gameMode.value === "pvp";
    difficultyField.hidden = isPvp;
    playerTwoControls.hidden = !isPvp;
    opponentLabel.textContent = isPvp ? "Jogador 2" : "Adversário";
    if (isPvp && opponentName.value === "training-dummy") opponentName.value = "kim";
  }

  const effects = [];
  let timeLeft = 60;
  let gameState = "ready";
  let lastFrame = 0;
  let superFlash = 0;
  let shakeTimer = 0;
  let superTimer = 0;
  let superFighter = null;
  let danceTimer = 0;
  let danceFighter = null;
  let finishTimer = 0;
  let winnerId = null;
  let winnerFighter = null;
  let loserFighter = null;
  let bolsonaroSuperTimer = 0;
  let bolsonaroSuperTarget = null;
  let bolsonaroAngle = 0;
  let lulaSuperTimer = 0;
  let lulaSuperTarget = null;
  let lulaSuperFighter = null;
  let obamaSuperTimer = 0;
  let obamaSuperTarget = null;
  let putinSuperTimer = 0;
  let putinSuperTarget = null;
  let putinTrumpIntroTimer = 0;
  let getulioSuperTimer = 0;
  let getulioSuperTarget = null;
  let jkSuperTimer = 0;
  let jkSuperTarget = null;
  let queenSuperTimer = 0;
  let queenSuperTarget = null;
  let gandhiSuperTimer = 0;
  let gandhiSuperTarget = null;
  let churchillSuperTimer = 0;
  let churchillSuperTarget = null;
  let mandelaSuperTimer = 0;
  let mandelaSuperTarget = null;
  let chavezSuperTimer = 0;
  let chavezSuperTarget = null;
  let introTimer = 0;
  let messageTimer = 0;

  function setMessage(message, seconds = 1.1) {
    statusMessage.textContent = message;
    messageTimer = seconds;
  }
  if (bolsonaroSuperTarget && bolsonaroSuperTimer > 0) {
    bolsonaroSuperTarget.frozenTimer = Math.max(bolsonaroSuperTarget.frozenTimer, bolsonaroSuperTimer);
  }

  function drawPixelTrump(fighter) {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    const pose = danceTimer > 0
      && fighter === danceFighter
      ? ["Y", "M", "C", "A"][Math.floor((4.5 - danceTimer) / 0.7) % 4]
      : "Y";

    block(-15, -29, 12, 27, "#17263f");
    block(3, -29, 12, 27, "#17263f");
    block(-18, -5, 16, 5, "#30384b");
    block(2, -5, 16, 5, "#30384b");
    block(-18, -65, 36, 37, "#233b68");
    block(-6, -64, 12, 32, "#f5f0e2");
    block(-3, -62, 6, 25, "#c83e3c");
    block(-4, -39, 8, 6, "#c83e3c");
    block(-21, -64, 9, 14, "#233b68");
    block(12, -64, 9, 14, "#233b68");
    block(-9, -84, 18, 19, "#e1b284");
    block(-12, -91, 24, 8, "#d99537");
    block(-9, -96, 18, 6, "#e5aa45");
    block(-9, -76, 3, 3, "#243149");
    block(6, -76, 3, 3, "#243149");
    block(-3, -69, 6, 2, "#7f4d45");

    const arms = {
      Y: [[-21, -60, -8, -8, "#233b68"], [-32, -73, -8, -8, "#233b68"], [-43, -86, -8, -8, "#233b68"], [-48, -96, 8, 8, "#e1b284"], [21, -60, 8, -8, "#233b68"], [32, -73, 8, -8, "#233b68"], [43, -86, 8, -8, "#233b68"], [40, -96, 8, 8, "#e1b284"]],
      M: [[-21, -60, -8, -8, "#233b68"], [-32, -72, -8, -8, "#233b68"], [-38, -83, 8, -8, "#233b68"], [-30, -88, 8, 8, "#e1b284"], [21, -60, 8, -8, "#233b68"], [32, -72, 8, -8, "#233b68"], [30, -83, 8, -8, "#233b68"], [22, -88, 8, 8, "#e1b284"]],
      C: [[-21, -60, -8, -8, "#233b68"], [-34, -60, -8, -8, "#233b68"], [-46, -52, -8, -8, "#233b68"], [-48, -42, 8, 8, "#e1b284"], [21, -60, 8, -8, "#233b68"], [34, -60, 8, -8, "#233b68"], [46, -52, 8, -8, "#233b68"], [40, -42, 8, 8, "#e1b284"]],
      A: [[-21, -60, -8, -8, "#233b68"], [-27, -74, -8, -8, "#233b68"], [-22, -86, -8, -8, "#233b68"], [-16, -99, 8, 8, "#e1b284"], [21, -60, 8, -8, "#233b68"], [27, -74, 8, -8, "#233b68"], [22, -86, 8, -8, "#233b68"], [8, -99, 8, 8, "#e1b284"]],
    }[pose];
    for (const [x, y, width, height, color] of arms) block(x, y, width, height, color);

    if (fighter.attack > 0 && danceTimer <= 0) {
      block(fighter.facing * 28, -55, 18 * fighter.facing, 8, "#233b68");
    }
    if (fighter.frozenTimer > 0) {
      block(-33, -74, 12, 7, "#233b68");
      block(21, -74, 12, 7, "#233b68");
    }
  }

  function drawPixelKim() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#1c2736");
    block(4, -29, 11, 26, "#1c2736");
    block(-18, -5, 15, 5, "#303844");
    block(2, -5, 15, 5, "#303844");
    block(-21, -66, 42, 40, "#263c67");
    block(-8, -64, 16, 32, "#d7d4ca");
    block(-3, -62, 6, 27, "#8c3d3f");
    block(-10, -85, 20, 20, "#d0a47e");
    block(-14, -90, 28, 8, "#202b37");
    block(-10, -95, 20, 6, "#202b37");
    block(-17, -84, 5, 13, "#202b37");
    block(12, -84, 5, 13, "#202b37");
    block(-8, -77, 3, 3, "#26364b");
    block(5, -77, 3, 3, "#26364b");
    block(-4, -68, 8, 2, "#7b5147");
    block(-25, -64, 7, 18, "#263c67");
    block(18, -64, 7, 18, "#263c67");
    block(-16, -58, 4, 17, "#3b5275");
    block(12, -58, 4, 17, "#3b5275");
  }

  function drawPixelBolsonaro() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#1c3455");
    block(4, -29, 11, 26, "#1c3455");
    block(-18, -5, 15, 5, "#27354b");
    block(2, -5, 15, 5, "#27354b");
    block(-19, -65, 38, 38, "#278f59");
    block(-6, -64, 12, 33, "#f5f0e2");
    block(-3, -62, 6, 27, "#d84b39");
    block(-9, -84, 18, 19, "#d8a57e");
    block(-12, -91, 24, 8, "#2c704c");
    block(-9, -96, 18, 6, "#387e51");
    block(-7, -77, 3, 3, "#27354b");
    block(4, -77, 3, 3, "#27354b");
    block(-3, -69, 6, 2, "#7c4c43");
    block(-45, -20, 90, 12, "#353c4a");
    block(-28, -37, 45, 20, "#387dbe");
    block(-11, -47, 19, 13, "#e1e4e6");
    block(-43, -10, 23, 8, "#252a35");
    block(20, -10, 23, 8, "#252a35");
    block(-38, -7, 12, 3, "#c7cbd0");
    block(24, -7, 12, 3, "#c7cbd0");
    block(-24, -49, 12, 5, "#278f59");
    block(20, -45, 10, 5, "#278f59");
  }

  function drawPixelLula() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#22364f");
    block(4, -29, 11, 26, "#22364f");
    block(-18, -5, 15, 5, "#303844");
    block(2, -5, 15, 5, "#303844");
    block(-19, -65, 38, 38, "#c33b43");
    block(-6, -64, 12, 33, "#f5f0e2");
    block(-3, -62, 6, 27, "#d4ad46");
    block(-9, -84, 18, 19, "#d0a47e");
    block(-12, -76, 24, 8, "#d0a47e");
    block(-11, -90, 22, 7, "#bdbfc0");
    block(-7, -77, 3, 3, "#26364b");
    block(4, -77, 3, 3, "#26364b");
    block(-3, -69, 6, 2, "#7b5147");
    block(12, -51, 10, 13, "#c33b43");
  }

  function drawPixelObama() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#202b37");
    block(4, -29, 11, 26, "#202b37");
    block(-18, -5, 15, 5, "#303844");
    block(2, -5, 15, 5, "#303844");
    block(-19, -65, 38, 38, "#274a77");
    block(-6, -64, 12, 33, "#e5e6e2");
    block(-3, -62, 6, 27, "#7e3136");
    block(-9, -84, 18, 19, "#704c3e");
    block(-13, -91, 26, 8, "#202a34");
    block(-9, -77, 3, 3, "#1f2c3b");
    block(5, -77, 3, 3, "#1f2c3b");
    block(-3, -69, 6, 2, "#513c34");
  }

  function drawPixelGetulio() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#242c38");
    block(4, -29, 11, 26, "#242c38");
    block(-18, -5, 15, 5, "#303844");
    block(2, -5, 15, 5, "#303844");
    block(-19, -65, 38, 38, "#263c5a");
    block(-6, -64, 12, 33, "#ddd8c9");
    block(-3, -62, 6, 27, "#533a35");
    block(-9, -84, 18, 19, "#d0a47e");
    block(-12, -91, 24, 8, "#353230");
    block(-8, -77, 3, 3, "#26364b");
    block(5, -77, 3, 3, "#26364b");
    block(-4, -69, 8, 2, "#57433d");
  }

  function drawGetulioSuper() {
    if (getulioSuperTimer <= 0 || !getulioSuperTarget) return;
    const x = getulioSuperTarget.x;
    const y = FLOOR - 50;
    ctx.fillStyle = "#573f31";
    ctx.fillRect(x - 53, y - 58, 76, 57);
    ctx.fillStyle = "#c8a05d";
    ctx.fillRect(x - 46, y - 51, 62, 43);
    ctx.fillStyle = "#e8d2a4";
    ctx.fillRect(x - 25, y - 91, 22, 38);
    ctx.fillStyle = "#d5d5d2";
    ctx.beginPath();
    ctx.ellipse(x - 14, y - 96, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d5d5d2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 14, y - 103);
    ctx.bezierCurveTo(x + 2, y - 120, x - 24, y - 128, x - 6, y - 143);
    ctx.moveTo(x - 24, y - 105);
    ctx.bezierCurveTo(x - 35, y - 119, x - 17, y - 127, x - 30, y - 139);
    ctx.stroke();
  }

  function drawPixelPutin() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#e5e1d3");
    block(4, -29, 11, 26, "#e5e1d3");
    block(-18, -5, 15, 5, "#303844");
    block(2, -5, 15, 5, "#303844");
    block(-19, -65, 38, 38, "#ece8da");
    block(-9, -84, 18, 19, "#d0a47e");
    block(-7, -77, 3, 3, "#26364b");
    block(4, -77, 3, 3, "#26364b");
    block(-3, -69, 6, 2, "#7b5147");
    block(-16, -61, 8, 24, "#355278");
    block(8, -61, 8, 24, "#355278");
    block(-16, -38, 11, 7, "#355278");
    block(5, -38, 11, 7, "#355278");
  }

  function drawPixelJK() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#283442");
    block(4, -29, 11, 26, "#283442");
    block(-18, -5, 15, 5, "#303844");
    block(2, -5, 15, 5, "#303844");
    block(-19, -65, 38, 38, "#79899a");
    block(-6, -64, 12, 33, "#ddd8c9");
    block(-3, -62, 6, 27, "#533a35");
    block(-9, -84, 18, 19, "#d0a47e");
    block(-12, -91, 24, 8, "#45596c");
    block(-8, -77, 3, 3, "#26364b");
    block(5, -77, 3, 3, "#26364b");
    block(-4, -69, 8, 2, "#57433d");
  }

  function drawPixelQueen() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#eee5cf");
    block(4, -29, 11, 26, "#eee5cf");
    block(-18, -5, 15, 5, "#a68ac3");
    block(2, -5, 15, 5, "#a68ac3");
    block(-19, -65, 38, 38, "#a68ac3");
    block(-10, -85, 20, 20, "#efd0ae");
    block(-13, -91, 26, 7, "#b8b8b4");
    block(-11, -98, 22, 7, "#f0d57e");
    block(-9, -77, 3, 3, "#343a47");
    block(6, -77, 3, 3, "#343a47");
    block(-3, -69, 6, 2, "#b06a67");
    block(-22, -66, 6, 16, "#a68ac3");
    block(16, -64, 8, 18, "#a68ac3");
    block(23, -48, 5, 5, "#efd0ae");
  }

  function drawPixelGandhi() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#8a9b70");
    block(4, -29, 11, 26, "#8a9b70");
    block(-18, -5, 15, 5, "#66584b");
    block(2, -5, 15, 5, "#66584b");
    block(-18, -65, 36, 38, "#e7dfc9");
    block(-11, -85, 22, 21, "#b89470");
    block(-8, -82, 16, 5, "#e7dfc9");
    block(-13, -78, 26, 13, "#b89470");
    block(-15, -79, 10, 7, "#f2eee2");
    block(5, -79, 10, 7, "#f2eee2");
    block(-12, -77, 5, 3, "#27313b");
    block(7, -77, 5, 3, "#27313b");
    block(-2, -76, 4, 2, "#27313b");
    block(-4, -67, 8, 2, "#745a4c");
  }

  function drawGandhiQueenIntro() {
    const centerX = WIDTH / 2;
    const tableY = FLOOR - 23;
    ctx.fillStyle = "#725440";
    ctx.fillRect(centerX - 40, tableY, 80, 8);
    ctx.fillRect(centerX - 33, tableY + 8, 5, 20);
    ctx.fillRect(centerX + 28, tableY + 8, 5, 20);
    for (const cupX of [centerX - 22, centerX + 15]) {
      ctx.fillStyle = "#f4eee0";
      ctx.fillRect(cupX, tableY - 14, 14, 12);
      ctx.strokeStyle = "#f4eee0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cupX + 15, tableY - 8, 4, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 14px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CHÁ E TRÉGUA", centerX, FLOOR - 70);
  }

  function drawGandhiSuper() {
    if (gandhiSuperTimer <= 0 || !gandhiSuperTarget) return;
    const targetX = gandhiSuperTarget.x;
    const progress = 1 - gandhiSuperTimer / 2.4;
    ctx.save();
    ctx.strokeStyle = "#e7dfc9";
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (progress < 0.45) {
      ctx.moveTo(targetX - 14, FLOOR - 75);
      ctx.lineTo(targetX - 14, FLOOR - 95);
      ctx.moveTo(targetX + 14, FLOOR - 75);
      ctx.lineTo(targetX + 14, FLOOR - 95);
    } else {
      ctx.beginPath();
      ctx.ellipse(targetX, FLOOR - 55, 33, 22, 0, Math.PI, Math.PI * 2);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawGandhiTeaTruce() {
    const centerX = WIDTH / 2;
    const y = FLOOR;
    ctx.fillStyle = "#725440";
    ctx.fillRect(centerX - 42, y - 51, 84, 8);
    ctx.fillRect(centerX - 35, y - 43, 5, 23);
    ctx.fillRect(centerX + 30, y - 43, 5, 23);
    for (const cupX of [centerX - 23, centerX + 12]) {
      ctx.fillStyle = "#f4eee0";
      ctx.fillRect(cupX, y - 64, 13, 12);
      ctx.strokeStyle = "#f4eee0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cupX + 14, y - 58, 4, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
    const participants = [
      [centerX - 83, winnerFighter],
      [centerX + 83, loserFighter],
    ];
    for (const [x, fighter] of participants) {
      ctx.fillStyle = fighter?.color || "#e7dfc9";
      ctx.beginPath();
      ctx.roundRect(x - 22, y - 61, 44, 37, 10);
      ctx.fill();
      ctx.fillStyle = fighter?.id === "gandhi" ? "#b89470" : "#d8a57e";
      ctx.beginPath();
      ctx.arc(x, y - 73, 14, 0, Math.PI * 2);
      ctx.fill();
      if (fighter?.id === "gandhi") {
        ctx.strokeStyle = "#27313b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x - 6, y - 74, 5, 0, Math.PI * 2);
        ctx.arc(x + 6, y - 74, 5, 0, Math.PI * 2);
        ctx.moveTo(x - 1, y - 74);
        ctx.lineTo(x + 1, y - 74);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 14px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TRÉGUA • O JUIZ ENCERROU A LUTA", centerX, y - 101);
  }

  function drawPixelChurchill() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#30363c");
    block(4, -29, 11, 26, "#30363c");
    block(-18, -5, 15, 5, "#4a3d34");
    block(2, -5, 15, 5, "#4a3d34");
    block(-20, -65, 40, 38, "#3d454e");
    block(-8, -64, 16, 29, "#ddd8c9");
    block(-10, -85, 20, 20, "#d0a47e");
    block(-16, -91, 32, 8, "#45494d");
    block(-10, -96, 20, 6, "#45494d");
    block(-9, -77, 3, 3, "#26364b");
    block(6, -77, 3, 3, "#26364b");
    block(-4, -68, 8, 3, "#6c473e");
    block(-21, -64, 6, 18, "#3d454e");
    block(17, -63, 7, 18, "#3d454e");
  }

  function drawChurchillSuper() {
    if (churchillSuperTimer <= 0 || !churchillSuperTarget) return;
    const x = churchillSuperTarget.x;
    const top = FLOOR - 125;
    ctx.save();
    ctx.strokeStyle = "rgba(201, 210, 211, 0.78)";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 86, top + 8);
    ctx.bezierCurveTo(x - 116, top - 8, x - 76, top - 30, x - 96, top - 44);
    ctx.moveTo(x + 86, top + 8);
    ctx.bezierCurveTo(x + 116, top - 8, x + 76, top - 30, x + 96, top - 44);
    ctx.moveTo(x - 90, top - 2);
    ctx.lineTo(x, top - 48);
    ctx.lineTo(x + 90, top - 2);
    ctx.stroke();
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 20px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("V", x, top - 55);
    ctx.restore();
  }

  function drawChurchillQueenIntro() {
    const churchill = player.id === "churchill" ? player : opponent;
    const queen = player.id === "queen-elizabeth" ? player : opponent;
    const corgiX = WIDTH / 2 + Math.sin((2.4 - introTimer) * Math.PI) * 55;
    ctx.strokeStyle = "#f0d7b4";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(churchill.x + churchill.facing * 20, FLOOR - 74);
    ctx.lineTo(churchill.x + churchill.facing * 29, FLOOR - 94);
    ctx.moveTo(churchill.x + churchill.facing * 20, FLOOR - 74);
    ctx.lineTo(churchill.x + churchill.facing * 40, FLOOR - 92);
    ctx.stroke();
    ctx.strokeStyle = "#f0d7b4";
    ctx.beginPath();
    ctx.moveTo(queen.x + queen.facing * 19, FLOOR - 52);
    ctx.quadraticCurveTo(queen.x + queen.facing * 43, FLOOR - 73, queen.x + queen.facing * 32, FLOOR - 96);
    ctx.stroke();
    ctx.fillStyle = "#d69b58";
    ctx.fillRect(corgiX - 18, FLOOR - 19, 34, 12);
    ctx.beginPath();
    ctx.arc(corgiX + 16, FLOOR - 25, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(corgiX - 12, FLOOR - 7, 5, 7);
    ctx.fillRect(corgiX + 3, FLOOR - 7, 5, 7);
    ctx.fillStyle = "#8b6a54";
    ctx.fillRect(corgiX + 21, FLOOR - 31, 12, 3);
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 12px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("V!", churchill.x + churchill.facing * 42, FLOOR - 103);
  }

  function drawPixelMandela() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#4b7759");
    block(4, -29, 11, 26, "#4b7759");
    block(-18, -5, 15, 5, "#4d473d");
    block(2, -5, 15, 5, "#4d473d");
    block(-20, -65, 40, 38, "#d0b886");
    block(-8, -64, 16, 29, "#eee5cf");
    block(-10, -85, 20, 20, "#986e50");
    block(-13, -81, 26, 5, "#986e50");
    block(-8, -77, 3, 3, "#283442");
    block(5, -77, 3, 3, "#283442");
    block(-4, -68, 8, 2, "#5d453b");
    block(-22, -64, 6, 18, "#d0b886");
    block(17, -63, 7, 18, "#d0b886");
  }

  function drawMandelaGandhiIntro() {
    const judgeX = WIDTH / 2;
    const gandhi = player.id === "gandhi" ? player : opponent;
    const mandela = player.id === "mandela" ? player : opponent;
    ctx.strokeStyle = "#d8a57e";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(mandela.x + mandela.facing * 18, FLOOR - 50);
    ctx.lineTo(WIDTH / 2, FLOOR - 60);
    ctx.stroke();
    ctx.strokeStyle = "#e7dfc9";
    ctx.beginPath();
    ctx.moveTo(gandhi.x + gandhi.facing * 18, FLOOR - 52);
    ctx.quadraticCurveTo(gandhi.x + gandhi.facing * 30, FLOOR - 69, gandhi.x + gandhi.facing * 25, FLOOR - 86);
    ctx.stroke();
    ctx.fillStyle = "#303b47";
    ctx.fillRect(judgeX - 7, FLOOR - 68, 14, 33);
    ctx.beginPath();
    ctx.arc(judgeX, FLOOR - 78, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 24px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("?", judgeX + 23, FLOOR - 84);
  }

  function drawMandelaReconciliation() {
    const centerX = WIDTH / 2;
    const y = FLOOR;
    ctx.fillStyle = "#725440";
    ctx.fillRect(centerX - 105, y - 27, 210, 8);
    ctx.fillRect(centerX - 95, y - 19, 8, 19);
    ctx.fillRect(centerX + 87, y - 19, 8, 19);
    for (const [x, fighter] of [[centerX - 58, winnerFighter], [centerX + 58, loserFighter]]) {
      ctx.fillStyle = fighter?.color || "#d0b886";
      ctx.beginPath();
      ctx.roundRect(x - 21, y - 62, 42, 37, 10);
      ctx.fill();
      ctx.fillStyle = fighter?.id === "mandela" ? "#986e50" : "#d8a57e";
      ctx.beginPath();
      ctx.arc(x, y - 73, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#d8a57e";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(centerX - 37, y - 48);
    ctx.lineTo(centerX - 7, y - 44);
    ctx.moveTo(centerX + 37, y - 48);
    ctx.lineTo(centerX + 7, y - 44);
    ctx.stroke();
    ctx.fillStyle = "#303b47";
    ctx.fillRect(centerX + 115, y - 54, 12, 31);
    ctx.beginPath();
    ctx.arc(centerX + 121, y - 63, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 12px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LUTA ENCERRADA", centerX, y - 93);
  }

  function drawPixelChavez() {
    const block = (x, y, width, height, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    };
    block(-15, -29, 11, 26, "#30363c");
    block(4, -29, 11, 26, "#30363c");
    block(-18, -5, 15, 5, "#4a3d34");
    block(2, -5, 15, 5, "#4a3d34");
    block(-20, -65, 40, 38, "#a83b37");
    block(-10, -85, 20, 20, "#d0a47e");
    block(-15, -91, 30, 8, "#a83b37");
    block(-17, -83, 34, 7, "#bdb19a");
    block(-8, -77, 3, 3, "#26364b");
    block(5, -77, 3, 3, "#26364b");
    block(-4, -68, 8, 2, "#58443c");
    block(-21, -64, 6, 18, "#a83b37");
    block(17, -63, 7, 18, "#a83b37");
  }

  function drawChavezSuper() {
    if (chavezSuperTimer <= 0 || !chavezSuperTarget) return;
    const x = chavezSuperTarget.x;
    const y = FLOOR - 100;
    ctx.save();
    ctx.strokeStyle = "#252525";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 185, y + 22);
    ctx.bezierCurveTo(x - 118, y - 27, x - 60, y + 22, x, y - 6);
    ctx.moveTo(x + 185, y + 22);
    ctx.bezierCurveTo(x + 118, y - 27, x + 60, y + 22, x, y - 6);
    ctx.stroke();
    ctx.restore();
  }

  function drawChavezTrumpIntro() {
    const centerX = WIDTH / 2;
    for (const fighter of [player, opponent]) {
      ctx.strokeStyle = fighter.id === "chavez" ? "#a83b37" : "#233b68";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(fighter.x + fighter.facing * 19, FLOOR - 52);
      ctx.lineTo(centerX - Math.sign(centerX - fighter.x) * 13, FLOOR - 113);
      ctx.stroke();
    }
    ctx.fillStyle = "#252a35";
    ctx.fillRect(centerX - 4, FLOOR - 119, 8, 59);
    ctx.fillStyle = "#d9dedf";
    ctx.beginPath();
    ctx.ellipse(centerX, FLOOR - 121, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#252a35";
    ctx.fillRect(centerX - 20, FLOOR - 95, 40, 23);
    ctx.strokeStyle = "#b6443e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX - 15, FLOOR - 132);
    ctx.lineTo(centerX + 15, FLOOR - 110);
    ctx.stroke();
    ctx.fillStyle = "#f4f0e1";
    ctx.fillRect(centerX - 94, FLOOR - 72, 188, 28);
    ctx.strokeStyle = "#b6443e";
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - 94, FLOOR - 72, 188, 28);
    ctx.fillStyle = "#ad3d36";
    ctx.font = "700 12px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("INTERVALO COMERCIAL", centerX, FLOOR - 54);
  }

  function drawQueenTrumpIntro() {
    const queen = player.id === "queen-elizabeth" ? player : opponent;
    const corgiX = WIDTH / 2 + Math.sin((2.4 - introTimer) * Math.PI) * 55;
    ctx.save();
    ctx.strokeStyle = "#efd0ae";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(queen.x + 19, FLOOR - 52);
    ctx.quadraticCurveTo(WIDTH / 2 - 22, FLOOR - 60, WIDTH / 2, FLOOR - 55);
    ctx.stroke();
    ctx.fillStyle = "#f0d57e";
    ctx.beginPath();
    ctx.arc(corgiX, FLOOR - 16, 15, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(corgiX - 20, FLOOR - 20, 40, 10);
    ctx.fillRect(corgiX - 15, FLOOR - 11, 6, 8);
    ctx.fillRect(corgiX + 9, FLOOR - 11, 6, 8);
    ctx.beginPath();
    ctx.arc(corgiX + 13, FLOOR - 29, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3e342e";
    ctx.beginPath();
    ctx.arc(corgiX + 16, FLOOR - 30, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawQueenSuper() {
    if (queenSuperTimer <= 0) return;
    const progress = 1 - queenSuperTimer / 3.5;
    const x = -150 + progress * (WIDTH + 300);
    const y = FLOOR - 25;
    ctx.save();
    ctx.fillStyle = "#d9cdb3";
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(x - 30, y - 2, 200, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#4a3c32";
    for (let horse = 0; horse < 2; horse += 1) {
      const hx = x - 115 - horse * 43;
      ctx.fillRect(hx - 24, y - 40, 47, 22);
      ctx.beginPath();
      ctx.arc(hx + 27, y - 43, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(hx - 18, y - 20, 6, 19);
      ctx.fillRect(hx + 8, y - 20, 6, 19);
    }
    ctx.fillStyle = "#f0d57e";
    ctx.fillRect(x - 78, y - 91, 104, 57);
    ctx.fillStyle = "#b83c3c";
    ctx.fillRect(x - 69, y - 82, 86, 39);
    ctx.fillStyle = "#f0d57e";
    ctx.fillRect(x - 40, y - 113, 32, 23);
    ctx.strokeStyle = "#3c302e";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(x - 55, y - 22, 18, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 22, 18, 0, Math.PI * 2);
    ctx.stroke();
    for (let guard = 0; guard < 2; guard += 1) {
      const gx = x + 64 + guard * 42;
      ctx.fillStyle = "#303b47";
      ctx.fillRect(gx - 7, y - 43, 14, 33);
      ctx.fillStyle = "#dfd7c6";
      ctx.fillRect(gx - 8, y - 49, 16, 7);
      ctx.fillStyle = "#24282d";
      ctx.fillRect(gx - 8, y - 61, 16, 12);
      ctx.fillRect(gx - 7, y - 10, 5, 10);
      ctx.fillRect(gx + 2, y - 10, 5, 10);
    }
    for (let corgi = 0; corgi < 3; corgi += 1) {
      const cx = x + 145 + corgi * 35;
      ctx.fillStyle = "#d69b58";
      ctx.fillRect(cx - 12, y - 17, 26, 12);
      ctx.beginPath();
      ctx.arc(cx + 13, y - 20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 8, y - 6, 4, 6);
      ctx.fillRect(cx + 3, y - 6, 4, 6);
    }
    ctx.restore();
  }

  function drawJKSuper() {
    if (jkSuperTimer <= 0) return;
    const progress = 1 - jkSuperTimer / 3.5;
    ctx.save();
    ctx.fillStyle = "rgba(201, 220, 232, 0.14)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (let i = 0; i < 7; i += 1) {
      const baseX = 120 + i * 120;
      const height = 28 + Math.min(125, progress * (85 + i * 8));
      ctx.fillStyle = i % 2 ? "#526d83" : "#6e8799";
      ctx.fillRect(baseX, FLOOR - height, 48, height);
      ctx.fillStyle = "#d9d4b8";
      for (let row = FLOOR - height + 10; row < FLOOR - 5; row += 18) {
        ctx.fillRect(baseX + 8, row, 5, 5);
        ctx.fillRect(baseX + 24, row, 5, 5);
        ctx.fillRect(baseX + 38, row, 4, 5);
      }
    }
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 28px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("50 ANOS EM 5", WIDTH / 2, 315);
    ctx.restore();
  }

  function drawJKFinisher() {
    ctx.fillStyle = "#454a4e";
    ctx.fillRect(95, FLOOR + 18, WIDTH - 190, 48);
    ctx.fillStyle = "#d8d1b3";
    for (let x = 130; x < WIDTH - 130; x += 125) {
      ctx.fillRect(x, FLOOR + 40, 58, 4);
    }
    const x = Math.min(WIDTH - 120, (loserFighter?.x || WIDTH / 2) + 145);
    ctx.fillStyle = "#35414c";
    ctx.fillRect(x - 54, FLOOR - 31, 92, 24);
    ctx.fillStyle = "#b5bfc4";
    ctx.fillRect(x - 30, FLOOR - 55, 37, 25);
    ctx.fillStyle = "#c8a05d";
    ctx.beginPath();
    ctx.arc(x - 8, FLOOR - 18, 20, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#252a35";
    ctx.beginPath();
    ctx.arc(x - 38, FLOOR - 7, 11, 0, Math.PI * 2);
    ctx.arc(x + 24, FLOOR - 7, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(loserFighter?.x || WIDTH / 2, FLOOR - 7);
    ctx.scale(1, 0.13);
    ctx.fillStyle = loserFighter?.color || "#94a9ad";
    ctx.strokeStyle = "#f2eee2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-42, -80, 84, 60, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawMatsPile(x, y) {
    ctx.fillStyle = "#55796f";
    ctx.fillRect(x - 48, y - 17, 96, 12);
    ctx.fillStyle = "#8caa86";
    ctx.fillRect(x - 45, y - 29, 90, 12);
    ctx.fillStyle = "#bfce9d";
    ctx.fillRect(x - 42, y - 41, 84, 12);
    ctx.strokeStyle = "#344b49";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) {
      ctx.strokeRect(x - 48 + i * 3, y - 17 - i * 12, 96 - i * 6, 12);
    }
  }

  function drawCushionFinisher(x, y) {
    ctx.fillStyle = "#b87580";
    ctx.beginPath();
    ctx.roundRect(x - 45, y - 18, 90, 18, 8);
    ctx.fill();
    ctx.strokeStyle = "#e9c2bd";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#303b47";
    ctx.fillRect(x + 54, y - 47, 10, 29);
    ctx.fillStyle = "#dfd7c6";
    ctx.fillRect(x + 51, y - 53, 16, 8);
    ctx.fillStyle = "#24282d";
    ctx.fillRect(x + 51, y - 66, 16, 13);
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 12px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FIM", x, y - 77);
  }

  function drawPutinTrumpIntro() {
    const trump = player.id === "trump" ? player : opponent;
    const putin = player.id === "putin" ? player : opponent;
    for (const [x, color, label] of [[putin.x - 65, "#43515b", "AGENTE CIA"], [trump.x + 65, "#4a5b48", "SOLDADO RUSSO"]]) {
      ctx.fillStyle = color;
      ctx.fillRect(x - 9, FLOOR - 68, 18, 43);
      ctx.beginPath();
      ctx.arc(x, FLOOR - 77, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "700 9px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x, FLOOR - 91);
    }
    for (const fighter of [putin, trump]) {
      ctx.fillStyle = "#252a35";
      ctx.fillRect(fighter.x - 8, FLOOR - 93, 16, 10);
      ctx.fillStyle = "#d9dedf";
      ctx.fillRect(fighter.x - 9, FLOOR - 85, 18, 2);
    }
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 12px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PÍÍ!", WIDTH / 2, FLOOR - 105);
  }

  function drawPutinVictoryFlag() {
    ctx.strokeStyle = "#d9dedf";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 112);
    ctx.lineTo(WIDTH / 2, 48);
    ctx.stroke();
    ctx.fillStyle = "#b83c3c";
    ctx.fillRect(WIDTH / 2 + 3, 49, 100, 54);
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 15px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("URSS", WIDTH / 2 + 53, 81);
  }

  function drawBolsonaroSuper() {
    if (bolsonaroSuperTimer <= 0 || !bolsonaroSuperTarget) return;
    const centerX = bolsonaroSuperTarget.x;
    const centerY = FLOOR - 48;
    const radius = 115;
    const riderX = centerX + Math.cos(bolsonaroAngle) * radius;
    const riderY = centerY + Math.sin(bolsonaroAngle) * 15;
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = "#f4d681";
    ctx.lineWidth = 3;
    ctx.setLineDash([9, 8]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, 27, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.save();
    ctx.translate(riderX, riderY);
    ctx.rotate(Math.sin(bolsonaroAngle) * 0.12);
    drawPixelBolsonaro();
    ctx.restore();
  }

  function drawLulaSuper() {
    if (lulaSuperTimer <= 0 || !lulaSuperTarget) return;
    const x = lulaSuperTarget.x;
    const y = FLOOR - 68;
    ctx.save();
    ctx.fillStyle = "rgba(82, 83, 87, 0.62)";
    for (let i = 0; i < 5; i += 1) {
      const puffX = x - 40 + i * 18 + Math.sin(performance.now() / 190 + i) * 5;
      const puffY = y - 28 - (i % 3) * 12;
      ctx.beginPath();
      ctx.arc(puffX, puffY, 20 + (i % 2) * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#e9d8a4";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 33, y - 52);
    ctx.bezierCurveTo(x + 53, y - 68, x + 24, y - 80, x + 45, y - 95);
    ctx.moveTo(x + 48, y - 37);
    ctx.bezierCurveTo(x + 67, y - 50, x + 38, y - 63, x + 60, y - 77);
    ctx.stroke();
    ctx.fillStyle = "#30333b";
    ctx.fillRect(lulaSuperFighter.x - 42, FLOOR - 29, 54, 18);
    ctx.fillStyle = "#d8d1b3";
    ctx.fillRect(lulaSuperFighter.x - 34, FLOOR - 38, 38, 10);
    ctx.fillStyle = "#252a35";
    ctx.fillRect(lulaSuperFighter.x - 38, FLOOR - 11, 46, 8);
    ctx.restore();
  }

  function drawObamaSuper() {
    if (obamaSuperTimer <= 0 || !obamaSuperTarget) return;
    const target = obamaSuperTarget;
    const angle = (3.2 - obamaSuperTimer) * Math.PI * 3.2;
    ctx.save();
    ctx.fillStyle = "#f4d681";
    ctx.beginPath();
    ctx.arc(target.x + Math.cos(angle) * 50, FLOOR - 17, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(target.x + Math.cos(angle) * 50, FLOOR - 20);
    drawPixelObama();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#f5f2e8";
    ctx.font = "700 20px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DRIBLE!", target.x, FLOOR - 135);
    const ballProgress = (3.2 - obamaSuperTimer) / 3.2;
    const ballX = target.x + 110 - ballProgress * 220;
    const ballY = FLOOR - 145 - Math.sin(ballProgress * Math.PI) * 55;
    ctx.fillStyle = "#dc7d39";
    ctx.beginPath();
    ctx.arc(ballX, ballY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#553626";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ballX - 10, ballY);
    ctx.lineTo(ballX + 10, ballY);
    ctx.moveTo(ballX, ballY - 10);
    ctx.lineTo(ballX, ballY + 10);
    ctx.stroke();
    ctx.restore();
  }

  function drawChairFinisher(x, y, flagLabel, high = false) {
    ctx.save();
    ctx.strokeStyle = "#d9dedf";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 18, y - (high ? 74 : 45));
    ctx.lineTo(x + 18, y - (high ? 74 : 45));
    ctx.moveTo(x - 14, y - (high ? 74 : 45));
    ctx.lineTo(x - 18, y - 4);
    ctx.moveTo(x + 14, y - (high ? 74 : 45));
    ctx.lineTo(x + 18, y - 4);
    ctx.moveTo(x - 18, y - 4);
    ctx.lineTo(x + 18, y - 4);
    ctx.stroke();
    ctx.strokeStyle = "#c9ced2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 20, y - (high ? 110 : 75));
    ctx.lineTo(x + 20, y - (high ? 77 : 47));
    ctx.stroke();
    ctx.fillStyle = "#f4f0e1";
    ctx.fillRect(x + 21, y - (high ? 110 : 75), 75, 24);
    ctx.fillStyle = "#27374f";
    ctx.font = "700 9px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(flagLabel, x + (high ? 58 : 50), y - (high ? 95 : 60));
    ctx.restore();
  }

  function drawArmchairFinisher(x, y) {
    ctx.fillStyle = "#573f31";
    ctx.beginPath();
    ctx.roundRect(x - 35, y - 78, 70, 65, 12);
    ctx.fill();
    ctx.fillRect(x - 42, y - 45, 12, 35);
    ctx.fillRect(x + 30, y - 45, 12, 35);
    ctx.fillStyle = "#8b6a54";
    ctx.fillRect(x - 28, y - 29, 56, 12);
    ctx.fillStyle = "#3e342e";
    ctx.fillRect(x - 27, y - 17, 7, 17);
    ctx.fillRect(x + 20, y - 17, 7, 17);
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 10px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LUTA ENCERRADA", x, y - 87);
  }

  function drawInterviewChair(x, y) {
    ctx.fillStyle = "#263c4b";
    ctx.fillRect(x - 25, y - 75, 50, 39);
    ctx.fillStyle = "#4b7282";
    ctx.fillRect(x - 30, y - 39, 60, 12);
    ctx.fillStyle = "#303b47";
    ctx.fillRect(x - 27, y - 27, 6, 27);
    ctx.fillRect(x + 21, y - 27, 6, 27);
    ctx.fillStyle = "#f4d681";
    ctx.font = "700 9px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FIM DE JOGO", x, y - 82);
    ctx.strokeStyle = "#252a35";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 48, y);
    ctx.lineTo(x - 48, y - 61);
    ctx.stroke();
    ctx.fillStyle = "#252a35";
    ctx.beginPath();
    ctx.ellipse(x - 48, y - 63, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTirePile(x, y) {
    ctx.save();
    for (let i = 0; i < 3; i += 1) {
      const tireX = x - 20 + i * 20;
      const tireY = y - 10 - (i % 2) * 5;
      ctx.fillStyle = "#252a35";
      ctx.beginPath();
      ctx.ellipse(tireX, tireY, 28, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#737987";
      ctx.beginPath();
      ctx.ellipse(tireX, tireY, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFreezeStars(x, y) {
    ctx.fillStyle = "#ffe08a";
    ctx.font = "700 20px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✦  ✦  ✦", x, y - 115);
  }

  function drawHandshake() {
    ctx.save();
    ctx.strokeStyle = "#f4d2a3";
    ctx.lineWidth = 13;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(player.x + 20, FLOOR - 52);
    ctx.lineTo(WIDTH / 2 - 8, FLOOR - 44);
    ctx.lineTo(opponent.x - 20, FLOOR - 52);
    ctx.stroke();
    ctx.fillStyle = "#f4d2a3";
    ctx.fillRect(WIDTH / 2 - 10, FLOOR - 53, 20, 17);
    ctx.restore();
  }

  function drawDanceCue() {
    const pose = ["Y", "M", "C", "A"][Math.floor((4.5 - danceTimer) / 0.7) % 4];
    ctx.fillStyle = "#ffe08a";
    ctx.font = "700 22px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`Y.M.C.A.  ${pose}`, danceFighter.x, FLOOR - 135);
  }

  function drawObamaTrumpIntro() {
    const obama = player.id === "obama" ? player : opponent;
    const ballY = FLOOR - 12 - Math.abs(Math.sin((2.4 - introTimer) * Math.PI * 3)) * 30;
    ctx.fillStyle = "#dc7d39";
    ctx.beginPath();
    ctx.arc(obama.x + 30, ballY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#553626";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obama.x + 20, ballY);
    ctx.lineTo(obama.x + 40, ballY);
    ctx.moveTo(obama.x + 30, ballY - 10);
    ctx.lineTo(obama.x + 30, ballY + 10);
    ctx.stroke();
    ctx.fillStyle = "#f4d681";
    ctx.beginPath();
    ctx.arc(WIDTH / 2, FLOOR - 88, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 14px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PÍÍ!", WIDTH / 2, FLOOR - 106);
  }

  function resetGame() {
    updateModeUi();
    keys.clear();
    touchControls.clear();
    const playerCharacter = CHARACTERS[playerName.value] || CHARACTERS.kim;
    const opponentCharacter = CHARACTERS[opponentName.value] || CHARACTERS["training-dummy"];
    Object.assign(player, playerCharacter, { id: playerName.value });
    Object.assign(opponent, opponentCharacter, { id: opponentName.value });
    Object.assign(player, { x: 265, facing: 1, health: 100, meter: 0, block: false, onGround: true, vy: 0, attack: 0, attackCooldown: 0, flash: 0, knockedDown: false, knockdownTimer: 0, frozenTimer: 0 });
    Object.assign(opponent, { x: 695, facing: -1, health: 100, meter: 0, block: false, onGround: true, vy: 0, attack: 0, attackCooldown: 1.1, flash: 0, knockedDown: false, knockdownTimer: 0, frozenTimer: 0 });
    opponent.attackCooldown = gameMode.value === "pvp" ? 0 : getBotDifficulty().cooldown;
    effects.length = 0;
    timeLeft = 60;
    gameState = "ready";
    superFlash = 0;
    shakeTimer = 0;
    superTimer = 0;
    superFighter = null;
    danceTimer = 0;
    danceFighter = null;
    bolsonaroSuperTimer = 0;
    bolsonaroSuperTarget = null;
    bolsonaroAngle = 0;
    lulaSuperTimer = 0;
    lulaSuperTarget = null;
    lulaSuperFighter = null;
    obamaSuperTimer = 0;
    obamaSuperTarget = null;
    putinSuperTimer = 0;
    putinSuperTarget = null;
    getulioSuperTimer = 0;
    getulioSuperTarget = null;
    jkSuperTimer = 0;
    jkSuperTarget = null;
    queenSuperTimer = 0;
    queenSuperTarget = null;
    gandhiSuperTimer = 0;
    gandhiSuperTarget = null;
    churchillSuperTimer = 0;
    churchillSuperTarget = null;
    mandelaSuperTimer = 0;
    mandelaSuperTarget = null;
    chavezSuperTimer = 0;
    chavezSuperTarget = null;
    finishTimer = 0;
    winnerId = null;
    winnerFighter = null;
    loserFighter = null;
    player.seatedOnTires = false;
    opponent.seatedOnTires = false;
    player.seatedOnChair = false;
    opponent.seatedOnChair = false;
    player.seatedOnArmchair = false;
    opponent.seatedOnArmchair = false;
    player.coveredInBlackConfetti = false;
    opponent.coveredInBlackConfetti = false;
    for (const fighter of fighters) {
      fighter.seatedOnMats = false;
      fighter.seatedOnCushion = false;
      fighter.flattenedOnRoad = false;
    }
    introTimer = 0;
    messageTimer = 1.5;
    statusMessage.textContent = "A luta vai começar!";
    playerSuperCaption.textContent = player.superCaption;
    opponentSuperCaption.textContent = opponent.superCaption;
    playerDisplayName.textContent = player.name;
    opponentDisplayName.textContent = opponent.name;
    playerPreviewName.textContent = player.name;
    opponentPreviewName.textContent = opponent.name;
    playerPreviewSuper.textContent = player.superCaption;
    opponentPreviewSuper.textContent = opponent.superCaption;
    playerPreviewSwatch.style.backgroundColor = player.color;
    opponentPreviewSwatch.style.backgroundColor = opponent.color;
    document.querySelector(".fighter-info--left .health-track").setAttribute("aria-label", `Energia de ${player.name}`);
    document.querySelector(".fighter-info--right .health-track").setAttribute("aria-label", `Energia de ${opponent.name}`);
    updateHud();
  }

  function control(name, playerNumber = 1) {
    const key = playerNumber === 2 ? `p2:${name}` : name;
    return keys.has(key) || (playerNumber === 1 && touchControls.has(name));
  }

  function getBotDifficulty() {
    return BOT_DIFFICULTIES[gameDifficulty.value] || BOT_DIFFICULTIES.medium;
  }

  function updateHud() {
    playerHealth.style.width = `${player.health}%`;
    opponentHealth.style.width = `${opponent.health}%`;
    playerMeter.style.width = `${player.meter}%`;
    opponentMeter.style.width = `${opponent.meter}%`;
    timerLabel.textContent = `${Math.ceil(timeLeft)}`;
  }

  function startAttack(fighter, heavy, target) {
    if (gameState !== "fight" || fighter.attackCooldown > 0 || fighter.knockedDown) return;
    const range = heavy ? 126 : 108;
    const distance = Math.abs(fighter.x - target.x);
    fighter.attackCooldown = heavy ? 0.72 : 0.48;
    fighter.attack = heavy ? 0.26 : 0.18;
    if (distance <= range) {
      const damage = heavy ? 14 : 9;
      const blocked = target.block && target.facing === -fighter.facing;
      target.health = Math.max(0, target.health - (blocked ? Math.ceil(damage * 0.18) : damage));
      target.flash = 0.16;
      const knockback = target.frozenTimer > 0 ? 6 : blocked ? 10 : heavy ? 34 : 24;
      target.x += fighter.facing * knockback;
      fighter.meter = Math.min(100, fighter.meter + 20);
      if (target === player) player.meter = Math.min(100, player.meter + 12);
      addImpact(target.x, FLOOR - 60, blocked ? "#9de8e2" : "#ffd86f");
      setMessage(blocked ? "Defesa!" : heavy ? "Golpe forte!" : "Golpe!");
      if (target.health <= 0) finishFight(fighter, target);
    }
    updateHud();
  }

  function useSuper(fighter = player, target = opponent) {
    if (gameState !== "fight" || fighter.meter < 100 || fighter.knockedDown || fighter.frozenTimer > 0) {
      if (gameState === "fight") setMessage("Medidor de super ainda carregando.");
      return;
    }
    fighter.meter = 0;
    if (fighter.id === "churchill") {
      churchillSuperTimer = 2.8;
      churchillSuperTarget = target;
      target.frozenTimer = 2.8;
      target.block = false;
      setMessage("Discurso! Nuvens de fumaça em forma de V distraem o rival!", 2.8);
      updateHud();
      return;
    }
    if (fighter.id === "mandela") {
      mandelaSuperTimer = 2.8;
      mandelaSuperTarget = target;
      target.frozenTimer = 2.8;
      target.block = false;
      addConfetti(42);
      setMessage("Discurso de união: a chuva de confete distrai o adversário!", 2.8);
      updateHud();
      return;
    }
    if (fighter.id === "chavez") {
      chavezSuperTimer = 2.8;
      chavezSuperTarget = target;
      target.frozenTimer = 2.8;
      target.block = false;
      addBlackConfetti(64);
      setMessage("Jatos de tinta preta viram confete e cobrem a arena!", 2.8);
      updateHud();
      return;
    }
    if (fighter.id === "bolsonaro") {
      bolsonaroSuperTimer = 3.2;
      bolsonaroSuperTarget = target;
      bolsonaroAngle = 0;
      fighter.attack = 0.45;
      target.frozenTimer = 3.2;
      target.block = false;
      addImpact(target.x, FLOOR - 68, "#e8d585", 14);
      setMessage("MOTOCIATA! Voltas e mais voltas!", 2.6);
      updateHud();
      return;
    }
    if (fighter.id === "lula") {
      lulaSuperTimer = 3.2;
      lulaSuperTarget = target;
      lulaSuperFighter = fighter;
      target.frozenTimer = 3.2;
      target.block = false;
      addImpact(target.x, FLOOR - 70, "#d5d4ce", 12);
      setMessage("Churrasco de campanha! A fumaça e o cheiro distraem!", 2.8);
      updateHud();
      return;
    }
    if (fighter.id === "obama") {
      obamaSuperTimer = 3.2;
      obamaSuperTarget = target;
      target.frozenTimer = 3.2;
      target.block = false;
      addImpact(target.x, FLOOR - 70, "#f4d681", 14);
      setMessage("Drible! Arremesso! Rival tonto!", 2.6);
      updateHud();
      return;
    }
    if (fighter.id === "getulio") {
      getulioSuperTimer = 3.2;
      getulioSuperTarget = target;
      target.frozenTimer = 3.2;
      target.block = false;
      addImpact(target.x, FLOOR - 70, "#d4b56f", 12);
      setMessage("Xícara gigante! O vapor confunde o rival!", 2.6);
      updateHud();
      return;
    }
    if (fighter.id === "jk") {
      jkSuperTimer = 3.5;
      jkSuperTarget = target;
      target.frozenTimer = 3.5;
      target.block = false;
      setMessage("50 anos em 5 — o tempo para enquanto o país se desenvolve!", 3);
      updateHud();
      return;
    }
    if (fighter.id === "queen-elizabeth") {
      queenSuperTimer = 3.5;
      queenSuperTarget = target;
      target.frozenTimer = 2.4;
      target.block = false;
      target.x = clamp(target.x + fighter.facing * 95, 85, WIDTH - 85);
      addImpact(target.x, FLOOR - 55, "#d9cdb3", 15);
      addConfetti(32);
      setMessage("A carruagem real passa! O rival desvia, tonto na poeira e no confete!", 3);
      updateHud();
      return;
    }
    if (fighter.id === "gandhi") {
      gandhiSuperTimer = 2.4;
      gandhiSuperTarget = target;
      target.frozenTimer = 2.4;
      target.block = false;
      setMessage("Que a luta termine aqui; não somos inimigos", 2.4);
      updateHud();
      return;
    }
    if (fighter.id === "putin") {
      putinSuperTimer = 1.8;
      putinSuperTarget = target;
      target.frozenTimer = 1.8;
      target.knockedDown = true;
      target.knockdownTimer = 1.8;
      target.health = Math.max(0, target.health - 18);
      target.x += fighter.facing * 48;
      addImpact(target.x, FLOOR - 38, "#b8d7cb", 14);
      setMessage("Golpe de judô! Rival derrubado!", 2.2);
      if (target.health <= 0) finishFight(fighter, target);
      updateHud();
      return;
    }
    if (fighter.id === "trump") {
      fighter.attack = 0.45;
      target.frozenTimer = 4.5;
      target.block = false;
      target.x = fighter.x + fighter.facing * Math.min(115, Math.abs(target.x - fighter.x));
      danceTimer = 4.5;
      danceFighter = fighter;
      superFighter = null;
      superFlash = 0.7;
      addImpact(target.x, FLOOR - 75, "#ffdb7b", 20);
      setMessage("Dança Y.M.C.A.! Rival congelado — ataque agora!", 2.4);
      updateHud();
      return;
    }
    superTimer = 2.8;
    superFighter = fighter;
    danceTimer = 0;
    danceFighter = null;
    superFlash = 1.1;
    fighter.attack = 0.45;
    target.health = Math.max(0, target.health - 28);
    target.x += fighter.facing * 105;
    target.flash = 0.22;
    addPamphlets(12);
    addImpact(target.x, FLOOR - 75, "#ffdb7b", 20);
    setMessage("Sirene! Mini cogumelo de fumaça!", 2.3);
    if (target.health <= 0) {
      finishFight(fighter, target);
    }
    updateHud();
  }

  function finishFight(winner = player, loser = opponent) {
    if (gameState === "finish" || gameState === "over") return;
    gameState = "finish";
    finishTimer = 3.8;
    winnerId = winner.id;
    winnerFighter = winner;
    loserFighter = loser;
    loser.vy = 0;
    const variant = BOLSONARO_MATCHUP_VARIANTS[`${winner.id}:${loser.id}`];
    if (variant?.kind === "fireworks") {
      loser.knockedDown = false;
      loser.frozenTimer = finishTimer;
      loser.seatedOnTires = true;
      addConfetti(42);
      addFireworks();
      setMessage(`${variant.line}!`, finishTimer);
    } else if (winner.id === "bolsonaro") {
      loser.knockedDown = false;
      loser.frozenTimer = 0;
      loser.seatedOnTires = true;
      loser.seatedOnChair = false;
      addConfetti(12);
      setMessage("Rival tonto das voltas, sentado num monte de pneus!", finishTimer);
    } else if (winner.id === "lula") {
      loser.knockedDown = false;
      loser.seatedOnChair = true;
      loser.seatedOnTires = false;
      loser.frozenTimer = finishTimer;
      lulaSuperTimer = finishTimer;
      lulaSuperTarget = loser;
      lulaSuperFighter = winner;
      setMessage("Rival distraído pela fumaça, cadeira de churrasco e bandeirada!", finishTimer);
    } else if (winner.id === "obama") {
      loser.knockedDown = false;
      loser.seatedOnChair = true;
      loser.seatedOnTires = false;
      loser.frozenTimer = finishTimer;
      setMessage("Fim de jogo!", finishTimer);
    } else if (winner.id === "putin") {
      loser.knockedDown = false;
      loser.seatedOnMats = true;
      loser.seatedOnChair = false;
      loser.seatedOnTires = false;
      loser.frozenTimer = finishTimer;
      setMessage("Rival sentado nos tatames — o juiz encerra a luta!", finishTimer);
    } else if (winner.id === "getulio") {
      loser.knockedDown = false;
      loser.seatedOnChair = true;
      loser.seatedOnTires = false;
      loser.frozenTimer = finishTimer;
      getulioSuperTimer = finishTimer;
      getulioSuperTarget = loser;
      setMessage("Rival distraído, cadeira de café e bandeirada!", finishTimer);
    } else if (winner.id === "jk") {
      loser.knockedDown = false;
      loser.flattenedOnRoad = true;
      loser.frozenTimer = finishTimer;
      setMessage("Rolo compressor — o rival vira um adesivo na estrada!", finishTimer);
    } else if (winner.id === "queen-elizabeth") {
      loser.knockedDown = false;
      loser.seatedOnCushion = true;
      loser.frozenTimer = finishTimer;
      setMessage("Um guarda de brinquedo escolta o rival até a almofada; o juiz encerra a luta!", finishTimer);
    } else if (winner.id === "gandhi") {
      winner.frozenTimer = finishTimer;
      loser.frozenTimer = finishTimer;
      setMessage("Trégua: os dois se sentam para tomar chá; o juiz encerra a luta.", finishTimer);
    } else if (winner.id === "churchill") {
      loser.knockedDown = false;
      loser.seatedOnArmchair = true;
      loser.frozenTimer = finishTimer;
      setMessage("Rival distraído pela fumaça, sentado na poltrona de gabinete; o juiz encerra a luta.", finishTimer);
    } else if (winner.id === "mandela") {
      winner.frozenTimer = finishTimer;
      loser.frozenTimer = finishTimer;
      setMessage("Os dois se sentam no banco de reconciliação e apertam as mãos; o juiz encerra a luta.", finishTimer);
    } else if (winner.id === "chavez") {
      loser.knockedDown = false;
      loser.seatedOnChair = true;
      loser.coveredInBlackConfetti = true;
      loser.frozenTimer = finishTimer;
      addBlackConfetti(32);
      setMessage("Rival coberto de confete preto, na cadeira de entrevista; o juiz encerra a luta.", finishTimer);
    } else if (winner.id === "trump") {
      loser.knockedDown = false;
      loser.frozenTimer = finishTimer;
      addConfetti(64);
      setMessage("Finalização: rival congelado e confete!", 3.8);
    } else {
      loser.knockedDown = true;
      addPamphlets(48);
      setMessage("Finalização cômica!", 3.8);
    }
  }

  function addImpact(x, y, color, count = 9) {
    shakeTimer = Math.max(shakeTimer, 0.12);
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 80 + Math.random() * 170;
      effects.push({
        kind: "spark",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.28 + Math.random() * 0.2,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  function addPamphlets(count) {
    for (let i = 0; i < count; i += 1) {
      effects.push({
        kind: "paper",
        x: 220 + Math.random() * 520,
        y: -Math.random() * 220,
        vx: (Math.random() - 0.5) * 100,
        vy: 60 + Math.random() * 130,
        life: 3 + Math.random() * 2,
        spin: (Math.random() - 0.5) * 8,
        angle: Math.random() * Math.PI,
      });
    }
  }

  function addConfetti(count) {
    const colors = ["#ffdc62", "#ef6f69", "#65d6c6", "#9d8aff", "#f7f0d7"];
    for (let i = 0; i < count; i += 1) {
      effects.push({
        kind: "confetti",
        x: 160 + Math.random() * 640,
        y: -Math.random() * 240,
        vx: (Math.random() - 0.5) * 120,
        vy: 90 + Math.random() * 170,
        life: 3.5 + Math.random() * 1.5,
        spin: (Math.random() - 0.5) * 12,
        angle: Math.random() * Math.PI,
        color: colors[i % colors.length],
      });
    }
  }

  function addBlackConfetti(count) {
    for (let i = 0; i < count; i += 1) {
      effects.push({
        kind: "confetti",
        x: 160 + Math.random() * 640,
        y: -Math.random() * 240,
        vx: (Math.random() - 0.5) * 120,
        vy: 90 + Math.random() * 170,
        life: 3.5 + Math.random() * 1.5,
        spin: (Math.random() - 0.5) * 12,
        angle: Math.random() * Math.PI,
        color: i % 3 === 0 ? "#555555" : "#202020",
      });
    }
  }

  function addFireworks() {
    for (let i = 0; i < 9; i += 1) {
      const x = 170 + Math.random() * (WIDTH - 340);
      const y = 55 + Math.random() * 175;
      addImpact(x, y, ["#ffdc62", "#ef6f69", "#65d6c6"][i % 3], 12);
    }
  }

  function update(dt) {
    if (messageTimer > 0) {
      messageTimer -= dt;
      if (messageTimer <= 0 && gameState === "fight") statusMessage.textContent = "";
    }
    superFlash = Math.max(0, superFlash - dt);
    shakeTimer = Math.max(0, shakeTimer - dt);
    superTimer = Math.max(0, superTimer - dt);
    danceTimer = Math.max(0, danceTimer - dt);
    bolsonaroSuperTimer = Math.max(0, bolsonaroSuperTimer - dt);
    if (bolsonaroSuperTimer > 0) bolsonaroAngle += dt * Math.PI * 3;
    lulaSuperTimer = Math.max(0, lulaSuperTimer - dt);
    obamaSuperTimer = Math.max(0, obamaSuperTimer - dt);
    putinSuperTimer = Math.max(0, putinSuperTimer - dt);
    getulioSuperTimer = Math.max(0, getulioSuperTimer - dt);
    jkSuperTimer = Math.max(0, jkSuperTimer - dt);
    queenSuperTimer = Math.max(0, queenSuperTimer - dt);
    gandhiSuperTimer = Math.max(0, gandhiSuperTimer - dt);
    churchillSuperTimer = Math.max(0, churchillSuperTimer - dt);
    mandelaSuperTimer = Math.max(0, mandelaSuperTimer - dt);
    chavezSuperTimer = Math.max(0, chavezSuperTimer - dt);
    for (const fighter of fighters) {
      if (fighter.knockdownTimer > 0) {
        fighter.knockdownTimer = Math.max(0, fighter.knockdownTimer - dt);
        if (fighter.knockdownTimer === 0) fighter.knockedDown = false;
      }
    }
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    opponent.attackCooldown = Math.max(0, opponent.attackCooldown - dt);
    player.frozenTimer = Math.max(0, player.frozenTimer - dt);
    opponent.frozenTimer = Math.max(0, opponent.frozenTimer - dt);
    player.attack = Math.max(0, player.attack - dt);
    opponent.attack = Math.max(0, opponent.attack - dt);
    player.flash = Math.max(0, player.flash - dt);
    opponent.flash = Math.max(0, opponent.flash - dt);

    if (gameState === "ready") {
      const interaction = findPairInteraction(player.id, opponent.id);
      if (interaction) {
        gameState = "intro";
        introTimer = 2.4;
        player.x = 436;
        opponent.x = 524;
        player.facing = 1;
        opponent.facing = -1;
        setMessage(interaction.label, introTimer);
        if (interaction.type === "obama-trump") {
          danceTimer = introTimer;
          danceFighter = player.id === "trump" ? player : opponent;
        }
      } else {
        gameState = "fight";
        setMessage("Valendo!", 1.2);
      }
    }

    if (gameState === "intro") {
      introTimer -= dt;
      if (introTimer <= 0) {
        gameState = "fight";
        setMessage("Valendo!", 1.2);
      }
    }

    if (gameState === "fight") {
      if (jkSuperTimer <= 0) timeLeft = Math.max(0, timeLeft - dt);
      player.block = control("block") && player.frozenTimer <= 0;
      const isPvp = gameMode.value === "pvp";
      const botDifficulty = getBotDifficulty();
      opponent.block = isPvp
        ? control("block", 2) && opponent.frozenTimer <= 0
        : botDifficulty.blockChance > 0
          && player.attack > 0
          && Math.random() < botDifficulty.blockChance;
      player.facing = player.x < opponent.x ? 1 : -1;
      opponent.facing = opponent.x < player.x ? 1 : -1;

      if (!player.knockedDown && player.frozenTimer <= 0) {
        const move = Number(control("right")) - Number(control("left"));
        player.x += move * 245 * dt;
        if (control("jump") && player.onGround) {
          player.vy = -640;
          player.onGround = false;
        }
        if (control("light")) startAttack(player, false, opponent);
        if (control("heavy")) startAttack(player, true, opponent);
        if (control("super")) useSuper();
      }

      const distance = Math.abs(opponent.x - player.x);
      if (isPvp) {
        if (!opponent.knockedDown && opponent.frozenTimer <= 0) {
          const move = Number(control("right", 2)) - Number(control("left", 2));
          opponent.x += move * 245 * dt;
          if (control("jump", 2) && opponent.onGround) {
            opponent.vy = -640;
            opponent.onGround = false;
          }
          if (control("light", 2)) startAttack(opponent, false, player);
          if (control("heavy", 2)) startAttack(opponent, true, player);
          if (control("super", 2)) useSuper(opponent, player);
        }
      } else if (opponent.frozenTimer > 0 || opponent.knockedDown) {
        opponent.block = false;
      } else if (distance > 83) {
        opponent.x += Math.sign(player.x - opponent.x) * Math.min(botDifficulty.approachSpeed * dt, distance - 83);
      } else if (!opponent.block && opponent.attackCooldown <= 0) {
        opponent.attackCooldown = botDifficulty.cooldown + Math.random() * botDifficulty.cooldownJitter;
        opponent.attack = 0.2;
        const blocked = player.block;
        player.health = Math.max(0, player.health - (blocked ? 2 : botDifficulty.damage));
        player.x += opponent.facing * (blocked ? 4 : 20);
        player.flash = 0.14;
        opponent.meter = Math.min(100, opponent.meter + 15);
        addImpact(player.x, FLOOR - 55, blocked ? "#9de8e2" : "#ff9d87", 7);
        setMessage(blocked ? "Defesa!" : `${opponent.name} contra-ataca!`);
        if (player.health <= 0) {
          finishFight(opponent, player);
        }
      }
      if (
        gameState === "fight"
        && !isPvp
        && opponent.id !== "training-dummy"
        && opponent.meter >= 100
        && opponent.frozenTimer <= 0
        && distance <= 230
        && Math.random() < botDifficulty.superChance
      ) {
        useSuper(opponent, player);
      }
      if (timeLeft <= 0 && gameState === "fight") {
        gameState = "over";
        winnerId = player.health >= opponent.health ? player.id : opponent.id;
        winnerFighter = winnerId === player.id ? player : opponent;
        setMessage(
          winnerId === "bolsonaro"
            ? "Imbroxável!"
            : isPvp
              ? `Jogador ${winnerId === player.id ? "1" : "2"} venceu por energia!`
              : `${CHARACTERS[winnerId].name} venceu por energia!`,
          99
        );
      }
    } else if (gameState === "finish") {
      finishTimer -= dt;
      if (finishTimer <= 0) {
        gameState = "over";
        setMessage("Vitória cartunesca! Reinicie para outra luta.", 99);
      }
    }

    for (const fighter of fighters) {
      if (!fighter.onGround) {
        fighter.vy += GRAVITY * dt;
        fighter.y = (fighter.y || FLOOR) + fighter.vy * dt;
        if (fighter.y >= FLOOR) {
          fighter.y = FLOOR;
          fighter.vy = 0;
          fighter.onGround = true;
        }
      } else {
        fighter.y = FLOOR;
      }
    }
    player.x = clamp(player.x, 70, WIDTH - 70);
    opponent.x = clamp(opponent.x, 70, WIDTH - 70);

    for (let i = effects.length - 1; i >= 0; i -= 1) {
      const effect = effects[i];
      effect.life -= dt;
      effect.x += effect.vx * dt;
      effect.y += effect.vy * dt;
      effect.vy += effect.kind === "paper" ? 65 * dt : 0;
      if (effect.kind === "paper" || effect.kind === "confetti") effect.angle += effect.spin * dt;
      if (effect.life <= 0 || effect.y > HEIGHT + 30) effects.splice(i, 1);
    }

    updateHud();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    if (shakeTimer > 0) {
      ctx.translate((Math.random() - 0.5) * shakeTimer * 32, (Math.random() - 0.5) * shakeTimer * 24);
    }
    drawBackground();
    drawFloor();
    if (
      gameState === "finish"
      && (winnerFighter?.id === "gandhi" || winnerFighter?.id === "mandela")
    ) {
      if (winnerFighter.id === "mandela") drawMandelaReconciliation();
      else drawGandhiTeaTruce();
    } else {
      drawFighter(player, false);
      drawFighter(opponent, opponent.id === "training-dummy");
    }
    if (gameState === "intro" && findPairInteraction(player.id, opponent.id)?.type === "handshake") {
      drawHandshake();
    }
    if (gameState === "intro" && findPairInteraction(player.id, opponent.id)?.type === "obama-trump") {
      drawObamaTrumpIntro();
    }
    if (gameState === "intro" && findPairInteraction(player.id, opponent.id)?.type === "putin-trump") {
      drawPutinTrumpIntro();
    }
    if (gameState === "intro" && findPairInteraction(player.id, opponent.id)?.type === "queen-trump") {
      drawQueenTrumpIntro();
    }
    if (gameState === "intro" && findPairInteraction(player.id, opponent.id)?.type === "gandhi-queen") {
      drawGandhiQueenIntro();
    }
    if (gameState === "intro" && findPairInteraction(player.id, opponent.id)?.type === "churchill-queen") {
      drawChurchillQueenIntro();
    }
    if (gameState === "intro" && findPairInteraction(player.id, opponent.id)?.type === "mandela-gandhi") {
      drawMandelaGandhiIntro();
    }
    if (gameState === "intro" && findPairInteraction(player.id, opponent.id)?.type === "chavez-trump") {
      drawChavezTrumpIntro();
    }
    drawEffects();
    if (superTimer > 0) drawSmokeMushroom();
    if (lulaSuperTimer > 0) drawLulaSuper();
    if (obamaSuperTimer > 0) drawObamaSuper();
    if (getulioSuperTimer > 0) drawGetulioSuper();
    if (danceTimer > 0 && danceFighter) drawDanceCue();
    if (bolsonaroSuperTimer > 0) drawBolsonaroSuper();
    if (jkSuperTimer > 0) drawJKSuper();
    if (queenSuperTimer > 0) drawQueenSuper();
    if (gandhiSuperTimer > 0) drawGandhiSuper();
    if (churchillSuperTimer > 0) drawChurchillSuper();
    if (mandelaSuperTimer > 0) {
      ctx.fillStyle = "#f4d681";
      ctx.font = "700 18px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DISCURSO DE UNIÃO", WIDTH / 2, 72);
    }
    if (chavezSuperTimer > 0) drawChavezSuper();
    if (putinSuperTimer > 0 && putinSuperTarget) {
      ctx.fillStyle = "#d6ece6";
      ctx.font = "700 20px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("JUDÔ!", putinSuperTarget.x, FLOOR - 120);
    }
    if (gameState === "finish" && winnerFighter?.id === "jk") drawJKFinisher();
    if (gameState === "finish") drawFinishCard();
    if (gameState === "finish" && winnerFighter?.id === "putin" && loserFighter?.id === "trump") drawPutinVictoryFlag();
    if (gameState === "finish" && winnerFighter?.id === "trump" && loserFighter?.id === "putin") {
      ctx.fillStyle = "#f4d681";
      ctx.font = "700 22px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Trump ri do Putin!", WIDTH / 2, 135);
    }
    if (gameState === "over") drawGameOver();
    if (superFlash > 0) {
      ctx.fillStyle = `rgba(255, 224, 135, ${superFlash * 0.15})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    ctx.restore();
  }

  function drawBackground() {
    const arena = arenaSelect.value;
    const burnt = superTimer > 0 && arena !== "nuclear-prop";
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, burnt ? "#4c302b" : "#253651");
    sky.addColorStop(0.65, burnt ? "#9b5b39" : "#8a7080");
    sky.addColorStop(1, burnt ? "#be7950" : "#d59b83");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (arena === "brasilia") drawBrasiliaBackdrop();
    else if (arena === "basketball") drawBasketballBackdrop();
    else if (arena === "tea-room") drawTeaRoomBackdrop();
    else if (arena === "nuclear-prop") drawNuclearPropBackdrop();
    else if (arena === "three-powers") drawThreePowersBackdrop();
    else if (arena === "amazon") drawAmazonBackdrop();
    else drawTrainingGymBackdrop();
    if (burnt) drawBurntBackdrop();
  }

  function drawBurntBackdrop() {
    ctx.fillStyle = "rgba(49, 37, 37, 0.28)";
    ctx.fillRect(0, 0, WIDTH, FLOOR);
    ctx.fillStyle = "rgba(34, 27, 29, 0.32)";
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.ellipse(70 + i * 145, FLOOR - 25 - (i % 3) * 8, 92, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBrasiliaBackdrop() {
    ctx.fillStyle = "#c5c6c1";
    ctx.fillRect(104, FLOOR - 85, 752, 85);
    ctx.fillStyle = "#e2ddd0";
    ctx.beginPath();
    ctx.moveTo(165, FLOOR - 85);
    ctx.lineTo(410, FLOOR - 130);
    ctx.lineTo(795, FLOOR - 85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#7f8e98";
    for (let x = 225; x <= 730; x += 74) ctx.fillRect(x, FLOOR - 78, 13, 78);
    ctx.fillStyle = "#566777";
    ctx.fillRect(355, FLOOR - 177, 52, 92);
    ctx.fillRect(553, FLOOR - 177, 52, 92);
    ctx.fillStyle = "#d9d4c8";
    ctx.fillRect(348, FLOOR - 183, 66, 8);
    ctx.fillRect(546, FLOOR - 183, 66, 8);
  }

  function drawBasketballBackdrop() {
    ctx.fillStyle = "#34415a";
    ctx.fillRect(0, FLOOR - 190, WIDTH, 190);
    for (let row = 0; row < 4; row += 1) {
      ctx.fillStyle = row % 2 ? "#526078" : "#414e66";
      ctx.fillRect(0, FLOOR - 150 + row * 28, WIDTH, 19);
      for (let x = 18 + (row % 2) * 10; x < WIDTH; x += 28) {
        ctx.fillStyle = ["#d18b70", "#e0bd79", "#83b4b1"][Math.floor(x / 28) % 3];
        ctx.fillRect(x, FLOOR - 143 + row * 28, 12, 9);
      }
    }
    ctx.fillStyle = "#d9dedf";
    ctx.fillRect(76, FLOOR - 235, 8, 70);
    ctx.fillRect(54, FLOOR - 235, 58, 5);
    ctx.strokeStyle = "#ef8d45";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(104, FLOOR - 163, 22, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#f4d681";
    ctx.fillRect(792, 62, 112, 42);
    ctx.fillStyle = "#283149";
    ctx.font = "700 14px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText("ARENA", 848, 88);
  }

  function drawTeaRoomBackdrop() {
    ctx.fillStyle = "#8b6358";
    ctx.fillRect(0, FLOOR - 205, WIDTH, 205);
    ctx.fillStyle = "#d9cdb3";
    ctx.fillRect(75, FLOOR - 178, 210, 115);
    ctx.fillRect(675, FLOOR - 178, 210, 115);
    ctx.strokeStyle = "#725440";
    ctx.lineWidth = 7;
    ctx.strokeRect(75, FLOOR - 178, 210, 115);
    ctx.strokeRect(675, FLOOR - 178, 210, 115);
    ctx.fillStyle = "#d69b58";
    ctx.fillRect(0, FLOOR - 43, WIDTH, 15);
    ctx.fillStyle = "#725440";
    ctx.fillRect(352, FLOOR - 111, 256, 12);
    ctx.fillRect(375, FLOOR - 99, 9, 36);
    ctx.fillRect(576, FLOOR - 99, 9, 36);
    ctx.fillStyle = "#f4eee0";
    ctx.fillRect(430, FLOOR - 142, 42, 30);
    ctx.beginPath();
    ctx.ellipse(486, FLOOR - 142, 22, 11, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(466, FLOOR - 142, 41, 30);
    ctx.fillStyle = "#725440";
    ctx.fillRect(480, FLOOR - 119, 12, 7);
  }

  function drawTrainingGymBackdrop() {
    ctx.fillStyle = "#283149";
    for (let x = 0; x < WIDTH; x += 120) {
      ctx.fillRect(x, FLOOR - 185, 8, 185);
      ctx.fillStyle = "#465875";
      ctx.fillRect(x + 8, FLOOR - 185, 112, 8);
      ctx.fillStyle = "#283149";
    }
    ctx.strokeStyle = "#d9dedf";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR - 139);
    ctx.lineTo(WIDTH, FLOOR - 139);
    ctx.moveTo(0, FLOOR - 78);
    ctx.lineTo(WIDTH, FLOOR - 78);
    ctx.stroke();
    ctx.fillStyle = "#8b6358";
    ctx.fillRect(822, FLOOR - 166, 48, 94);
    ctx.fillStyle = "#d6a77f";
    ctx.beginPath();
    ctx.ellipse(846, FLOOR - 166, 24, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d9dedf";
    ctx.fillRect(78, FLOOR - 114, 110, 8);
    ctx.fillRect(88, FLOOR - 106, 8, 37);
    ctx.fillRect(170, FLOOR - 106, 8, 37);
  }

  function drawNuclearPropBackdrop() {
    ctx.fillStyle = "#423c46";
    ctx.fillRect(0, FLOOR - 80, WIDTH, 80);
    ctx.fillStyle = "#7b7780";
    ctx.beginPath();
    ctx.ellipse(780, FLOOR - 94, 76, 118, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a9a5a4";
    ctx.beginPath();
    ctx.ellipse(760, FLOOR - 126, 28, 54, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d8d1b3";
    ctx.fillRect(690, FLOOR - 27, 180, 25);
    ctx.fillStyle = "#303b47";
    ctx.font = "700 10px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CENOGRÁFICA", 780, FLOOR - 10);
    ctx.fillStyle = "#f4d681";
    ctx.fillRect(760, FLOOR - 220, 4, 8);
    ctx.fillRect(766, FLOOR - 215, 4, 8);
  }

  function drawThreePowersBackdrop() {
    ctx.fillStyle = "#c9c6bc";
    ctx.fillRect(0, FLOOR - 46, WIDTH, 46);
    ctx.fillStyle = "#a9aaa5";
    for (const x of [180, 445, 710]) {
      ctx.fillRect(x, FLOOR - 193, 26, 147);
      ctx.fillRect(x - 15, FLOOR - 204, 56, 12);
      ctx.fillRect(x - 15, FLOOR - 53, 56, 10);
    }
    ctx.fillStyle = "#e2ddd0";
    ctx.fillRect(0, FLOOR - 215, WIDTH, 9);
    ctx.fillStyle = "#546575";
    ctx.fillRect(165, FLOOR - 227, 587, 10);
    ctx.fillStyle = "#d9d4c8";
    ctx.fillRect(100, FLOOR - 31, 760, 7);
  }

  function drawAmazonBackdrop() {
    ctx.fillStyle = "#203b36";
    for (let i = 0; i < 12; i += 1) {
      const x = i * 86 - 18;
      ctx.fillStyle = i % 2 ? "#31594a" : "#426b4e";
      ctx.fillRect(x + 31, FLOOR - 192, 18, 192);
      ctx.beginPath();
      ctx.arc(x + 39, FLOOR - 192, 49 + (i % 3) * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#68875a";
      ctx.fillRect(x + 5, FLOOR - 140, 16, 8);
      ctx.fillRect(x + 51, FLOOR - 112, 18, 8);
    }
    ctx.fillStyle = "#477a78";
    ctx.beginPath();
    ctx.moveTo(0, FLOOR - 67);
    ctx.quadraticCurveTo(270, FLOOR - 111, 480, FLOOR - 67);
    ctx.quadraticCurveTo(710, FLOOR - 25, WIDTH, FLOOR - 76);
    ctx.lineTo(WIDTH, FLOOR);
    ctx.lineTo(0, FLOOR);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#8fb0a0";
    ctx.fillRect(0, FLOOR - 69, WIDTH, 3);
  }

  function drawFloor() {
    const arena = arenaSelect.value;
    const floors = {
      brasilia: ["#7e8585", "#e3d6c1"],
      basketball: ["#9a6547", "#e8c986"],
      "tea-room": ["#684940", "#c5a77e"],
      "nuclear-prop": ["#423c46", "#b8b2a7"],
      "three-powers": ["#aaa99e", "#e0d9c7"],
      amazon: ["#30443b", "#6f9a78"],
      "training-gym": ["#282536", "#d08772"],
    };
    const [floorColor, stripeColor] = superTimer > 0 && arena !== "nuclear-prop"
      ? ["#30272a", "#bb7151"]
      : floors[arena] || floors["training-gym"];
    ctx.fillStyle = floorColor;
    ctx.fillRect(0, FLOOR, WIDTH, HEIGHT - FLOOR);
    ctx.fillStyle = stripeColor;
    ctx.fillRect(0, FLOOR, WIDTH, 5);
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(0, FLOOR + 18, WIDTH, 2);
  }

  function drawFighterAction(fighter) {
    if (fighter.attack > 0 && !fighter.knockedDown) {
      const reach = fighter.facing * (25 + (fighter.attack > 0.12 ? 18 : 0));
      ctx.fillStyle = fighter.color;
      roundRect(reach + (fighter.facing > 0 ? 0 : -23), -55, 23, 10, 4);
      ctx.fill();
      ctx.fillStyle = "#d8a57e";
      ctx.fillRect(reach + fighter.facing * 19, -55, 7, 10);
    } else if (fighter.block && !fighter.knockedDown) {
      ctx.strokeStyle = "#e7d6a5";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(fighter.facing * 12, -55);
      ctx.lineTo(fighter.facing * 29, -78);
      ctx.stroke();
    }
  }

  function drawFighter(fighter, isDummy) {
    const x = fighter.x;
    const y = fighter.y || FLOOR;
    const knocked = fighter.knockedDown;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.1, 1.1);
    if (!knocked) ctx.translate(0, Math.sin(performance.now() / 190 + x) * 1.4);
    if (knocked) {
      ctx.rotate(-0.15);
      ctx.translate(48, -12);
    }
    if (fighter.flash > 0) ctx.globalAlpha = 0.55 + Math.sin(fighter.flash * 70) * 0.35;

    ctx.fillStyle = "rgba(20, 17, 26, 0.32)";
    ctx.beginPath();
    ctx.ellipse(0, 1, isDummy ? 42 : 38, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (fighter.seatedOnTires) {
      ctx.restore();
      drawTirePile(x, y);
      ctx.save();
      ctx.translate(x, y - 25);
      ctx.fillStyle = fighter.id === "training-dummy" ? "#94a9ad" : "#d8a57e";
      ctx.beginPath();
      ctx.arc(0, -57, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fighter.trim;
      ctx.fillRect(-18, -46, 36, 20);
      ctx.strokeStyle = fighter.color;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-14, -31);
      ctx.lineTo(-34, -22);
      ctx.lineTo(0, -22);
      ctx.moveTo(14, -31);
      ctx.lineTo(34, -22);
      ctx.lineTo(4, -22);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (fighter.seatedOnChair) {
      ctx.restore();
      if (fighter.coveredInBlackConfetti) drawInterviewChair(x, y);
      else drawChairFinisher(x, y, "FIM DE JOGO", fighter.id === "obama");
      ctx.save();
      ctx.translate(x, y - (fighter.id === "obama" ? 65 : 35));
      ctx.fillStyle = fighter.id === "training-dummy" ? "#94a9ad" : "#d8a57e";
      ctx.beginPath();
      ctx.arc(0, -57, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fighter.trim;
      ctx.fillRect(-18, -46, 36, 20);
      if (fighter.coveredInBlackConfetti) {
        ctx.fillStyle = "#202020";
        for (const [dotX, dotY] of [[-12, -75], [4, -68], [-7, -54], [12, -48], [-15, -42], [5, -37]]) {
          ctx.fillRect(dotX, dotY, 5, 5);
        }
      }
      ctx.restore();
      return;
    }

    if (fighter.seatedOnMats) {
      ctx.restore();
      drawMatsPile(x, y);
      ctx.save();
      ctx.translate(x, y - 35);
      ctx.fillStyle = fighter.id === "training-dummy" ? "#94a9ad" : "#d8a57e";
      ctx.beginPath();
      ctx.arc(0, -57, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fighter.trim;
      ctx.fillRect(-18, -46, 36, 22);
      ctx.restore();
      ctx.fillStyle = "#f4d681";
      ctx.font = "700 12px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("FIM", x, y - 78);
      return;
    }

    if (fighter.seatedOnCushion) {
      ctx.restore();
      drawCushionFinisher(x, y);
      ctx.save();
      ctx.translate(x, y - 25);
      ctx.fillStyle = fighter.id === "training-dummy" ? "#94a9ad" : "#d8a57e";
      ctx.beginPath();
      ctx.arc(0, -57, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fighter.trim;
      ctx.fillRect(-18, -46, 36, 20);
      ctx.restore();
      return;
    }

    if (fighter.seatedOnArmchair) {
      ctx.restore();
      drawArmchairFinisher(x, y);
      ctx.save();
      ctx.translate(x, y - 25);
      ctx.fillStyle = fighter.id === "training-dummy" ? "#94a9ad" : "#d8a57e";
      ctx.beginPath();
      ctx.arc(0, -57, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fighter.trim;
      ctx.fillRect(-18, -46, 36, 20);
      ctx.restore();
      return;
    }

    if (fighter.flattenedOnRoad) {
      ctx.restore();
      ctx.save();
      ctx.translate(x, y - 8);
      ctx.scale(1, 0.18);
      ctx.fillStyle = fighter.color;
      ctx.strokeStyle = "#f2eee2";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-42, -80, 84, 60, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (fighter.id === "bolsonaro") {
      drawPixelBolsonaro();
      drawFighterAction(fighter);
      ctx.restore();
      return;
    }

    if (fighter.id === "lula") {
      drawPixelLula();
      drawFighterAction(fighter);
      ctx.restore();
      if (fighter.frozenTimer > 0) drawFreezeStars(x, y);
      return;
    }

    if (fighter.id === "obama") {
      drawPixelObama();
      drawFighterAction(fighter);
      ctx.restore();
      if (fighter.frozenTimer > 0) drawFreezeStars(x, y);
      return;
    }

    if (fighter.id === "putin") {
      drawPixelPutin();
      drawFighterAction(fighter);
      ctx.restore();
      if (fighter.knockedDown) {
        ctx.fillStyle = "#f4d681";
        ctx.font = "700 14px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("JUDÔ!", x, y - 105);
      }
      return;
    }

    if (fighter.id === "getulio") {
      drawPixelGetulio();
      drawFighterAction(fighter);
      ctx.restore();
      return;
    }

    if (fighter.id === "queen-elizabeth") {
      drawPixelQueen();
      drawFighterAction(fighter);
      ctx.restore();
      return;
    }

    if (fighter.id === "gandhi") {
      drawPixelGandhi();
      drawFighterAction(fighter);
      ctx.restore();
      return;
    }

    if (fighter.id === "churchill") {
      drawPixelChurchill();
      drawFighterAction(fighter);
      ctx.restore();
      return;
    }

    if (fighter.id === "mandela") {
      drawPixelMandela();
      drawFighterAction(fighter);
      ctx.restore();
      return;
    }

    if (fighter.id === "chavez") {
      drawPixelChavez();
      drawFighterAction(fighter);
      ctx.restore();
      return;
    }

    if (fighter.id === "jk") {
      drawPixelJK();
      drawFighterAction(fighter);
      ctx.restore();
      return;
    }

    if (fighter.id === "kim") {
      drawPixelKim();
      drawFighterAction(fighter);
      ctx.restore();
      return;
    }

    if (fighter.id === "trump") {
      drawPixelTrump(fighter);
      ctx.restore();
      if (fighter.frozenTimer > 0 && !fighter.knockedDown) drawFreezeStars(x, y);
      return;
    }

    ctx.fillStyle = fighter.trim;
    roundRect(-19, -62, 38, 49, 7);
    ctx.fill();
    ctx.fillStyle = fighter.color;
    roundRect(-21, -64, 42, 33, 6);
    ctx.fill();
    ctx.fillStyle = fighter.trim;
    roundRect(-25, -31, 16, 29, 5);
    ctx.fill();
    roundRect(9, -31, 16, 29, 5);
    ctx.fill();

    if (gameState === "finish" && fighter === player) {
      ctx.fillStyle = fighter.color;
      ctx.save();
      ctx.translate(-18, -57);
      ctx.rotate(-0.88);
      roundRect(-7, -42, 14, 45, 6);
      ctx.fill();
      ctx.restore();
    }

    if (fighter.attack > 0 && !knocked) {
      const reach = fighter.facing * (28 + (fighter.attack > 0.12 ? 22 : 0));
      ctx.fillStyle = fighter.color;
      roundRect(reach + (fighter.facing > 0 ? 0 : -27), -56, 27, 12, 5);
      ctx.fill();
    } else if (fighter.block) {
      ctx.fillStyle = "#d8d9dc";
      roundRect(fighter.facing * 15 - 5, -63, 10, 26, 5);
      ctx.fill();
    }
    if (fighter.frozenTimer > 0 && !knocked) {
      ctx.strokeStyle = fighter.color;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-20, -54);
      ctx.lineTo(-38, -75);
      ctx.moveTo(20, -54);
      ctx.lineTo(38, -75);
      ctx.stroke();
    }

    ctx.fillStyle = isDummy ? "#94a9ad" : "#d6a77f";
    ctx.beginPath();
    ctx.arc(0, -78, isDummy ? 15 : 17, 0, Math.PI * 2);
    ctx.fill();
    if (isDummy) {
      ctx.strokeStyle = "#e7d6a5";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -44, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-7, -44);
      ctx.lineTo(7, -44);
      ctx.moveTo(0, -51);
      ctx.lineTo(0, -37);
      ctx.stroke();
    }
    ctx.restore();

    if (fighter === superFighter && superTimer > 0) {
      drawSiren(x - 28, y - 120);
    }
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  function drawSiren(x, y) {
    const pulse = 0.5 + Math.sin(performance.now() / 75) * 0.5;
    ctx.fillStyle = "#27374f";
    roundRect(x - 11, y + 14, 22, 7, 2);
    ctx.fill();
    ctx.fillStyle = pulse > 0.5 ? "#fa5664" : "#ffd36d";
    ctx.beginPath();
    ctx.arc(x, y + 9, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 230, 160, 0.75)";
    ctx.fillRect(x - 2, y - 7, 4, 9);
    ctx.fillRect(x - 16, y + 1, 4, 3);
    ctx.fillRect(x + 12, y + 1, 4, 3);
  }

  function drawSmokeMushroom() {
    const age = 2.8 - superTimer;
    const scale = Math.min(1, age * 2.2);
    const x = WIDTH / 2;
    const y = FLOOR - 83;
    ctx.save();
    ctx.globalAlpha = Math.min(0.72, superTimer * 0.55);
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#514c4c";
    ctx.beginPath();
    ctx.moveTo(-14, 4);
    ctx.lineTo(-8, -24);
    ctx.quadraticCurveTo(-40, -26, -42, -48);
    ctx.quadraticCurveTo(-42, -66, -22, -66);
    ctx.quadraticCurveTo(-22, -92, 0, -86);
    ctx.quadraticCurveTo(22, -94, 24, -66);
    ctx.quadraticCurveTo(46, -65, 41, -46);
    ctx.quadraticCurveTo(39, -26, 8, -24);
    ctx.lineTo(15, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(246, 202, 124, 0.38)";
    ctx.beginPath();
    ctx.ellipse(-11, -56, 14, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawEffects() {
    for (const effect of effects) {
      ctx.save();
      if (effect.kind === "paper") {
        ctx.translate(effect.x, effect.y);
        ctx.rotate(effect.angle);
        ctx.fillStyle = "#f6e8be";
        ctx.fillRect(-6, -8, 12, 16);
        ctx.fillStyle = "#d78468";
        ctx.fillRect(-3, -4, 6, 2);
        ctx.fillRect(-3, 0, 6, 1);
      } else if (effect.kind === "confetti") {
        ctx.translate(effect.x, effect.y);
        ctx.rotate(effect.angle);
        ctx.fillStyle = effect.color;
        ctx.fillRect(-4, -7, 8, 14);
      } else {
        ctx.globalAlpha = Math.min(1, effect.life * 3);
        ctx.fillStyle = effect.color;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawFinishCard() {
    ctx.fillStyle = "rgba(9, 13, 24, 0.68)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#ffe08a";
    ctx.font = "700 36px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    const winner = winnerFighter || player;
    const loser = loserFighter || opponent;
    const variant = BOLSONARO_MATCHUP_VARIANTS[`${winner.id}:${loser.id}`];
    ctx.fillText(
      winner.id === "bolsonaro"
        ? "Imbroxável!"
        : winner.id === "trump"
          ? "ENCERRADO!"
          : `${winner.name} venceu!`,
      WIDTH / 2,
      185
    );
    ctx.fillStyle = "#fff";
    ctx.font = "500 18px 'Segoe UI', Arial, sans-serif";
    const finishDescription = variant?.kind === "fireworks"
      ? variant.line
      : winner.id === "bolsonaro"
        ? "Rival tonto • queda sentada num monte de pneus"
        : winner.id === "trump"
          ? "Rival congelado na pose • chuva de confete"
          : winner.id === "lula"
            ? "Fumaça distrai o rival • cadeira de churrasco • FIM DE JOGO"
            : winner.id === "obama"
              ? "Cadeira de árbitro • FIM DE JOGO"
              : winner.id === "putin"
                ? "Rival sentado nos tatames • juiz encerra a luta"
                : winner.id === "getulio"
                  ? "Cadeira de café • FIM DE JOGO"
                  : winner.id === "jk"
                    ? "Rolo compressor • rival como adesivo na estrada"
                    : winner.id === "queen-elizabeth"
                      ? "Guarda de brinquedo • almofada • juiz encerra a luta"
                        : winner.id === "gandhi"
                          ? "Abraço de trégua • os dois se sentam para tomar chá • juiz encerra"
                          : winner.id === "churchill"
                            ? "Fumaça distrai o rival • poltrona de gabinete • juiz encerra a luta"
                            : winner.id === "mandela"
                              ? "Banco de reconciliação • aperto de mão • juiz encerra a luta"
                              : winner.id === "chavez"
                                ? "Confete preto • cadeira de entrevista • juiz encerra a luta"
                        : "Pose de propaganda • chuva de panfletos • nocaute cartunesco";
    ctx.fillText(finishDescription, WIDTH / 2, 220);
    if (winner.id === "trump") {
      ctx.fillStyle = "#f8f2d9";
      ctx.fillRect(WIDTH / 2 - 65, 240, 130, 36);
      ctx.strokeStyle = "#b6443e";
      ctx.lineWidth = 4;
      ctx.strokeRect(WIDTH / 2 - 65, 240, 130, 36);
      ctx.fillStyle = "#ad3d36";
      ctx.font = "700 17px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("ENCERRADO", WIDTH / 2, 264);
    }
  }

  function drawGameOver() {
    ctx.fillStyle = "rgba(9, 13, 24, 0.58)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "700 25px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    const loserId = loserFighter?.id || (winnerId === player.id ? opponent.id : player.id);
    const message = winnerId === "bolsonaro"
      ? "Imbroxável!"
      : loserId === "bolsonaro"
        ? "Pegaram meu telefone"
        : gameMode.value === "pvp"
          ? `Jogador ${winnerId === player.id ? "1" : "2"} venceu!`
          : `${winnerId ? CHARACTERS[winnerId].name : opponent.name} venceu o treino`;
    ctx.fillText(message, WIDTH / 2, 210);
  }

  function frame(timestamp) {
    const dt = Math.min(0.035, (timestamp - lastFrame) / 1000 || 0);
    lastFrame = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  const keyMap = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "jump",
    a: "light",
    A: "light",
    s: "heavy",
    S: "heavy",
    d: "block",
    D: "block",
    f: "super",
    F: "super",
  };
  const playerTwoKeyMap = {
    j: "p2:left",
    J: "p2:left",
    l: "p2:right",
    L: "p2:right",
    i: "p2:jump",
    I: "p2:jump",
    u: "p2:light",
    U: "p2:light",
    o: "p2:heavy",
    O: "p2:heavy",
    p: "p2:block",
    P: "p2:block",
    ";": "p2:super",
  };

  window.addEventListener("keydown", (event) => {
    const action = keyMap[event.key] || playerTwoKeyMap[event.key];
    if (!action) return;
    event.preventDefault();
    keys.add(action);
  });

  window.addEventListener("keyup", (event) => {
    const action = keyMap[event.key] || playerTwoKeyMap[event.key];
    if (action) keys.delete(action);
  });

  window.addEventListener("blur", () => keys.clear());
  restartButton.addEventListener("click", resetGame);
  playerName.addEventListener("change", resetGame);
  opponentName.addEventListener("change", resetGame);
  gameMode.addEventListener("change", resetGame);
  gameDifficulty.addEventListener("change", resetGame);
  arenaSelect.addEventListener("change", resetGame);

  document.querySelectorAll("[data-control]").forEach((button) => {
    const action = button.dataset.control;
    const release = () => touchControls.delete(action);
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      touchControls.add(action);
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });

  updateModeUi();
  resetGame();
  requestAnimationFrame(frame);
})();
