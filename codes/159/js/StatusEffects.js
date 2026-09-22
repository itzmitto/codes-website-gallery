export default class StatusEffects {
  constructor(player) {
    this.player = player;

    this.active = new Map();

    this.accumulation = {
      bleed: 0,
      poison: 0,
      frost: 0,
      dark: 0,
    };

    this.thresholds = {
      bleed: 100,
      poison: 100,
      frost: 100,
      dark: 100,
    };

    this.resistances = {
      bleed: 0,
      poison: 0,
      frost: 0,
      dark: 0,
    };
  }

  update(delta) {
    this.updateResistances();

    for (const [type, effect] of this.active) {
      effect.time -= delta;

      if (type === "poison") {
        this.updatePoison(effect, delta);
      }

      if (type === "frost") {
        this.updateFrost(effect);
      }

      if (type === "dark") {
        this.updateDark(effect);
      }

      if (effect.time <= 0) {
        this.removeEffect(type);
      }
    }

    this.decayAccumulation(delta);
  }

  updateResistances() {
    this.resistances.bleed = this.player.bleedResistance || 0;

    this.resistances.poison = this.player.poisonResistance || 0;

    this.resistances.frost = this.player.frostResistance || 0;

    this.resistances.dark = this.player.darkResistance || 0;
  }

  addBuildUp(type, amount) {
    if (!Object.prototype.hasOwnProperty.call(this.accumulation, type)) {
      return;
    }

    const resistance = this.resistances[type] || 0;

    const finalAmount = Math.max(
      0,
      amount * (1 - Math.min(resistance, 80) / 100),
    );

    this.accumulation[type] += finalAmount;

    const threshold = this.thresholds[type];

    if (this.accumulation[type] >= threshold) {
      this.trigger(type);

      this.accumulation[type] = 0;
    }

    window.dispatchEvent(
      new CustomEvent("status:buildup", {
        detail: {
          type,
          value: this.accumulation[type],
          threshold,
        },
      }),
    );
  }

  trigger(type) {
    if (type === "bleed") {
      this.triggerBleed();
    }

    if (type === "poison") {
      this.triggerPoison();
    }

    if (type === "frost") {
      this.triggerFrost();
    }

    if (type === "dark") {
      this.triggerDark();
    }

    window.dispatchEvent(
      new CustomEvent("status:triggered", {
        detail: {
          type,
        },
      }),
    );
  }

  triggerBleed() {
    const damage = Math.max(12, Math.round(this.player.maxHealth * 0.18));

    this.player.takeDamage(damage);

    window.dispatchEvent(
      new CustomEvent("status:bleed", {
        detail: {
          damage,
        },
      }),
    );
  }

  triggerPoison() {
    this.active.set("poison", {
      time: 10,
      tickTimer: 0,
      tickInterval: 0.75,
      damage: Math.max(2, Math.round(this.player.maxHealth * 0.012)),
    });
  }

  updatePoison(effect, delta) {
    effect.tickTimer -= delta;

    if (effect.tickTimer > 0) {
      return;
    }

    effect.tickTimer = effect.tickInterval;

    this.player.takeDamage(effect.damage);
  }

  triggerFrost() {
    this.active.set("frost", {
      time: 6,
      speedMultiplier: 0.65,
      staminaMultiplier: 0.55,
      damageTakenMultiplier: 1.15,
    });

    this.player.takeDamage(
      Math.max(8, Math.round(this.player.maxHealth * 0.08)),
    );
  }

  updateFrost(effect) {
    this.player.statusMoveMultiplier = effect.speedMultiplier;

    this.player.statusStaminaMultiplier = effect.staminaMultiplier;

    this.player.statusDamageTakenMultiplier = effect.damageTakenMultiplier;
  }

  triggerDark() {
    this.active.set("dark", {
      time: 8,
      maxHealthMultiplier: 0.82,
    });

    this.applyDarkPenalty();
  }

  updateDark() {
    this.applyDarkPenalty();
  }

  applyDarkPenalty() {
    const effect = this.active.get("dark");

    if (!effect) {
      return;
    }

    const baseMaxHealth = this.player.baseMaxHealth || this.player.maxHealth;

    this.player.darkHealthCap = Math.round(
      baseMaxHealth * effect.maxHealthMultiplier,
    );

    if (this.player.health > this.player.darkHealthCap) {
      this.player.health = this.player.darkHealthCap;

      this.player.updateUI();
    }
  }

  removeEffect(type) {
    this.active.delete(type);

    if (type === "frost") {
      this.player.statusMoveMultiplier = 1;

      this.player.statusStaminaMultiplier = 1;

      this.player.statusDamageTakenMultiplier = 1;
    }

    if (type === "dark") {
      this.player.darkHealthCap = null;
    }

    window.dispatchEvent(
      new CustomEvent("status:removed", {
        detail: {
          type,
        },
      }),
    );
  }

  clear() {
    for (const type of Array.from(this.active.keys())) {
      this.removeEffect(type);
    }

    this.accumulation = {
      bleed: 0,
      poison: 0,
      frost: 0,
      dark: 0,
    };
  }

  decayAccumulation(delta) {
    const decay = {
      bleed: 4,
      poison: 2,
      frost: 3,
      dark: 1.5,
    };

    for (const type of Object.keys(this.accumulation)) {
      if (this.active.has(type)) {
        continue;
      }

      this.accumulation[type] = Math.max(
        0,
        this.accumulation[type] - decay[type] * delta,
      );
    }
  }

  has(type) {
    return this.active.has(type);
  }

  getBuildUp(type) {
    return this.accumulation[type] || 0;
  }

  serialize() {
    return {
      accumulation: {
        ...this.accumulation,
      },

      active: Array.from(this.active.entries()).map(([type, effect]) => ({
        type,
        ...effect,
      })),
    };
  }
}
