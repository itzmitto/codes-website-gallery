import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import Room from "./Room.js";
import Enemy from "./Enemy.js";
import Boss from "./Boss.js";
import Chest from "./Chest.js";
import { getRandomEnemyForFloor } from "../data/enemies.js";
import { getBossByFloor } from "../data/bosses.js";
import { rollMultipleLoot } from "../data/loot.js";

export default class Dungeon {
  constructor(scene, player, combat, options = {}) {
    this.scene = scene;
    this.player = player;
    this.combat = combat;

    this.floor = options.floor || 1;
    this.maxFloor = options.maxFloor || 10;

    this.roomSize = options.roomSize || 14;
    this.roomGap = options.roomGap || 5;
    this.doorWidth = options.doorWidth || 3.4;

    this.rooms = [];
    this.enemies = [];
    this.chests = [];
    this.bosses = [];
    this.corridors = [];

    this.currentRoom = null;
    this.startRoom = null;
    this.bossRoom = null;

    this.floorCompleted = false;

    this.layout = [];

    this.corridorMaterial = new THREE.MeshStandardMaterial({
      color: 0x24211d,
      roughness: 0.95,
      metalness: 0.02,
    });

    this.generateFloor(this.floor);
  }

  clearFloor() {
    for (const room of this.rooms) {
      if (room.group?.parent) {
        this.scene.remove(room.group);
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.group?.parent) {
        this.scene.remove(enemy.group);
      }
    }

    for (const chest of this.chests) {
      if (chest.group?.parent) {
        this.scene.remove(chest.group);
      }
    }

    for (const boss of this.bosses) {
      if (boss.group?.parent) {
        this.scene.remove(boss.group);
      }
    }

    for (const corridor of this.corridors) {
      if (corridor.parent) {
        this.scene.remove(corridor);
      }
    }

    this.rooms = [];
    this.enemies = [];
    this.chests = [];
    this.bosses = [];
    this.corridors = [];

    this.currentRoom = null;
    this.startRoom = null;
    this.bossRoom = null;

    this.layout = [];

    this.floorCompleted = false;

    this.combat.setEnemies([]);
  }

  generateFloor(floor) {
    this.clearFloor();

    this.floor = THREE.MathUtils.clamp(floor, 1, this.maxFloor);

    this.layout = this.createLayout();

    for (const roomData of this.layout) {
      const room = new Room(this.scene, {
        id: roomData.id,
        type: roomData.type,
        x: roomData.x,
        z: roomData.z,
        width: this.roomSize,
        depth: this.roomSize,
        doorWidth: this.doorWidth,
      });

      room.gridX = roomData.gridX;
      room.gridZ = roomData.gridZ;

      this.rooms.push(room);

      if (room.type === "start") {
        this.startRoom = room;
      }

      if (room.type === "boss") {
        this.bossRoom = room;
      }
    }

    this.createCorridors();
    this.populateRooms();
    this.updatePlayerBounds();

    if (this.startRoom) {
      const start = this.startRoom.getCenter();

      this.player.group.position.set(start.x, 0, start.z);

      this.currentRoom = this.startRoom;
    }

    this.refreshCombatEnemies();

    this.player.updateUI();

    window.dispatchEvent(
      new CustomEvent("dungeon:generated", {
        detail: {
          floor: this.floor,
          rooms: this.rooms,
        },
      }),
    );
  }

