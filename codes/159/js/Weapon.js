export default class Weapon {
  constructor(options = {}) {
    this.id = options.id || crypto.randomUUID();

    this.name = options.name || "Unknown Weapon";

    this.type = options.type || "sword";

    this.rarity = options.rarity || "common";

    this.damage = options.damage || 10;

    this.staminaCost = options.staminaCost || 15;

    this.attackSpeed = options.attackSpeed || 1;

    this.range = options.range || 2;

    this.strengthScaling = options.strengthScaling || 0;

    this.dexterityScaling = options.dexterityScaling || 0;

    this.bleed = options.bleed || 0;

    this.poison = options.poison || 0;

    this.fire = options.fire || 0;

    this.frost = options.frost || 0;

    this.dark = options.dark || 0;

    this.critical = options.critical || 1.5;

    this.description = options.description || "";

    this.special = options.special || null;

    this.level = options.level || 1;

    this.maxLevel = options.maxLevel || 10;
  }

  getDamage(playerStats = {}) {
    const strength = playerStats.strength || 0;

    const dexterity = playerStats.dexterity || 0;

    const strengthBonus = strength * this.strengthScaling;

    const dexterityBonus = dexterity * this.dexterityScaling;

    const upgradeMultiplier = 1 + (this.level - 1) * 0.12;

    return Math.round(
      (this.damage + strengthBonus + dexterityBonus) * upgradeMultiplier,
    );
  }

  getElementalDamage() {
    return {
      bleed: this.bleed,
      poison: this.poison,
      fire: this.fire,
      frost: this.frost,
      dark: this.dark,
    };
  }

  getTotalElementalDamage() {
    return this.bleed + this.poison + this.fire + this.frost + this.dark;
  }

  upgrade() {
    if (this.level >= this.maxLevel) {
      return false;
    }

    this.level += 1;

    return true;
  }

  getUpgradeCost() {
    const rarityMultiplier = this.getRarityMultiplier();

    return Math.round(150 * this.level * this.level * rarityMultiplier);
  }

  getRarityMultiplier() {
    if (this.rarity === "uncommon") {
      return 1.2;
    }

    if (this.rarity === "rare") {
      return 1.5;
    }

    if (this.rarity === "epic") {
      return 2;
    }

    if (this.rarity === "legendary") {
      return 3;
    }

    if (this.rarity === "boss") {
      return 4;
    }

    return 1;
  }

  getSellValue() {
    return Math.round(
      this.damage * this.getRarityMultiplier() * (1 + this.level * 0.4),
    );
  }

  getDisplayName() {
    if (this.level <= 1) {
      return this.name;
    }

    return `${this.name} +${this.level - 1}`;
  }

  getScalingGrade(value) {
    if (value >= 1) {
      return "S";
    }

    if (value >= 0.8) {
      return "A";
    }

    if (value >= 0.6) {
      return "B";
    }

    if (value >= 0.4) {
      return "C";
    }

    if (value >= 0.2) {
      return "D";
    }

    if (value > 0) {
      return "E";
    }

    return "-";
  }

  toInventoryItem() {
    return {
      id: this.id,
      name: this.getDisplayName(),
      type: "weapon",
      rarity: this.rarity,
      damage: this.damage,
      staminaCost: this.staminaCost,
      attackSpeed: this.attackSpeed,
      range: this.range,
      strengthScaling: this.strengthScaling,
      dexterityScaling: this.dexterityScaling,
      bleed: this.bleed,
      poison: this.poison,
      fire: this.fire,
      frost: this.frost,
      dark: this.dark,
      level: this.level,
      special: this.special,
      description: this.description,
      weapon: this,
    };
  }

  clone() {
    return new Weapon({
      name: this.name,
      type: this.type,
      rarity: this.rarity,
      damage: this.damage,
      staminaCost: this.staminaCost,
      attackSpeed: this.attackSpeed,
      range: this.range,
      strengthScaling: this.strengthScaling,
      dexterityScaling: this.dexterityScaling,
      bleed: this.bleed,
      poison: this.poison,
      fire: this.fire,
      frost: this.frost,
      dark: this.dark,
      critical: this.critical,
      description: this.description,
      special: this.special,
      level: this.level,
      maxLevel: this.maxLevel,
    });
  }
}
