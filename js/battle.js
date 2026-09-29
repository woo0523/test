const S = BattleState;
const $ = id => document.getElementById(id);

function render() {
  $("playerHp").style.width = Math.max(0, S.playerHp / S.maxPlayerHp * 100) + "%";
  $("playerMp").style.width = Math.max(0, S.playerMp / S.maxPlayerMp * 100) + "%";
  $("enemyHp").style.width = Math.max(0, S.enemyHp / S.maxEnemyHp * 100) + "%";
  $("playerHpText").textContent = S.playerHp + " / " + S.maxPlayerHp;
  $("playerMpText").textContent = S.playerMp + " / " + S.maxPlayerMp;
  $("enemyHpText").textContent = S.enemyHp + " / " + S.maxEnemyHp;
  $("turnNumber").textContent = String(S.turn).padStart(2, "0");
  $("turnText").textContent = S.phase === "player" ? "PLAYER TURN" : "ENEMY TURN";
  $("playerOrder").classList.toggle("is-active", S.phase === "player");
  $("enemyOrder").classList.toggle("is-active", S.phase === "enemy");
  $("enemyOrder").classList.toggle("is-enemy-active", S.phase === "enemy");
  $("potionCount").textContent = "×" + S.potions;

  document.querySelectorAll("[data-action]").forEach(button => {
    const actionName = button.dataset.action;
    const unavailableSkill = actionName === "skill" && S.playerMp < S.skillCost;
    const unavailablePotion = actionName === "potion" && (S.potions <= 0 || S.playerHp >= S.maxPlayerHp);
    button.disabled = S.phase !== "player" || S.ended || unavailableSkill || unavailablePotion;
  });
}

function log(message) {
  $("battleLog").textContent = message;
}

function endBattle(won) {
  S.ended = true;
  $("resultTitle").textContent = won ? "VICTORY" : "DEFEAT";
  $("resultText").textContent = won ? "고블린을 쓰러뜨렸다." : "플레이어가 쓰러졌다.";
  $("result").classList.remove("hidden");
  render();
  $("restart").focus();
}

function enemyTurn() {
  if (S.ended) return;
  S.phase = "enemy";
  render();
  log("고블린이 공격한다...");

  window.setTimeout(function () {
    let damage = Math.floor(Math.random() * 10) + 12;
    if (S.defending) {
      damage = Math.max(1, Math.floor(damage * 0.4));
      S.defending = false;
    }

    S.playerHp = Math.max(0, S.playerHp - damage);
    BattleFX.enemyAttack();
    BattleFX.damage(damage, "player");
    BattleAudio.beep(110, .12, "sawtooth");
    log("고블린의 공격! " + damage + " 데미지");
    render();
    if (S.playerHp <= 0) {
      endBattle(false);
      return;
    }

    window.setTimeout(function () {
      S.turn += 1;
      S.phase = "player";
      render();
      log("행동을 선택하세요.");
    }, 760);
  }, 680);
}

function performAction(actionName) {
  if (S.phase !== "player" || S.ended) return;

  if (actionName === "potion") {
    if (S.potions <= 0 || S.playerHp >= S.maxPlayerHp) return;
    S.potions -= 1;
    const recovered = Math.min(40, S.maxPlayerHp - S.playerHp);
    S.playerHp += recovered;
    BattleAudio.beep(520, .12, "sine");
    log("포션으로 HP " + recovered + " 회복");
    render();
    enemyTurn();
    return;
  }

  if (actionName === "defend") {
    S.defending = true;
    BattleAudio.beep(260, .12, "triangle");
    log("방어 자세를 취했다. 다음 피해가 감소한다.");
    enemyTurn();
    return;
  }

  const power = actionName === "skill";
  if (power && S.playerMp < S.skillCost) {
    log("MP가 부족하다.");
    return;
  }
  if (power) S.playerMp -= S.skillCost;

  const damage = power
    ? Math.floor(Math.random() * 16) + 30
    : Math.floor(Math.random() * 9) + 16;
  BattleFX.attack(power);
  BattleAudio.beep(power ? 420 : 250, .09, power ? "sawtooth" : "square");
  render();
  log(power ? "파워 슬래시!" : "공격!");

  window.setTimeout(function () {
    const dealt = Math.min(S.enemyHp, damage);
    S.enemyHp = Math.max(0, S.enemyHp - damage);
    BattleFX.damage(dealt, "enemy");
    log((power ? "파워 슬래시! " : "공격! ") + dealt + " 데미지");
    render();
    if (S.enemyHp <= 0) {
      endBattle(true);
      return;
    }
    enemyTurn();
  }, power ? 360 : 300);
}

document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => performAction(button.dataset.action));
});

document.addEventListener("keydown", event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if (event.key >= "1" && event.key <= "4") {
    const actions = ["attack", "skill", "potion", "defend"];
    const button = document.querySelector('[data-action="' + actions[Number(event.key) - 1] + '"]');
    if (button && !button.disabled) button.click();
  }
});

$("restart").addEventListener("click", () => window.location.reload());
render();

