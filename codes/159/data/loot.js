export const lootTables = {
  commonChest: [
    {
      type: "souls",
      amountMin: 80,
      amountMax: 180,
      weight: 45,
    },
    {
      type: "consumable",
      id: "ashen-flask",
      name: "Ashen Flask",
      heal: 35,
      rarity: "common",
      weight: 25,
    },
    {
      type: "weapon",
      weaponId: "rustedSword",
      rarity: "common",
      weight: 20,
    },
    {
      type: "weapon",
      weaponId: "gravekeeperBlade",
      rarity: "uncommon",
      weight: 10,
    },
  ],

  silverChest: [
    {
      type: "souls",
      amountMin: 180,
      amountMax: 450,
      weight: 30,
    },
    {
      type: "consumable",
      id: "greater-ashen-flask",
      name: "Greater Ashen Flask",
      heal: 60,
      rarity: "uncommon",
      weight: 20,
    },
    {
      type: "weapon",
      weaponId: "gravekeeperBlade",
      rarity: "uncommon",
      weight: 22,
    },
    {
      type: "weapon",
      weaponId: "emberFang",
      rarity: "rare",
      weight: 14,
    },
    {
      type: "weapon",
      weaponId: "frostNeedle",
      rarity: "rare",
      weight: 14,
    },
  ],

  goldChest: [
    {
      type: "souls",
      amountMin: 450,
      amountMax: 900,
      weight: 24,
    },
    {
      type: "weapon",
      weaponId: "emberFang",
      rarity: "rare",
      weight: 18,
    },
    {
      type: "weapon",
      weaponId: "frostNeedle",
      rarity: "rare",
      weight: 18,
    },
    {
      type: "weapon",
      weaponId: "hollowCleaver",
      rarity: "rare",
      weight: 18,
    },
    {
      type: "weapon",
      weaponId: "abyssalGreatsword",
      rarity: "epic",
      weight: 10,
    },
    {
      type: "weapon",
      weaponId: "venomDagger",
      rarity: "epic",
      weight: 12,
    },
  ],

  cursedChest: [
    {
      type: "souls",
      amountMin: 800,
      amountMax: 1800,
      weight: 25,
    },
    {
      type: "weapon",
      weaponId: "venomDagger",
      rarity: "epic",
      weight: 20,
    },
    {
      type: "weapon",
      weaponId: "abyssalGreatsword",
      rarity: "epic",
      weight: 20,
    },
    {
      type: "weapon",
      weaponId: "sunkenKingsBlade",
      rarity: "legendary",
      weight: 7,
    },
    {
      type: "curse",
      id: "blood-debt",
      name: "Blood Debt",
      rarity: "epic",
      weight: 28,
    },
  ],

  secretRoom: [
    {
      type: "souls",
      amountMin: 600,
      amountMax: 1400,
      weight: 28,
    },
    {
      type: "weapon",
      weaponId: "frostNeedle",
      rarity: "rare",
      weight: 18,
    },
    {
      type: "weapon",
      weaponId: "venomDagger",
      rarity: "epic",
      weight: 17,
    },
    {
      type: "weapon",
      weaponId: "abyssalGreatsword",
      rarity: "epic",
      weight: 17,
    },
    {
      type: "relic",
      id: "forgotten-eye",
      name: "Forgotten Eye",
      rarity: "legendary",
      weight: 8,
    },
    {
      type: "relic",
      id: "abyss-shard",
      name: "Abyss Shard",
      rarity: "legendary",
      weight: 12,
    },
  ],

  eliteEnemy: [
    {
      type: "souls",
      amountMin: 90,
      amountMax: 220,
      weight: 55,
    },
    {
      type: "weapon",
      weaponId: "gravekeeperBlade",
      rarity: "uncommon",
      weight: 18,
    },
    {
      type: "weapon",
      weaponId: "hollowCleaver",
      rarity: "rare",
      weight: 12,
    },
    {
      type: "consumable",
      id: "ashen-flask",
      name: "Ashen Flask",
      heal: 35,
      rarity: "common",
      weight: 15,
    },
  ],
};

export function getRandomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rollLoot(tableName) {
  const table = lootTables[tableName];

  if (!table || table.length === 0) {
    return null;
  }

  const totalWeight = table.reduce((total, item) => total + item.weight, 0);

  let roll = Math.random() * totalWeight;

  for (const item of table) {
    roll -= item.weight;

    if (roll <= 0) {
      const result = {
        ...item,
      };

      if (result.type === "souls") {
        result.amount = getRandomAmount(result.amountMin, result.amountMax);
      }

      return result;
    }
  }

  return {
    ...table[table.length - 1],
  };
}

export function rollMultipleLoot(tableName, amount = 1) {
  const results = [];

  for (let i = 0; i < amount; i++) {
    const item = rollLoot(tableName);

    if (item) {
      results.push(item);
    }
  }

  return results;
}
