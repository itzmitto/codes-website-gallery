export const enemies = {
  hollowSwordsman: {
    id: "hollow-swordsman",
    name: "Hollow Swordsman",
    health: 70,
    damage: 12,
    speed: 1.8,
    attackRange: 1.6,
    detectionRange: 8,
    attackCooldown: 1.2,
    soulsReward: 35,
    elite: false,
  },

  hollowGuard: {
    id: "hollow-guard",
    name: "Hollow Guard",
    health: 95,
    damage: 16,
    speed: 1.45,
    attackRange: 1.7,
    detectionRange: 8.5,
    attackCooldown: 1.35,
    soulsReward: 50,
    elite: false,
  },

  ashenHollow: {
    id: "ashen-hollow",
    name: "Ashen Hollow",
    health: 80,
    damage: 14,
    speed: 2.25,
    attackRange: 1.55,
    detectionRange: 9,
    attackCooldown: 1.05,
    soulsReward: 45,
    elite: false,
  },

  lostKnight: {
    id: "lost-knight",
    name: "Lost Knight",
    health: 120,
    damage: 20,
    speed: 1.35,
    attackRange: 1.85,
    detectionRange: 9,
    attackCooldown: 1.5,
    soulsReward: 80,
    elite: false,
  },

  dungeonWatcher: {
    id: "dungeon-watcher",
    name: "Dungeon Watcher",
    health: 150,
    damage: 24,
    speed: 1.5,
    attackRange: 1.9,
    detectionRange: 10,
    attackCooldown: 1.35,
    soulsReward: 110,
    elite: false,
  },

  graveStalker: {
    id: "grave-stalker",
    name: "Grave Stalker",
    health: 105,
    damage: 22,
    speed: 2.8,
    attackRange: 1.45,
    detectionRange: 11,
    attackCooldown: 0.9,
    soulsReward: 95,
    elite: false,
  },

  plagueKnight: {
    id: "plague-knight",
    name: "Plague Knight",
    health: 180,
    damage: 27,
    speed: 1.4,
    attackRange: 2,
    detectionRange: 10,
    attackCooldown: 1.4,
    soulsReward: 150,
    poison: 12,
    elite: false,
  },

  frostWraith: {
    id: "frost-wraith",
    name: "Frost Wraith",
    health: 130,
    damage: 25,
    speed: 2.1,
    attackRange: 2.2,
    detectionRange: 12,
    attackCooldown: 1.15,
    soulsReward: 145,
    frost: 15,
    elite: false,
  },

  abyssHound: {
    id: "abyss-hound",
    name: "Abyss Hound",
    health: 115,
    damage: 26,
    speed: 3.1,
    attackRange: 1.4,
    detectionRange: 13,
    attackCooldown: 0.85,
    soulsReward: 125,
    dark: 10,
    elite: false,
  },

  cryptExecutioner: {
    id: "crypt-executioner",
    name: "Crypt Executioner",
    health: 280,
    damage: 42,
    speed: 1.05,
    attackRange: 2.4,
    detectionRange: 11,
    attackCooldown: 1.75,
    soulsReward: 280,
    elite: true,
  },

  cursedSentinel: {
    id: "cursed-sentinel",
    name: "Cursed Sentinel",
    health: 320,
    damage: 38,
    speed: 1.25,
    attackRange: 2.2,
    detectionRange: 12,
    attackCooldown: 1.45,
    soulsReward: 320,
    dark: 18,
    elite: true,
  },

  royalGraveguard: {
    id: "royal-graveguard",
    name: "Royal Graveguard",
    health: 390,
    damage: 48,
    speed: 1.4,
    attackRange: 2.3,
    detectionRange: 13,
    attackCooldown: 1.35,
    soulsReward: 450,
    bleed: 15,
    elite: true,
  },
};

export const floorEnemyPools = {
  1: ["hollowSwordsman", "hollowGuard", "ashenHollow"],

  2: ["hollowSwordsman", "lostKnight", "graveStalker"],

  3: ["lostKnight", "dungeonWatcher", "plagueKnight"],

  4: ["dungeonWatcher", "plagueKnight", "frostWraith"],

  5: ["graveStalker", "frostWraith", "abyssHound"],

  6: ["plagueKnight", "frostWraith", "abyssHound"],

  7: ["frostWraith", "abyssHound", "cryptExecutioner"],

  8: ["abyssHound", "cryptExecutioner", "cursedSentinel"],

  9: ["cryptExecutioner", "cursedSentinel", "royalGraveguard"],

  10: ["cursedSentinel", "royalGraveguard"],
};

export function getEnemy(id) {
  const enemy = enemies[id];

  if (!enemy) {
    return null;
  }

  return {
    ...enemy,
  };
}

export function getEnemyPoolForFloor(floor) {
  const normalizedFloor = Math.max(1, Math.min(10, Math.floor(floor)));

  const pool = floorEnemyPools[normalizedFloor];

  return pool.map((id) => getEnemy(id));
}

export function getRandomEnemyForFloor(floor) {
  const pool = getEnemyPoolForFloor(floor);

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getEliteEnemies() {
  return Object.values(enemies)
    .filter((enemy) => enemy.elite)
    .map((enemy) => ({
      ...enemy,
    }));
}
