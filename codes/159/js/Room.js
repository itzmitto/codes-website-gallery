import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Room {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.id = options.id || crypto.randomUUID();

    this.type = options.type || "combat";

    this.x = options.x || 0;

    this.z = options.z || 0;

    this.width = options.width || 12;

    this.depth = options.depth || 12;

    this.wallHeight = options.wallHeight || 5;

    this.wallThickness = options.wallThickness || 0.7;

    this.doorWidth = options.doorWidth || 3;

    this.active = false;
    this.cleared = false;
    this.locked = false;

    this.enemies = [];
    this.chests = [];

    this.group = new THREE.Group();

    this.group.position.set(this.x, 0, this.z);

    this.floorGroup = new THREE.Group();

    this.wallGroup = new THREE.Group();

    this.decorGroup = new THREE.Group();

    this.group.add(this.floorGroup);

    this.group.add(this.wallGroup);

    this.group.add(this.decorGroup);

    this.materials = this.createMaterials();

    this.createFloor();
    this.createWalls();
    this.createCorners();
    this.createDecoration();

    this.scene.add(this.group);
  }

  createMaterials() {
    return {
      floor: new THREE.MeshStandardMaterial({
        color: 0x26231f,
        roughness: 0.95,
        metalness: 0.03,
      }),

      tile: new THREE.MeshStandardMaterial({
        color: 0x302c27,
        roughness: 1,
      }),

      wall: new THREE.MeshStandardMaterial({
        color: 0x191715,
        roughness: 0.92,
      }),

      pillar: new THREE.MeshStandardMaterial({
        color: 0x29251f,
        roughness: 0.86,
      }),

      metal: new THREE.MeshStandardMaterial({
        color: 0x3a332a,
        roughness: 0.45,
        metalness: 0.65,
      }),
    };
  }

  createFloor() {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(this.width, 0.25, this.depth),
      this.materials.floor,
    );

    base.position.y = -0.125;

    base.receiveShadow = true;

    this.floorGroup.add(base);

    const tileSize = 2;

    const columns = Math.floor(this.width / tileSize);

    const rows = Math.floor(this.depth / tileSize);

    for (let x = 0; x < columns; x++) {
      for (let z = 0; z < rows; z++) {
        const tile = new THREE.Mesh(
          new THREE.BoxGeometry(tileSize - 0.08, 0.08, tileSize - 0.08),
          this.materials.tile,
        );

        tile.position.set(
          -this.width / 2 + tileSize / 2 + x * tileSize,
          0.04 + Math.random() * 0.02,
          -this.depth / 2 + tileSize / 2 + z * tileSize,
        );

        tile.rotation.y = (Math.random() - 0.5) * 0.025;

        tile.receiveShadow = true;

        this.floorGroup.add(tile);
      }
    }
  }

  createWalls() {
    const halfWidth = this.width / 2;

    const halfDepth = this.depth / 2;

    const sideWidth = (this.width - this.doorWidth) / 2;

    const sideDepth = (this.depth - this.doorWidth) / 2;

    this.createWall(
      -halfWidth / 2 - this.doorWidth / 4,
      this.wallHeight / 2,
      -halfDepth,
      sideWidth,
      this.wallHeight,
      this.wallThickness,
    );

    this.createWall(
      halfWidth / 2 + this.doorWidth / 4,
      this.wallHeight / 2,
      -halfDepth,
      sideWidth,
      this.wallHeight,
      this.wallThickness,
    );

    this.createWall(
      -halfWidth / 2 - this.doorWidth / 4,
      this.wallHeight / 2,
      halfDepth,
      sideWidth,
      this.wallHeight,
      this.wallThickness,
    );

    this.createWall(
      halfWidth / 2 + this.doorWidth / 4,
      this.wallHeight / 2,
      halfDepth,
      sideWidth,
      this.wallHeight,
      this.wallThickness,
    );

    this.createWall(
      -halfWidth,
      this.wallHeight / 2,
      -halfDepth / 2 - this.doorWidth / 4,
      this.wallThickness,
      this.wallHeight,
      sideDepth,
    );

    this.createWall(
      -halfWidth,
      this.wallHeight / 2,
      halfDepth / 2 + this.doorWidth / 4,
      this.wallThickness,
      this.wallHeight,
      sideDepth,
    );

    this.createWall(
      halfWidth,
      this.wallHeight / 2,
      -halfDepth / 2 - this.doorWidth / 4,
      this.wallThickness,
      this.wallHeight,
      sideDepth,
    );

    this.createWall(
      halfWidth,
      this.wallHeight / 2,
      halfDepth / 2 + this.doorWidth / 4,
      this.wallThickness,
      this.wallHeight,
      sideDepth,
    );
  }

  createWall(x, y, z, width, height, depth) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      this.materials.wall,
    );

    wall.position.set(x, y, z);

    wall.castShadow = true;
    wall.receiveShadow = true;

    this.wallGroup.add(wall);

    return wall;
  }

  createCorners() {
    const inset = 0.75;

    const positions = [
      [-this.width / 2 + inset, -this.depth / 2 + inset],
      [this.width / 2 - inset, -this.depth / 2 + inset],
      [-this.width / 2 + inset, this.depth / 2 - inset],
      [this.width / 2 - inset, this.depth / 2 - inset],
    ];

    for (const [x, z] of positions) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(1, this.wallHeight, 1),
        this.materials.pillar,
      );

      pillar.position.set(x, this.wallHeight / 2, z);

      pillar.castShadow = true;
      pillar.receiveShadow = true;

      this.wallGroup.add(pillar);

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 0.35, 1.35),
        this.materials.pillar,
      );

      base.position.set(x, 0.17, z);

      base.castShadow = true;
      base.receiveShadow = true;

      this.wallGroup.add(base);
    }
  }

  createDecoration() {
    if (this.type === "combat") {
      this.createCombatDecoration();
    }

    if (this.type === "treasure") {
      this.createTreasureDecoration();
    }

    if (this.type === "boss") {
      this.createBossDecoration();
    }

    if (this.type === "shrine") {
      this.createShrineDecoration();
    }
  }

  createCombatDecoration() {
    const positions = [
      [-2.5, -2],
      [2.5, 2],
    ];

    for (const [x, z] of positions) {
      const debris = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.25, 1.5),
        this.materials.wall,
      );

      debris.position.set(x, 0.13, z);

      debris.rotation.y = Math.random() * Math.PI;

      debris.castShadow = true;

      this.decorGroup.add(debris);
    }
  }

  createTreasureDecoration() {
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.5, 0.35, 8),
      this.materials.pillar,
    );

    platform.position.y = 0.18;

    platform.receiveShadow = true;

    this.decorGroup.add(platform);
  }

  createBossDecoration() {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.8, 4, 64),
      new THREE.MeshBasicMaterial({
        color: 0x5d1712,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      }),
    );

    ring.rotation.x = -Math.PI / 2;

    ring.position.y = 0.07;

    this.decorGroup.add(ring);
  }

  createShrineDecoration() {
    const circle = new THREE.Mesh(
      new THREE.RingGeometry(2, 2.1, 48),
      new THREE.MeshBasicMaterial({
        color: 0x8a5b2e,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      }),
    );

    circle.rotation.x = -Math.PI / 2;

    circle.position.y = 0.06;

    this.decorGroup.add(circle);
  }

  addEnemy(enemy) {
    if (!this.enemies.includes(enemy)) {
      this.enemies.push(enemy);
    }
  }

  addChest(chest) {
    if (!this.chests.includes(chest)) {
      this.chests.push(chest);
    }
  }

  update() {
    if (this.cleared) {
      return;
    }

    if (this.type !== "combat" && this.type !== "boss") {
      return;
    }

    if (this.enemies.length === 0) {
      return;
    }

    const alive = this.enemies.filter((enemy) => !enemy.dead);

    if (alive.length === 0) {
      this.clear();
    }
  }

  clear() {
    if (this.cleared) {
      return;
    }

    this.cleared = true;
    this.locked = false;

    window.dispatchEvent(
      new CustomEvent("room:cleared", {
        detail: {
          id: this.id,
          type: this.type,
          room: this,
        },
      }),
    );
  }

  lock() {
    this.locked = true;

    window.dispatchEvent(
      new CustomEvent("room:locked", {
        detail: {
          id: this.id,
          room: this,
        },
      }),
    );
  }

  unlock() {
    this.locked = false;

    window.dispatchEvent(
      new CustomEvent("room:unlocked", {
        detail: {
          id: this.id,
          room: this,
        },
      }),
    );
  }

  containsPosition(position, padding = 0) {
    const localX = position.x - this.x;

    const localZ = position.z - this.z;

    return (
      localX >= -this.width / 2 + padding &&
      localX <= this.width / 2 - padding &&
      localZ >= -this.depth / 2 + padding &&
      localZ <= this.depth / 2 - padding
    );
  }

  getRandomPosition(padding = 2) {
    const x =
      this.x +
      THREE.MathUtils.randFloat(
        -this.width / 2 + padding,
        this.width / 2 - padding,
      );

    const z =
      this.z +
      THREE.MathUtils.randFloat(
        -this.depth / 2 + padding,
        this.depth / 2 - padding,
      );

    return new THREE.Vector3(x, 0, z);
  }

  getCenter() {
    return new THREE.Vector3(this.x, 0, this.z);
  }

  getBounds() {
    return {
      minX: this.x - this.width / 2,

      maxX: this.x + this.width / 2,

      minZ: this.z - this.depth / 2,

      maxZ: this.z + this.depth / 2,
    };
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      cleared: this.cleared,
      locked: this.locked,
    };
  }

  load(data) {
    if (!data) {
      return;
    }

    if (typeof data.cleared === "boolean") {
      this.cleared = data.cleared;
    }

    if (typeof data.locked === "boolean") {
      this.locked = data.locked;
    }
  }
}