  createLayout() {
    const distance = this.roomSize + this.roomGap;

    const layout = [
      {
        id: `floor-${this.floor}-start`,
        type: "start",
        gridX: 0,
        gridZ: 0,
      },
      {
        id: `floor-${this.floor}-combat-1`,
        type: "combat",
        gridX: 0,
        gridZ: -1,
      },
      {
        id: `floor-${this.floor}-combat-2`,
        type: "combat",
        gridX: 1,
        gridZ: -1,
      },
      {
        id: `floor-${this.floor}-treasure`,
        type: "treasure",
        gridX: -1,
        gridZ: -1,
      },
      {
        id: `floor-${this.floor}-combat-3`,
        type: "combat",
        gridX: 1,
        gridZ: -2,
      },
      {
        id: `floor-${this.floor}-secret`,
        type: "secret",
        gridX: -1,
        gridZ: -2,
      },
      {
        id: `floor-${this.floor}-elite`,
        type: "elite",
        gridX: 0,
        gridZ: -2,
      },
      {
        id: `floor-${this.floor}-boss`,
        type: "boss",
        gridX: 0,
        gridZ: -3,
      },
    ];

    const extraRoomCount = Math.min(4, Math.floor(this.floor / 2));

    for (let i = 0; i < extraRoomCount; i++) {
      layout.push({
        id: `floor-${this.floor}-extra-${i}`,
        type: i % 3 === 2 ? "treasure" : "combat",
        gridX: i % 2 === 0 ? 2 : -2,
        gridZ: -1 - Math.floor(i / 2),
      });
    }

    return layout.map((room) => ({
      ...room,

      x: room.gridX * distance,

      z: room.gridZ * distance,
    }));
  }

  createCorridors() {
    const corridorLength = this.roomGap + 0.5;

    for (let i = 0; i < this.layout.length; i++) {
      for (let j = i + 1; j < this.layout.length; j++) {
        const first = this.layout[i];

        const second = this.layout[j];

        const gridXDistance = Math.abs(first.gridX - second.gridX);

        const gridZDistance = Math.abs(first.gridZ - second.gridZ);

        if (gridXDistance + gridZDistance !== 1) {
          continue;
        }

        const centerX = (first.x + second.x) / 2;

        const centerZ = (first.z + second.z) / 2;

        let geometry;

        if (gridXDistance === 1) {
          geometry = new THREE.BoxGeometry(
            corridorLength,
            0.12,
            this.doorWidth,
          );
        } else {
          geometry = new THREE.BoxGeometry(
            this.doorWidth,
            0.12,
            corridorLength,
          );
        }

        const corridor = new THREE.Mesh(geometry, this.corridorMaterial);

        corridor.position.set(centerX, 0.06, centerZ);

        corridor.receiveShadow = true;

        this.scene.add(corridor);

        this.corridors.push(corridor);
      }
    }
  }

  updatePlayerBounds() {
    if (this.layout.length === 0) {
      return;
    }

    const half = this.roomSize / 2;

    const padding = 0.6;

    const minX =
      Math.min(...this.layout.map((room) => room.x - half)) + padding;

    const maxX =
      Math.max(...this.layout.map((room) => room.x + half)) - padding;

    const minZ =
      Math.min(...this.layout.map((room) => room.z - half)) + padding;

    const maxZ =
      Math.max(...this.layout.map((room) => room.z + half)) - padding;

    this.player.minX = minX;
    this.player.maxX = maxX;
    this.player.minZ = minZ;
    this.player.maxZ = maxZ;
  }

  populateRooms() {
    for (const room of this.rooms) {
      if (room.type === "combat") {
        this.populateCombatRoom(room);
      }

      if (room.type === "elite") {
        this.populateEliteRoom(room);
      }

      if (room.type === "treasure") {
        this.populateTreasureRoom(room);
      }

      if (room.type === "secret") {
        this.populateSecretRoom(room);
      }

      if (room.type === "boss") {
        this.populateBossRoom(room);
      }
    }
  }

  populateCombatRoom(room) {
    const count = Math.min(2 + Math.floor(this.floor / 2), 6);

    for (let i = 0; i < count; i++) {
      const data = getRandomEnemyForFloor(this.floor);

      if (!data) {
        continue;
      }

      const position = room.getRandomPosition(2.5);

      const enemy = new Enemy(this.scene, this.player, {
        ...data,

        x: position.x,

        z: position.z,

        health: Math.round(data.health * this.getEnemyHealthMultiplier()),

        damage: Math.round(data.damage * this.getEnemyDamageMultiplier()),

        soulsReward: Math.round(data.soulsReward * this.getSoulMultiplier()),
      });

      enemy.activeRoom = room;

      room.addEnemy(enemy);

      this.enemies.push(enemy);
    }

    if (room.enemies.length > 0) {
      room.lock();
    } else {
      room.clear();
    }
  }

