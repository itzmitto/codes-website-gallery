export default class LevelSystem {
  constructor(player) {
    this.player = player;

    this.level = 1;

    this.stats = {
      vitality: 10,
      endurance: 10,
      strength: 10,
      dexterity: 10,
      defense: 10,
    };

    this.baseCost = 120;
    this.costGrowth = 1.32;

    this.listeners = new Set();

    this.applyStats();
  }

  getLevelCost() {
    return Math.floor(
      this.baseCost * Math.pow(this.costGrowth, this.level - 1),
    );
  }

  canLevelUp() {
    return this.player.souls >= this.getLevelCost();
  }

  levelUp(stat) {
    if (!Object.prototype.hasOwnProperty.call(this.stats, stat)) {
      return false;
    }

    const cost = this.getLevelCost();

    if (!this.player.spendSouls(cost)) {
      return false;
    }

    this.stats[stat] += 1;
    this.level += 1;

    this.player.setLevel(this.level);

    this.applyStats();
    this.emitChange();

    window.dispatchEvent(
      new CustomEvent("player:level-up", {
        detail: {
          level: this.level,
          stat,
          value: this.stats[stat],
          cost,
        },
      }),
    );

    return true;
  }

  applyStats() {
    this.player.maxHealth = 100 + (this.stats.vitality - 10) * 12;

    this.player.maxStamina = 100 + (this.stats.endurance - 10) * 8;

    this.player.walkSpeed = 4.8 + (this.stats.dexterity - 10) * 0.015;

    this.player.sprintSpeed = 7.5 + (this.stats.dexterity - 10) * 0.025;

    this.player.staminaRegen = 28 + (this.stats.endurance - 10) * 1.2;

    this.player.strength = this.stats.strength;

    this.player.dexterity = this.stats.dexterity;

    this.player.defense = this.stats.defense;

    if (this.player.health > this.player.maxHealth) {
      this.player.health = this.player.maxHealth;
    }

    if (this.player.stamina > this.player.maxStamina) {
      this.player.stamina = this.player.maxStamina;
    }

    this.player.updateUI();
  }

  getStat(stat) {
    return this.stats[stat] ?? null;
  }

  getAllStats() {
    return {
      ...this.stats,
    };
  }

  getDamageReduction() {
    const defense = this.stats.defense;

    return Math.min(0.6, defense * 0.012);
  }

  getStrengthBonus() {
    return this.stats.strength * 0.8;
  }

  getDexterityBonus() {
    return this.stats.dexterity * 0.65;
  }

  getHealthIncrease() {
    return this.player.maxHealth - 100;
  }

  getStaminaIncrease() {
    return this.player.maxStamina - 100;
  }

  reset() {
    this.level = 1;

    this.stats = {
      vitality: 10,
      endurance: 10,
      strength: 10,
      dexterity: 10,
      defense: 10,
    };

    this.player.setLevel(1);

    this.applyStats();
    this.emitChange();
  }

  serialize() {
    return {
      level: this.level,
      stats: {
        ...this.stats,
      },
    };
  }

  load(data) {
    if (!data) {
      return;
    }

    if (typeof data.level === "number") {
      this.level = Math.max(1, Math.floor(data.level));
    }

    if (data.stats && typeof data.stats === "object") {
      for (const stat of Object.keys(this.stats)) {
        if (typeof data.stats[stat] === "number") {
          this.stats[stat] = Math.max(1, Math.floor(data.stats[stat]));
        }
      }
    }

    this.player.setLevel(this.level);

    this.applyStats();
    this.emitChange();
  }

  onChange(callback) {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  emitChange() {
    const state = {
      level: this.level,
      stats: this.getAllStats(),
      nextCost: this.getLevelCost(),
    };

    for (const listener of this.listeners) {
      listener(state);
    }
  }
}
