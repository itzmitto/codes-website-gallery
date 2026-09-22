export default class Armor {
  constructor(options = {}) {
    this.id = options.id || crypto.randomUUID();

    this.name = options.name || "Unknown Armor";

    this.slot = options.slot || "chest";

    this.rarity = options.rarity || "common";

    this.defense = options.defense || 0;

    this.physicalDefense = options.physicalDefense ?? this.defense;

    this.fireDefense = options.fireDefense || 0;

    this.frostDefense = options.frostDefense || 0;

    this.darkDefense = options.darkDefense || 0;

    this.poisonResistance = options.poisonResistance || 0;

    this.bleedResistance = options.bleedResistance || 0;

    this.weight = options.weight || 1;

    this.vitality = options.vitality || 0;

    this.endurance = options.endurance || 0;

    this.strength = options.strength || 0;

    this.dexterity = options.dexterity || 0;

    this.healthBonus = options.healthBonus || 0;

    this.staminaBonus = options.staminaBonus || 0;

    this.description = options.description || "";

    this.special = options.special || null;

    this.level = options.level || 1;

    this.maxLevel = options.maxLevel || 10;
  }

  getDefense() {
    const upgradeMultiplier = 1 + (this.level - 1) * 0.08;

    return Math.round(this.defense * upgradeMultiplier);
  }

  getPhysicalDefense() {
    const upgradeMultiplier = 1 + (this.level - 1) * 0.08;

    return Math.round(this.physicalDefense * upgradeMultiplier);
  }

  getElementalDefense() {
    const multiplier = 1 + (this.level - 1) * 0.05;

    return {
      fire: Math.round(this.fireDefense * multiplier),

      frost: Math.round(this.frostDefense * multiplier),

      dark: Math.round(this.darkDefense * multiplier),
    };
  }

  getResistances() {
    return {
      poison: this.poisonResistance,

      bleed: this.bleedResistance,
    };
  }

  upgrade() {
    if (this.level >= this.maxLevel) {
      return false;
    }

    this.level += 1;

    return true;
  }

  getUpgradeCost() {
    return Math.round(
      120 * this.level * this.level * this.getRarityMultiplier(),
    );
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
      (this.getDefense() * 8 +
        this.fireDefense * 3 +
        this.frostDefense * 3 +
        this.darkDefense * 3) *
        this.getRarityMultiplier(),
    );
  }

  getDisplayName() {
    if (this.level <= 1) {
      return this.name;
    }

    return `${this.name} +${this.level - 1}`;
  }

  applyToPlayer(player) {
    if (!player) {
      return;
    }

    player.armorDefense = this.getDefense();

    player.armorPhysicalDefense = this.getPhysicalDefense();

    player.armorFireDefense = this.getElementalDefense().fire;

    player.armorFrostDefense = this.getElementalDefense().frost;

    player.armorDarkDefense = this.getElementalDefense().dark;

    player.poisonResistance = this.poisonResistance;

    player.bleedResistance = this.bleedResistance;

    player.armorWeight = this.weight;

    player.armorVitality = this.vitality;

    player.armorEndurance = this.endurance;

    player.armorStrength = this.strength;

    player.armorDexterity = this.dexterity;

    player.armorHealthBonus = this.healthBonus;

    player.armorStaminaBonus = this.staminaBonus;
  }

  removeFromPlayer(player) {
    if (!player) {
      return;
    }

    player.armorDefense = 0;
    player.armorPhysicalDefense = 0;
    player.armorFireDefense = 0;
    player.armorFrostDefense = 0;
    player.armorDarkDefense = 0;
    player.poisonResistance = 0;
    player.bleedResistance = 0;
    player.armorWeight = 0;
    player.armorVitality = 0;
    player.armorEndurance = 0;
    player.armorStrength = 0;
    player.armorDexterity = 0;
    player.armorHealthBonus = 0;
    player.armorStaminaBonus = 0;
  }

  toInventoryItem() {
    return {
      id: this.id,

      name: this.getDisplayName(),

      type: "armor",

      slot: this.slot,

      rarity: this.rarity,

      defense: this.getDefense(),

      physicalDefense: this.getPhysicalDefense(),

      fireDefense: this.fireDefense,

      frostDefense: this.frostDefense,

      darkDefense: this.darkDefense,

      poisonResistance: this.poisonResistance,

      bleedResistance: this.bleedResistance,

      weight: this.weight,

      vitality: this.vitality,

      endurance: this.endurance,

      strength: this.strength,

      dexterity: this.dexterity,

      healthBonus: this.healthBonus,

      staminaBonus: this.staminaBonus,

      level: this.level,

      special: this.special,

      description: this.description,

      armor: this,
    };
  }

  clone() {
    return new Armor({
      name: this.name,

      slot: this.slot,

      rarity: this.rarity,

      defense: this.defense,

      physicalDefense: this.physicalDefense,

      fireDefense: this.fireDefense,

      frostDefense: this.frostDefense,

      darkDefense: this.darkDefense,

      poisonResistance: this.poisonResistance,

      bleedResistance: this.bleedResistance,

      weight: this.weight,

      vitality: this.vitality,

      endurance: this.endurance,

      strength: this.strength,

      dexterity: this.dexterity,

      healthBonus: this.healthBonus,

      staminaBonus: this.staminaBonus,

      description: this.description,

      special: this.special,

      level: this.level,

      maxLevel: this.maxLevel,
    });
  }
}
