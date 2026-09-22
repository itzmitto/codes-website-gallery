export default class SaveSystem {
  constructor(player, levelSystem, dungeon, soulsSystem) {
    this.player = player;
    this.levelSystem = levelSystem;
    this.dungeon = dungeon;
    this.soulsSystem = soulsSystem;

    this.storageKey = "ashen-depths-save";
  }

  save() {
    const data = {
      version: 1,

      player: {
        health: this.player.health,

        maxHealth: this.player.maxHealth,

        stamina: this.player.stamina,

        maxStamina: this.player.maxStamina,

        souls: this.player.souls,

        level: this.player.level,

        position: {
          x: this.player.group.position.x,

          y: this.player.group.position.y,

          z: this.player.group.position.z,
        },
      },

      levelSystem: this.levelSystem.serialize(),

      dungeon: this.dungeon.serialize(),

      soulsSystem: this.soulsSystem.serialize(),

      timestamp: Date.now(),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(data));

    window.dispatchEvent(
      new CustomEvent("save:complete", {
        detail: {
          data,
        },
      }),
    );

    return data;
  }

  load() {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return false;
    }

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return false;
    }

    if (!data) {
      return false;
    }

    if (data.dungeon?.floor) {
      this.dungeon.generateFloor(data.dungeon.floor);
    }

    if (data.levelSystem) {
      this.levelSystem.load(data.levelSystem);
    }

    if (data.player) {
      this.loadPlayer(data.player);
    }

    if (data.soulsSystem) {
      this.soulsSystem.load(data.soulsSystem);
    }

    if (Array.isArray(data.dungeon?.rooms)) {
      this.loadRooms(data.dungeon.rooms);
    }

    if (typeof data.dungeon?.floorCompleted === "boolean") {
      this.dungeon.floorCompleted = data.dungeon.floorCompleted;
    }

    window.dispatchEvent(
      new CustomEvent("save:loaded", {
        detail: {
          data,
        },
      }),
    );

    return true;
  }

  loadPlayer(data) {
    if (typeof data.health === "number") {
      this.player.health = data.health;
    }

    if (typeof data.maxHealth === "number") {
      this.player.maxHealth = data.maxHealth;
    }

    if (typeof data.stamina === "number") {
      this.player.stamina = data.stamina;
    }

    if (typeof data.maxStamina === "number") {
      this.player.maxStamina = data.maxStamina;
    }

    if (typeof data.souls === "number") {
      this.player.souls = data.souls;
    }

    if (typeof data.level === "number") {
      this.player.setLevel(data.level);
    }

    if (
      data.position &&
      typeof data.position.x === "number" &&
      typeof data.position.y === "number" &&
      typeof data.position.z === "number"
    ) {
      this.player.group.position.set(
        data.position.x,
        data.position.y,
        data.position.z,
      );
    }

    this.player.health = Math.min(this.player.health, this.player.maxHealth);

    this.player.stamina = Math.min(this.player.stamina, this.player.maxStamina);

    this.player.updateUI();
  }

  loadRooms(savedRooms) {
    for (const savedRoom of savedRooms) {
      const room = this.dungeon.rooms.find(
        (currentRoom) => currentRoom.id === savedRoom.id,
      );

      if (!room) {
        continue;
      }

      room.load(savedRoom);
    }
  }

  hasSave() {
    return localStorage.getItem(this.storageKey) !== null;
  }

  deleteSave() {
    localStorage.removeItem(this.storageKey);

    window.dispatchEvent(new CustomEvent("save:deleted"));
  }

  getSaveData() {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getSaveDate() {
    const data = this.getSaveData();

    if (!data?.timestamp) {
      return null;
    }

    return new Date(data.timestamp);
  }

  getSaveSummary() {
    const data = this.getSaveData();

    if (!data) {
      return null;
    }

    return {
      floor: data.dungeon?.floor || 1,

      level: data.player?.level || 1,

      souls: data.player?.souls || 0,

      timestamp: data.timestamp || null,
    };
  }
}
