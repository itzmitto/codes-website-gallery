import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Trap {
  constructor(scene, player, options = {}) {
    this.scene = scene;
    this.player = player;

    this.type = options.type || "spikes";

    this.position = new THREE.Vector3(options.x || 0, 0, options.z || 0);

    this.damage = options.damage || 22;

    this.radius = options.radius || 1.5;

    this.cooldown = options.cooldown || 1.5;

    this.timer = 0;
    this.active = true;

    this.group = new THREE.Group();

    this.group.position.copy(this.position);

    this.scene.add(this.group);

    this.createModel();
  }

  createModel() {
    if (this.type === "spikes") {
      this.createSpikes();
    }

    if (this.type === "fire") {
      this.createFireTrap();
    }

    if (this.type === "poison") {
      this.createPoisonTrap();
    }
  }

  createSpikes() {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.18, 16),
      new THREE.MeshStandardMaterial({
        color: 0x2b2925,
        roughness: 0.9,
      }),
    );

    base.position.y = 0.09;

    base.receiveShadow = true;

    this.group.add(base);

    this.spikes = [];

    const positions = [
      [-0.6, -0.6],
      [0, -0.6],
      [0.6, -0.6],
      [-0.6, 0],
      [0, 0],
      [0.6, 0],
      [-0.6, 0.6],
      [0, 0.6],
      [0.6, 0.6],
    ];

    for (const [x, z] of positions) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 1.1, 8),
        new THREE.MeshStandardMaterial({
          color: 0x737478,
          roughness: 0.3,
          metalness: 0.85,
        }),
      );

      spike.position.set(x, -0.42, z);

      spike.castShadow = true;

      this.group.add(spike);

      this.spikes.push(spike);
    }
  }

  createFireTrap() {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.2, 2.4),
      new THREE.MeshStandardMaterial({
        color: 0x2a211a,
        roughness: 0.8,
      }),
    );

    base.position.y = 0.1;

    this.group.add(base);

    this.fireCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0xff5a1f,
      }),
    );

    this.fireCore.position.y = 0.6;

    this.group.add(this.fireCore);

    this.fireLight = new THREE.PointLight(0xff4b18, 4, 6);

    this.fireLight.position.y = 1;

    this.group.add(this.fireLight);
  }

  createPoisonTrap() {
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.15, 18),
      new THREE.MeshStandardMaterial({
        color: 0x17271b,
        roughness: 0.9,
      }),
    );

    plate.position.y = 0.08;

    this.group.add(plate);

    this.poisonGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 14, 14),
      new THREE.MeshBasicMaterial({
        color: 0x3bff62,
        transparent: true,
        opacity: 0.18,
      }),
    );

    this.poisonGlow.position.y = 0.45;

    this.group.add(this.poisonGlow);

    this.poisonLight = new THREE.PointLight(0x42ff68, 2.2, 5);

    this.poisonLight.position.y = 0.8;

    this.group.add(this.poisonLight);
  }

  update(delta, time) {
    if (!this.active) {
      return;
    }

    if (this.timer > 0) {
      this.timer -= delta;
    }

    if (this.type === "spikes") {
      this.updateSpikes(time);
    }

    if (this.type === "fire") {
      this.updateFire(time);
    }

    if (this.type === "poison") {
      this.updatePoison(time);
    }

    this.checkPlayer();
  }

  checkPlayer() {
    if (this.timer > 0) {
      return;
    }

    const distance = this.player.group.position.distanceTo(this.group.position);

    if (distance > this.radius) {
      return;
    }

    this.trigger();
  }

  trigger() {
    this.timer = this.cooldown;

    if (this.type === "spikes") {
      this.triggerSpikes();
    }

    if (this.type === "fire") {
      this.triggerFire();
    }

    if (this.type === "poison") {
      this.triggerPoison();
    }

    window.dispatchEvent(
      new CustomEvent("trap:triggered", {
        detail: {
          type: this.type,
          trap: this,
        },
      }),
    );
  }

  triggerSpikes() {
    this.player.takeDamage(this.damage);

    for (const spike of this.spikes) {
      spike.position.y = 0.48;
    }

    setTimeout(() => {
      for (const spike of this.spikes) {
        spike.position.y = -0.42;
      }
    }, 280);
  }

  triggerFire() {
    this.player.takeDamage(this.damage);

    window.dispatchEvent(
      new CustomEvent("status:fire-hit", {
        detail: {
          amount: 20,
        },
      }),
    );

    this.fireCore.scale.set(1.8, 2.4, 1.8);

    setTimeout(() => {
      this.fireCore.scale.set(1, 1, 1);
    }, 220);
  }

  triggerPoison() {
    window.dispatchEvent(
      new CustomEvent("status:poison-hit", {
        detail: {
          amount: 38,
        },
      }),
    );

    this.poisonGlow.scale.set(1.5, 1.5, 1.5);

    setTimeout(() => {
      this.poisonGlow.scale.set(1, 1, 1);
    }, 300);
  }

  updateSpikes(time) {
    const pulse = 0.96 + Math.sin(time * 3) * 0.02;

    this.group.scale.set(pulse, 1, pulse);
  }

  updateFire(time) {
    this.fireCore.position.y = 0.6 + Math.sin(time * 5) * 0.08;

    this.fireCore.scale.y = 1.1 + Math.sin(time * 8) * 0.15;

    this.fireLight.intensity = 3.8 + Math.sin(time * 7) * 0.5;
  }

  updatePoison(time) {
    const pulse = 1 + Math.sin(time * 3) * 0.12;

    this.poisonGlow.scale.setScalar(pulse);

    this.poisonLight.intensity = 2 + Math.sin(time * 4) * 0.3;
  }

  setActive(value) {
    this.active = Boolean(value);

    this.group.visible = this.active;
  }

  getPosition() {
    return this.group.position;
  }
}
