import Weapon from "../js/Weapon.js";

export const weapons = {
  rustedSword: new Weapon({
    name: "Rusted Sword",
    type: "sword",
    rarity: "common",
    damage: 18,
    staminaCost: 14,
    attackSpeed: 1,
    range: 2,
    strengthScaling: 0.25,
    dexterityScaling: 0.15,
    description:
      "A worn blade carried by forgotten soldiers of the upper ruins.",
  }),

  gravekeeperBlade: new Weapon({
    name: "Gravekeeper Blade",
    type: "sword",
    rarity: "uncommon",
    damage: 26,
    staminaCost: 16,
    attackSpeed: 1.05,
    range: 2.1,
    strengthScaling: 0.35,
    dexterityScaling: 0.2,
    bleed: 8,
    description:
      "A narrow sword used by those who guarded the dead beneath the old kingdom.",
  }),

  hollowCleaver: new Weapon({
    name: "Hollow Cleaver",
    type: "greatsword",
    rarity: "rare",
    damage: 42,
    staminaCost: 28,
    attackSpeed: 0.72,
    range: 2.55,
    strengthScaling: 0.65,
    dexterityScaling: 0.08,
    bleed: 12,
    description: "A massive chipped blade stained by centuries of battle.",
  }),

  emberFang: new Weapon({
    name: "Ember Fang",
    type: "sword",
    rarity: "rare",
    damage: 32,
    staminaCost: 18,
    attackSpeed: 1.08,
    range: 2.05,
    strengthScaling: 0.28,
    dexterityScaling: 0.42,
    fire: 14,
    description: "A blade forged around a fragment of living ember.",
  }),

  frostNeedle: new Weapon({
    name: "Frost Needle",
    type: "rapier",
    rarity: "rare",
    damage: 25,
    staminaCost: 12,
    attackSpeed: 1.4,
    range: 2.3,
    strengthScaling: 0.08,
    dexterityScaling: 0.7,
    frost: 18,
    critical: 1.9,
    description: "A thin crystalline weapon that leaves frozen wounds.",
  }),

  abyssalGreatsword: new Weapon({
    name: "Abyssal Greatsword",
    type: "greatsword",
    rarity: "epic",
    damage: 58,
    staminaCost: 34,
    attackSpeed: 0.65,
    range: 2.8,
    strengthScaling: 0.8,
    dexterityScaling: 0.05,
    dark: 22,
    description:
      "A heavy blade that seems to absorb the light around its edge.",
  }),

  venomDagger: new Weapon({
    name: "Venom Dagger",
    type: "dagger",
    rarity: "epic",
    damage: 21,
    staminaCost: 9,
    attackSpeed: 1.75,
    range: 1.55,
    strengthScaling: 0.05,
    dexterityScaling: 0.85,
    poison: 28,
    critical: 2.1,
    description: "A ritual dagger coated in a poison that never dries.",
  }),

  sunkenKingsBlade: new Weapon({
    name: "Blade of the Sunken King",
    type: "longsword",
    rarity: "legendary",
    damage: 66,
    staminaCost: 24,
    attackSpeed: 1,
    range: 2.45,
    strengthScaling: 0.58,
    dexterityScaling: 0.52,
    dark: 15,
    frost: 10,
    critical: 1.75,
    special: "Royal Execution",
    description:
      "The last weapon carried by the king who descended beneath the capital and never returned.",
  }),

  wardenGreatsword: new Weapon({
    name: "Warden Greatsword",
    type: "greatsword",
    rarity: "boss",
    damage: 78,
    staminaCost: 38,
    attackSpeed: 0.62,
    range: 3,
    strengthScaling: 0.95,
    dexterityScaling: 0.08,
    bleed: 16,
    critical: 1.6,
    special: "Gravebreaker",
    description:
      "The execution blade of the Grave Warden. Heavy attacks release a violent shockwave.",
  }),

  boneKingScepter: new Weapon({
    name: "Scepter of the Bone King",
    type: "staff",
    rarity: "boss",
    damage: 55,
    staminaCost: 26,
    attackSpeed: 0.9,
    range: 2.2,
    strengthScaling: 0.15,
    dexterityScaling: 0.25,
    dark: 42,
    special: "Call of the Dead",
    description:
      "A forbidden relic carved from the remains of an ancient monarch.",
  }),

  watcherTwinblade: new Weapon({
    name: "Watcher Twinblade",
    type: "twinblade",
    rarity: "boss",
    damage: 62,
    staminaCost: 21,
    attackSpeed: 1.45,
    range: 2.4,
    strengthScaling: 0.35,
    dexterityScaling: 0.82,
    bleed: 20,
    critical: 1.8,
    special: "Abyss Step",
    description:
      "A twin-edged weapon carried by hunters who watched the abyss.",
  }),
};

export const weaponList = Object.values(weapons);

export function getWeapon(id) {
  const weapon = weapons[id];

  if (!weapon) {
    return null;
  }

  return weapon.clone();
}

export function getWeaponsByRarity(rarity) {
  return weaponList.filter((weapon) => weapon.rarity === rarity);
}

export function getRandomWeapon(rarity = null) {
  let pool = weaponList;

  if (rarity) {
    pool = getWeaponsByRarity(rarity);
  }

  if (pool.length === 0) {
    return null;
  }

  const weapon = pool[Math.floor(Math.random() * pool.length)];

  return weapon.clone();
}