  populateEliteRoom(room) {
    const data = getRandomEnemyForFloor(
      Math.min(this.floor + 2, this.maxFloor),
    );

    if (!data) {
      room.clear();

      return;
    }

    const position = room.getCenter();

    const enemy = new Enemy(this.scene, this.player, {
      ...data,

      name: `Elite ${data.name}`,

      x: position.x,

      z: position.z,

      health: Math.round(data.health * 2.2 * this.getEnemyHealthMultiplier()),

      damage: Math.round(data.damage * 1.5 * this.getEnemyDamageMultiplier()),

      speed: data.speed * 1.1,

      soulsReward: Math.round(data.soulsReward * 3 * this.getSoulMultiplier()),
    });

    enemy.elite = true;
    enemy.activeRoom = room;

    room.addEnemy(enemy);

    this.enemies.push(enemy);

    room.lock();
  }

  populateTreasureRoom(room) {
    const center = room.getCenter();

    let type = "wood";

    if (this.floor >= 3) {
      type = "silver";
    }

    if (this.floor >= 6) {
      type = "gold";
    }

    if (this.floor >= 9) {
      type = "cursed";
    }

    const tableName =
      type === "wood"
        ? "commonChest"
        : type === "silver"
          ? "silverChest"
          : type === "gold"
            ? "goldChest"
            : "cursedChest";

    const loot = rollMultipleLoot(
      tableName,
      type === "gold" || type === "cursed" ? 2 : 1,
    );

    const chest = new Chest(this.scene, this.player, {
      type,

      x: center.x,

      z: center.z,

      loot: this.convertChestLoot(loot),
    });

    chest.activeRoom = room;

    room.addChest(chest);

    this.chests.push(chest);
  }

  populateSecretRoom(room) {
    const center = room.getCenter();

    const loot = rollMultipleLoot("secretRoom", 2);

    const chest = new Chest(this.scene, this.player, {
      type: "gold",

      x: center.x,

      z: center.z,

      loot: this.convertChestLoot(loot),
    });

    chest.activeRoom = room;

    room.addChest(chest);

    this.chests.push(chest);
  }

  populateBossRoom(room) {
    const data = getBossByFloor(this.floor);

    if (!data) {
      this.populateEliteBoss(room);

      return;
    }

    const center = room.getCenter();

    const boss = new Boss(this.scene, this.player, {
      ...data,

      x: center.x,

      z: center.z,

      health: Math.round(data.health * this.getBossHealthMultiplier()),

      damage: Math.round(data.damage * this.getBossDamageMultiplier()),
    });

    boss.activeRoom = room;

    room.addEnemy(boss);

    this.bosses.push(boss);

    room.lock();
  }

  populateEliteBoss(room) {
    const data = getRandomEnemyForFloor(this.floor);

    if (!data) {
      room.clear();

      return;
    }

    const center = room.getCenter();

    const boss = new Enemy(this.scene, this.player, {
      ...data,

      name: `Floor ${this.floor} Guardian`,

      x: center.x,

      z: center.z,

      health: Math.round(data.health * 4 * this.getEnemyHealthMultiplier()),

      damage: Math.round(data.damage * 2 * this.getEnemyDamageMultiplier()),

      speed: data.speed * 1.05,

      attackRange: Math.max(2, data.attackRange || 1.8),

      soulsReward: Math.round(data.soulsReward * 7 * this.getSoulMultiplier()),
    });

    boss.elite = true;
    boss.activeRoom = room;

    room.addEnemy(boss);

    this.enemies.push(boss);

    room.lock();
  }

  convertChestLoot(loot) {
    return loot.map((item) => {
      if (item.type === "souls") {
        return {
          type: "souls",
          amount: item.amount || 0,
        };
      }

      if (item.type === "consumable") {
        return {
          type: "heal",
          amount: item.heal || item.amount || 25,
        };
      }

      return {
        type: "souls",
        amount: this.getFallbackLootValue(item),
      };
    });
  }

  getFallbackLootValue(item) {
    const rarityValues = {
      common: 100,
      uncommon: 180,
      rare: 320,
      epic: 600,
      legendary: 1200,
      boss: 2000,
    };

    return rarityValues[item.rarity] || 100;
  }

