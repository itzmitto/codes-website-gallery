import Armor from "../js/Armor.js";

export const armor = {
  wornPlate: new Armor({
    name: "Worn Plate",
    slot: "chest",
    rarity: "common",
    defense: 12,
    physicalDefense: 14,
    fireDefense: 3,
    frostDefense: 3,
    darkDefense: 2,
    weight: 5,
    description: "Old iron armor covered in scratches and dried ash.",
  }),

  gravekeeperMail: new Armor({
    name: "Gravekeeper Mail",
    slot: "chest",
    rarity: "uncommon",
    defense: 18,
    physicalDefense: 21,
    fireDefense: 6,
    frostDefense: 5,
    darkDefense: 7,
    bleedResistance: 8,
    weight: 6,
    vitality: 1,
    description: "Chain and plate once worn by guardians of the lower crypts.",
  }),

  emberKnightArmor: new Armor({
    name: "Ember Knight Armor",
    slot: "chest",
    rarity: "rare",
    defense: 27,
    physicalDefense: 28,
    fireDefense: 24,
    frostDefense: 7,
    darkDefense: 9,
    bleedResistance: 10,
    weight: 8,
    vitality: 2,
    strength: 1,
    healthBonus: 15,
    description:
      "Blackened armor that still holds the heat of an ancient flame.",
  }),

  frostboundPlate: new Armor({
    name: "Frostbound Plate",
    slot: "chest",
    rarity: "rare",
    defense: 25,
    physicalDefense: 26,
    fireDefense: 5,
    frostDefense: 30,
    darkDefense: 8,
    poisonResistance: 6,
    weight: 7,
    endurance: 2,
    staminaBonus: 15,
    description: "Cold steel fused with pale crystal from the frozen depths.",
  }),

  abyssWalkerArmor: new Armor({
    name: "Abyss Walker Armor",
    slot: "chest",
    rarity: "epic",
    defense: 34,
    physicalDefense: 35,
    fireDefense: 12,
    frostDefense: 12,
    darkDefense: 32,
    poisonResistance: 12,
    bleedResistance: 14,
    weight: 7,
    vitality: 2,
    dexterity: 2,
    healthBonus: 20,
    description: "Armor worn by warriors who walked too close to the abyss.",
  }),

  royalGraveguardPlate: new Armor({
    name: "Royal Graveguard Plate",
    slot: "chest",
    rarity: "legendary",
    defense: 45,
    physicalDefense: 50,
    fireDefense: 18,
    frostDefense: 16,
    darkDefense: 22,
    poisonResistance: 15,
    bleedResistance: 22,
    weight: 10,
    vitality: 3,
    endurance: 2,
    strength: 2,
    healthBonus: 35,
    staminaBonus: 15,
    special: "Unbroken Guard",
    description:
      "Heavy ceremonial armor worn by the final defenders of the royal tomb.",
  }),

  wardenArmor: new Armor({
    name: "Grave Warden Armor",
    slot: "chest",
    rarity: "boss",
    defense: 58,
    physicalDefense: 64,
    fireDefense: 20,
    frostDefense: 18,
    darkDefense: 28,
    poisonResistance: 20,
    bleedResistance: 35,
    weight: 12,
    vitality: 4,
    endurance: 3,
    strength: 3,
    healthBonus: 50,
    staminaBonus: 20,
    special: "Warden's Resolve",
    description:
      "The immense plate of the Grave Warden. Its weight is matched only by its protection.",
  }),

  boneKingMantle: new Armor({
    name: "Bone King's Mantle",
    slot: "chest",
    rarity: "boss",
    defense: 42,
    physicalDefense: 38,
    fireDefense: 14,
    frostDefense: 25,
    darkDefense: 48,
    poisonResistance: 28,
    bleedResistance: 18,
    weight: 6,
    vitality: 2,
    endurance: 3,
    dexterity: 2,
    healthBonus: 25,
    staminaBonus: 30,
    special: "Deathless Presence",
    description:
      "A mantle woven from burial cloth and fragments of ancient bone.",
  }),

  watcherArmor: new Armor({
    name: "Abyss Watcher Armor",
    slot: "chest",
    rarity: "boss",
    defense: 48,
    physicalDefense: 46,
    fireDefense: 22,
    frostDefense: 20,
    darkDefense: 42,
    poisonResistance: 18,
    bleedResistance: 25,
    weight: 7,
    endurance: 3,
    dexterity: 4,
    staminaBonus: 35,
    special: "Abyss Step",
    description:
      "Light plate designed for hunters who survived battles at the edge of the abyss.",
  }),
};

export const armorList = Object.values(armor);

export function getArmor(id) {
  const item = armor[id];

  if (!item) {
    return null;
  }

  return item.clone();
}

export function getArmorByRarity(rarity) {
  return armorList.filter((item) => item.rarity === rarity);
}

export function getRandomArmor(rarity = null) {
  let pool = armorList;

  if (rarity) {
    pool = getArmorByRarity(rarity);
  }

  if (pool.length === 0) {
    return null;
  }

  const item = pool[Math.floor(Math.random() * pool.length)];

  return item.clone();
}
