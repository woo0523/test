window.BattleFX = {
  attack(power) {
    const player = document.getElementById("player");
    const goblin = document.getElementById("goblin");
    const impact = document.getElementById("impact");
    const slash = document.getElementById("slash");
    const distance = Math.max(78, Math.min(172, window.innerWidth * 0.12));

    player.animate([
      { transform: "translateX(0) scale(1)" },
      { transform: "translateX(" + distance + "px) scale(1.02)" },
      { transform: "translateX(0) scale(1)" }
    ], { duration: power ? 520 : 410, easing: "cubic-bezier(.2,.8,.2,1)" });

    window.setTimeout(function () {
      goblin.classList.add("hit");
      document.getElementById("game").classList.add("shake");
      impact.classList.toggle("power", Boolean(power));
      impact.classList.add("show");
      if (power) {
        slash.classList.remove("show");
        void slash.offsetWidth;
        slash.classList.add("show");
      }
      window.setTimeout(function () {
        goblin.classList.remove("hit");
        document.getElementById("game").classList.remove("shake");
        impact.classList.remove("show", "power");
        slash.classList.remove("show");
      }, 380);
    }, power ? 300 : 235);
  },
  enemyAttack() {
    const player = document.getElementById("player");
    const game = document.getElementById("game");
    player.classList.add("hit");
    game.classList.add("shake");
    window.setTimeout(function () {
      player.classList.remove("hit");
      game.classList.remove("shake");
    }, 360);
  },
  damage(amount, target) {
    const damage = document.getElementById("damage");
    const arena = document.getElementById("arena");
    const unit = document.getElementById(target === "player" ? "player" : "goblin");
    const unitRect = unit.getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();
    damage.textContent = "-" + amount;
    damage.style.left = (unitRect.left + unitRect.width * 0.56 - arenaRect.left) + "px";
    damage.style.top = (unitRect.top + unitRect.height * 0.26 - arenaRect.top) + "px";
    damage.classList.remove("show", "playerDamage");
    if (target === "player") damage.classList.add("playerDamage");
    void damage.offsetWidth;
    damage.classList.add("show");
  }
};

