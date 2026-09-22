import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import Enemy from "./Enemy.js";

export default class Mimic extends Enemy {
  constructor(scene, player, options = {}) {
    super(scene, player, {
      name: options.name || "Mimic",

      health: options.health || 220,

      damage: options.damage || 28,

      speed: options.speed || 2.2,

      attackRange: options.attackRange || 1.8,

      detectionRange: options.detectionRange || 7,

      attackCooldown: options.attackCooldown || 1.2,

      soulsReward: options.soulsReward || 260,

      x: options.x || 0,

      z: options.z || 0,
    });

    this.awake = false;
    this.fakeChest = true;

    this.wakeRange = options.wakeRange || 2.2;

    this.wakeTimer = 0;
    this.wakeDuration = 0.7;

    this.originalScale = this.group.scale.clone();

    this.transformToChest();
  }

  transformToChest() {
    this.group.clear();

    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x4b2d19,
      roughness: 0.72,
      metalness: 0.05,
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x28231d,
      roughness: 0.4,
      metalness: 0.72,
    });

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.8, 1.05),
      woodMaterial,
    );

    base.position.y = 0.45;

    base.castShadow = true;
    base.receiveShadow = true;

    this.group.add(base);

    this.lidPivot = new THREE.Group();

    this.lidPivot.position.set(0, 0.82, 0.52);

    this.group.add(this.lidPivot);

    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.45, 1.05),
      woodMaterial,
    );

    lid.position.set(0, 0.18, -0.52);

    lid.castShadow = true;

    this.lidPivot.add(lid);

    const leftBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.85, 1.1),
      metalMaterial,
    );

    leftBand.position.set(-0.48, 0.45, 0);

    this.group.add(leftBand);

    const rightBand = leftBand.clone();

    rightBand.position.x = 0.48;

    this.group.add(rightBand);

    this.lock = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.32, 0.15),
      metalMaterial,
    );

    this.lock.position.set(0, 0.63, -0.56);

    this.group.add(this.lock);
  }

  createMimicBody() {
    this.group.clear();

    const fleshMaterial = new THREE.MeshStandardMaterial({
      color: 0x3c1816,
      roughness: 0.72,
      metalness: 0.02,
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x181010,
      roughness: 0.65,
      metalness: 0.2,
    });

    const toothMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4c7a8,
      roughness: 0.6,
    });

    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff321c,
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.25, 1.1),
      fleshMaterial,
    );

    body.position.y = 0.95;

    body.castShadow = true;

    this.group.add(body);

    const upperJaw = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.42, 1.15),
      darkMaterial,
    );

    upperJaw.position.set(0, 1.75, -0.05);

    upperJaw.rotation.x = -0.25;

    upperJaw.castShadow = true;

    this.group.add(upperJaw);

    for (let i = 0; i < 6; i++) {
      const tooth = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.32, 6),
        toothMaterial,
      );

      tooth.position.set(-0.5 + i * 0.2, 1.48, -0.57);

      tooth.rotation.x = Math.PI;

      this.group.add(tooth);
    }

    const eyeLeft = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      eyeMaterial,
    );

    eyeLeft.position.set(-0.25, 1.9, -0.57);

    this.group.add(eyeLeft);

    const eyeRight = eyeLeft.clone();

    eyeRight.position.x = 0.25;

    this.group.add(eyeRight);

    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x251414,
      roughness: 0.8,
    });

    const legPositions = [
      [-0.5, 0.25, -0.32],
      [0.5, 0.25, -0.32],
      [-0.5, 0.25, 0.32],
      [0.5, 0.25, 0.32],
    ];

    for (const [x, y, z] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.13, 0.55, 7),
        legMaterial,
      );

      leg.position.set(x, y, z);

      leg.rotation.z = x < 0 ? -0.35 : 0.35;

      leg.castShadow = true;

      this.group.add(leg);
    }
  }

  update(delta) {
    if (this.dead) {
      return;
    }

    if (!this.awake) {
      const distance = this.group.position.distanceTo(
        this.player.group.position,
      );

      if (distance <= this.wakeRange) {
        this.wakeUp();
      }

      return;
    }

    super.update(delta);
  }

  wakeUp() {
    if (this.awake) {
      return;
    }

    this.awake = true;
    this.fakeChest = false;

    this.createMimicBody();

    this.group.scale.set(0.85, 1.2, 0.85);

    const startTime = performance.now();

    const duration = 420;

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);

      const bounce = 1 + Math.sin(progress * Math.PI) * 0.25;

      this.group.scale.set(
        THREE.MathUtils.lerp(0.85, 1, progress),
        bounce,
        THREE.MathUtils.lerp(0.85, 1, progress),
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.group.scale.copy(this.originalScale);
      }
    };

    requestAnimationFrame(animate);

    window.dispatchEvent(
      new CustomEvent("mimic:awakened", {
        detail: {
          mimic: this,
        },
      }),
    );
  }

  attack() {
    this.attackTimer = this.attackCooldown;

    const originalZ = this.group.position.z;

    const direction = new THREE.Vector3()
      .subVectors(this.player.group.position, this.group.position)
      .setY(0);

    if (direction.lengthSq() > 0) {
      direction.normalize();
    }

    const start = performance.now();

    const duration = 360;

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);

      const lunge = Math.sin(progress * Math.PI);

      this.group.position.x += direction.x * lunge * 0.08;

      this.group.position.z += direction.z * lunge * 0.08;

      if (progress >= 0.45 && progress <= 0.65) {
        const distance = this.group.position.distanceTo(
          this.player.group.position,
        );

        if (distance <= this.attackRange + 0.5) {
          this.player.takeDamage(this.damage);
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    this.group.position.z = originalZ;
  }

  takeDamage(amount) {
    if (!this.awake) {
      this.wakeUp();
    }

    super.takeDamage(amount);
  }

  die() {
    if (this.dead) {
      return;
    }

    super.die();

    window.dispatchEvent(
      new CustomEvent("mimic:defeated", {
        detail: {
          mimic: this,
          position: this.group.position.clone(),
        },
      }),
    );
  }
}