  update(delta, time) {
    this.updateCurrentRoom();

    for (const room of this.rooms) {
      room.update();

      this.updateRoomState(room);
    }

    for (const enemy of this.enemies) {
      if (enemy.dead) {
        continue;
      }

      if (this.shouldUpdateEnemy(enemy)) {
        enemy.update(delta);
      }
    }

    for (const boss of this.bosses) {
      if (boss.dead) {
        continue;
      }

      if (this.shouldUpdateEnemy(boss)) {
        boss.update(delta, time);
      }
    }

    this.updateChests();
    this.updateFloorCompletion();
  }

  updateRoomState(room) {
    if (room.cleared) {
      return;
    }

    if (
      room.type !== "combat" &&
      room.type !== "elite" &&
      room.type !== "boss"
    ) {
      return;
    }

    if (!Array.isArray(room.enemies) || room.enemies.length === 0) {
      room.clear();

      return;
    }

    const allDead = room.enemies.every((enemy) => enemy.dead);

    if (allDead) {
      room.clear();
    }
  }

  updateCurrentRoom() {
    const position = this.player.group.position;

    let nextRoom = null;

    for (const room of this.rooms) {
      if (room.containsPosition(position)) {
        nextRoom = room;

        break;
      }
    }

    if (nextRoom === this.currentRoom) {
      return;
    }

    const previousRoom = this.currentRoom;

    this.currentRoom = nextRoom;

    window.dispatchEvent(
      new CustomEvent("dungeon:room-change", {
        detail: {
          previousRoom,
          room: this.currentRoom,
          floor: this.floor,
        },
      }),
    );
  }

  updateChests() {
    let nearest = null;
    let nearestDistance = Infinity;

    for (const chest of this.chests) {
      if (chest.opened) {
        chest.hideInteraction();

        continue;
      }

      if (
        chest.activeRoom &&
        this.currentRoom &&
        chest.activeRoom !== this.currentRoom
      ) {
        chest.hideInteraction();

        continue;
      }

      const distance = this.player.group.position.distanceTo(
        chest.group.position,
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;

        nearest = chest;
      }
    }

    for (const chest of this.chests) {
      if (chest.opened) {
        chest.hideInteraction();

        continue;
      }

      if (chest === nearest && nearestDistance <= chest.openRange) {
        chest.showInteraction();
      } else {
        chest.hideInteraction();
      }
    }
  }

  shouldUpdateEnemy(enemy) {
    if (!enemy.activeRoom) {
      return true;
    }

    if (!this.currentRoom) {
      return false;
    }

    return enemy.activeRoom === this.currentRoom;
  }

  refreshCombatEnemies() {
    const targets = [...this.enemies, ...this.bosses];

    this.combat.setEnemies(targets);
  }

  updateFloorCompletion() {
    if (this.floorCompleted) {
      return;
    }

    if (!this.bossRoom) {
      return;
    }

    if (!this.bossRoom.cleared) {
      return;
    }

    this.floorCompleted = true;

    window.dispatchEvent(
      new CustomEvent("dungeon:floor-complete", {
        detail: {
          floor: this.floor,
        },
      }),
    );
  }

  nextFloor() {
    if (!this.floorCompleted) {
      return false;
    }

    if (this.floor >= this.maxFloor) {
      window.dispatchEvent(new CustomEvent("dungeon:complete"));

      return false;
    }

    this.generateFloor(this.floor + 1);

    return true;
  }

  getEnemyHealthMultiplier() {
    return 1 + (this.floor - 1) * 0.17;
  }

  getEnemyDamageMultiplier() {
    return 1 + (this.floor - 1) * 0.11;
  }

  getBossHealthMultiplier() {
    return 1 + (this.floor - 1) * 0.12;
  }

  getBossDamageMultiplier() {
    return 1 + (this.floor - 1) * 0.08;
  }

  getSoulMultiplier() {
    return 1 + (this.floor - 1) * 0.18;
  }

  getCurrentRoom() {
    return this.currentRoom;
  }

  getFloor() {
    return this.floor;
  }

  getCombatTargets() {
    return [...this.enemies, ...this.bosses].filter((enemy) => !enemy.dead);
  }

  serialize() {
    return {
      floor: this.floor,

      floorCompleted: this.floorCompleted,

      rooms: this.rooms.map((room) => room.serialize()),
    };
  }
}
