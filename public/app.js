const statusEl = document.getElementById("battle-status");
const logEl = document.getElementById("battle-log");
const restartBtn = document.getElementById("restart");

const playerNameEl = document.getElementById("player-name");
const playerTypesEl = document.getElementById("player-types");
const playerSpriteEl = document.getElementById("player-sprite");
const playerHpTextEl = document.getElementById("player-hp-text");
const playerHpFillEl = document.getElementById("player-hp-fill");

const cpuNameEl = document.getElementById("cpu-name");
const cpuTypesEl = document.getElementById("cpu-types");
const cpuSpriteEl = document.getElementById("cpu-sprite");
const cpuHpTextEl = document.getElementById("cpu-hp-text");
const cpuHpFillEl = document.getElementById("cpu-hp-fill");

const moveButtons = [...document.querySelectorAll(".move")];

const MOVES = {
  quick: { label: "快速攻击", power: 18, accuracy: 0.95, heal: 0, priority: 1 },
  heavy: { label: "重击", power: 30, accuracy: 0.75, heal: 0, priority: 0 },
  heal: { label: "治疗", power: 0, accuracy: 1, heal: 20, priority: 2 }
};

const state = {
  data: [],
  player: null,
  cpu: null,
  over: false,
  busy: false
};

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function pickRandomPokemon() {
  return state.data[randInt(state.data.length)];
}

function createFighter(pokemon) {
  const baseHp = pokemon.stats.hp ?? 60;
  const maxHp = Math.max(80, baseHp * 2);
  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types,
    sprite: pokemon.sprite,
    maxHp,
    hp: maxHp,
    attack: pokemon.stats.attack ?? 52,
    defense: pokemon.stats.defense ?? 45,
    speed: pokemon.stats.speed ?? 50
  };
}

function appendLog(text) {
  const li = document.createElement("li");
  li.textContent = text;
  logEl.prepend(li);
  while (logEl.children.length > 8) {
    logEl.removeChild(logEl.lastChild);
  }
}

function hpPercent(fighter) {
  return Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
}

function renderFighter(fighter, nameEl, typesEl, spriteEl, hpTextEl, hpFillEl) {
  nameEl.textContent = `${fighter.name} #${fighter.id}`;
  typesEl.textContent = fighter.types.join(" / ");
  spriteEl.src = fighter.sprite;
  hpTextEl.textContent = `${fighter.hp}/${fighter.maxHp}`;
  hpFillEl.style.width = `${hpPercent(fighter)}%`;
}

function render() {
  renderFighter(state.player, playerNameEl, playerTypesEl, playerSpriteEl, playerHpTextEl, playerHpFillEl);
  renderFighter(state.cpu, cpuNameEl, cpuTypesEl, cpuSpriteEl, cpuHpTextEl, cpuHpFillEl);
}

function setActionEnabled(enabled) {
  for (const btn of moveButtons) {
    btn.disabled = !enabled;
  }
}

function calcDamage(attacker, defender, power) {
  const raw = (power * attacker.attack) / Math.max(10, defender.defense);
  const randomFactor = 0.85 + Math.random() * 0.3;
  return Math.max(8, Math.round(raw * randomFactor));
}

function chooseCpuMove() {
  const hpRate = state.cpu.hp / state.cpu.maxHp;
  if (hpRate < 0.35 && Math.random() < 0.6) {
    return "heal";
  }
  return Math.random() < 0.55 ? "quick" : "heavy";
}

function applyMove(actor, target, moveKey, actorTag) {
  const move = MOVES[moveKey];
  if (Math.random() > move.accuracy) {
    appendLog(`${actorTag}的${move.label}落空了`);
    return;
  }

  if (move.heal > 0) {
    const before = actor.hp;
    actor.hp = Math.min(actor.maxHp, actor.hp + move.heal);
    appendLog(`${actorTag}使用${move.label}，恢复${actor.hp - before} HP`);
    return;
  }

  const damage = calcDamage(actor, target, move.power);
  target.hp = Math.max(0, target.hp - damage);
  appendLog(`${actorTag}使用${move.label}，造成${damage}伤害`);
}

function checkBattleOver() {
  if (state.player.hp <= 0 && state.cpu.hp <= 0) {
    state.over = true;
    statusEl.textContent = "平局";
    appendLog("双方同时失去战斗能力");
    return true;
  }
  if (state.player.hp <= 0) {
    state.over = true;
    statusEl.textContent = "你输了";
    appendLog("你的宝可梦失去战斗能力");
    return true;
  }
  if (state.cpu.hp <= 0) {
    state.over = true;
    statusEl.textContent = "你赢了";
    appendLog("对手宝可梦失去战斗能力");
    return true;
  }
  return false;
}

function actionOrder(playerMove, cpuMove) {
  const p = MOVES[playerMove];
  const c = MOVES[cpuMove];

  if (p.priority !== c.priority) {
    return p.priority > c.priority
      ? [["player", playerMove], ["cpu", cpuMove]]
      : [["cpu", cpuMove], ["player", playerMove]];
  }

  if (state.player.speed === state.cpu.speed) {
    return Math.random() < 0.5
      ? [["player", playerMove], ["cpu", cpuMove]]
      : [["cpu", cpuMove], ["player", playerMove]];
  }

  return state.player.speed > state.cpu.speed
    ? [["player", playerMove], ["cpu", cpuMove]]
    : [["cpu", cpuMove], ["player", playerMove]];
}

function newBattle() {
  const p1 = pickRandomPokemon();
  let p2 = pickRandomPokemon();
  while (p1.id === p2.id) {
    p2 = pickRandomPokemon();
  }

  state.player = createFighter(p1);
  state.cpu = createFighter(p2);
  state.over = false;
  state.busy = false;

  logEl.textContent = "";
  statusEl.textContent = "战斗开始";
  appendLog(`你派出了 ${state.player.name}`);
  appendLog(`对手派出了 ${state.cpu.name}`);

  setActionEnabled(true);
  render();
}

async function playRound(playerMove) {
  if (state.over || state.busy) {
    return;
  }

  state.busy = true;
  setActionEnabled(false);

  const cpuMove = chooseCpuMove();
  const queue = actionOrder(playerMove, cpuMove);

  for (const [who, moveKey] of queue) {
    if (state.over) {
      break;
    }

    if (who === "player") {
      applyMove(state.player, state.cpu, moveKey, "你");
    } else {
      applyMove(state.cpu, state.player, moveKey, "对手");
    }

    render();
    if (checkBattleOver()) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  if (!state.over) {
    statusEl.textContent = "你的回合";
    setActionEnabled(true);
  }

  state.busy = false;
}

async function boot() {
  statusEl.textContent = "读取宝可梦数据...";
  const res = await fetch("../data/pokemon.json");
  if (!res.ok) {
    throw new Error(`加载失败: ${res.status}`);
  }
  state.data = await res.json();
  newBattle();
  statusEl.textContent = "你的回合";
}

for (const btn of moveButtons) {
  btn.addEventListener("click", () => {
    playRound(btn.dataset.move);
  });
}

restartBtn.addEventListener("click", () => {
  newBattle();
  statusEl.textContent = "你的回合";
});

boot().catch((err) => {
  statusEl.textContent = "数据加载失败";
  appendLog("无法开始战斗，请检查 data/pokemon.json");
  console.error(err);
});
