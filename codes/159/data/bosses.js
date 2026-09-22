export const bosses = {
  graveWarden: {
    id: "grave-warden",
    name: "Grave Warden",
    floor: 1,
    health: 800,
    damage: 28,
    speed: 1.25,
    attackRange: 2.4,
    detectionRange: 18,
    soulsReward: 1800,
    loot: [
      {
        type: "weapon",
        weaponId: "wardenGreatsword",
        chance: 1,
      },
      {
        type: "bossSoul",
        id: "grave-warden-soul",
        name: "Soul of the Grave Warden",
        chance: 1,
      },
    ],
  },

  boneKing: {
    id: "bone-king",
    name: "The Bone King",
    floor: 3,
    health: 1450,
    damage: 36,
    speed: 1.15,
    attackRange: 2.7,
    detectionRange: 20,
    soulsReward: 3200,
    loot: [
      {
        type: "weapon",
        weaponId: "boneKingScepter",
        chance: 1,
      },
      {
        type: "bossSoul",
        id: "bone-king-soul",
        name: "Soul of the Bone King",
        chance: 1,
      },
    ],
  },

  abyssWatcher: {
    id: "abyss-watcher",
    name: "Abyss Watcher",
    floor: 5,
    health: 2100,
    damage: 42,
    speed: 2.1,
    attackRange: 2.5,
    detectionRange: 22,
    soulsReward: 5200,
    loot: [
      {
        type: "weapon",
        weaponId: "watcherTwinblade",
        chance: 1,
      },
      {
        type: "bossSoul",
        id: "abyss-watcher-soul",
        name: "Soul of the Abyss Watcher",
        chance: 1,
      },
    ],
  },

  devourer: {
    id: "devourer",
    name: "The Devourer Below",
    floor: 7,
    health: 3400,
    damage: 58,
    speed: 1.45,
    attackRange: 3.4,
    detectionRange: 24,
    soulsReward: 8500,
    loot: [
      {
        type: "weapon",
        weaponId: "abyssalGreatsword",
        chance: 1,
      },
      {
        type: "bossSoul",
        id: "devourer-soul",
        name: "Soul of the Devourer",
        chance: 1,
      },
    ],
  },

  fallenGod: {
    id: "fallen-god",
    name: "The Fallen God",
    floor: 10,
    health: 6000,
    damage: 72,
    speed: 1.8,
    attackRange: 3.2,
    detectionRange: 28,
    soulsReward: 20000,
    loot: [
      {
        type: "weapon",
        weaponId: "sunkenKingsBlade",
        chance: 1,
      },
      {
        type: "bossSoul",
        id: "fallen-god-soul",
        name: "Soul of the Fallen God",
        chance: 1,
      },
    ],
  },
};

export function getBoss(id) {
  const boss = bosses[id];

  if (!boss) {
    return null;
  }

  return {
    ...boss,
    loot: boss.loot.map((item) => ({
      ...item,
    })),
  };
}

export function getBossByFloor(floor) {
  const entry = Object.values(bosses).find((boss) => boss.floor === floor);

  if (!entry) {
    return null;
  }

  return {
    ...entry,
    loot: entry.loot.map((item) => ({
      ...item,
    })),
  };
}

export function getAllBosses() {
  return Object.values(bosses).map((boss) => ({
    ...boss,
    loot: boss.loot.map((item) => ({
      ...item,
    })),
  }));
}
