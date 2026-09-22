import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Loot {
  constructor(scene, player, options = {}) {
    this.scene = scene;
    this.player = player;

    this.name = options.name || "Unknown Item";
    this.type = options.type || "souls";
    this.rarity = options.rarity || "common";

    this.amount = options.amount || 0;
    this.damage = options.damage || 0;
    this.defense = options.defense || 0;

    this.pickupRange = options.pickupRange || 1.5;
    this.autoPickup = options.autoPickup ?? true;

    this.pickedUp = false;

    this.group = new THREE.Group();

    this.baseY = options.y || 0.7;
    this.floatOffset = Math.random() * Math.PI * 2;

    this.group.position.set(options.x || 0, this.baseY, options.z || 0);

    this.createModel();

    this.scene.add(this.group);
  }

  createModel() {
    const color = this.getRarityColor();

    const outerMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.18,
    });

    const coreMaterial = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 2,
      roughness: 0.25,
      metalness: 0.25,
    });

    const outer = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      outerMaterial,
    );

    this.group.add(outer);

    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22),
      coreMaterial,
    );

    core.castShadow = true;

    this.group.add(core);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.025, 8, 32),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7,
      }),
    );

    ring.rotation.x = Math.PI / 2;

    this.group.add(ring);

    const light = new THREE.PointLight(color, 2.2, 4);

    light.position.y = 0.3;

    this.group.add(light);

    this.core = core;
    this.ring = ring;
  }

  update(time) {
    if (this.pickedUp) {
      return;
    }

    this.group.position.y =
      this.baseY + Math.sin(time * 2.4 + this.floatOffset) * 0.12;

    this.group.rotation.y += 0.012;

    this.ring.rotation.z += 0.02;

    if (this.autoPickup) {
      this.checkPickup();
    }
  }

  checkPickup() {
    const distance = this.player.group.position.distanceTo(this.group.position);

    if (distance <= this.pickupRange) {
      this.pickup();
    }
  }

  pickup() {
    if (this.pickedUp) {
      return;
    }

    this.pickedUp = true;

    this.applyLoot();
    this.animatePickup();
  }

  applyLoot() {
    if (this.type === "souls") {
      this.player.addSouls(this.amount);
    }

    if (this.type === "heal") {
      this.player.heal(this.amount);
    }

    if (this.type === "weapon") {
      window.dispatchEvent(
        new CustomEvent("loot:weapon", {
          detail: {
            name: this.name,
            rarity: this.rarity,
            damage: this.damage,
          },
        }),
      );
    }

    if (this.type === "armor") {
      window.dispatchEvent(
        new CustomEvent("loot:armor", {
          detail: {
            name: this.name,
            rarity: this.rarity,
            defense: this.defense,
          },
        }),
      );
    }

    window.dispatchEvent(
      new CustomEvent("loot:picked", {
        detail: {
          name: this.name,
          type: this.type,
          rarity: this.rarity,
          amount: this.amount,
          damage: this.damage,
          defense: this.defense,
        },
      }),
    );
  }

  animatePickup() {
    const startTime = performance.now();

    const startPosition = this.group.position.clone();

    const duration = 450;

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      this.group.position.y = startPosition.y + eased * 1.8;

      this.group.scale.setScalar(1 - eased);

      this.group.rotation.y += 0.18;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(this.group);
      }
    };

    requestAnimationFrame(animate);
  }

  getRarityColor() {
    if (this.rarity === "uncommon") {
      return 0x4fd46d;
    }

    if (this.rarity === "rare") {
      return 0x4b8cff;
    }

    if (this.rarity === "epic") {
      return 0xa548ff;
    }

    if (this.rarity === "legendary") {
      return 0xff9f1c;
    }

    if (this.rarity === "boss") {
      return 0xff3434;
    }

    return 0xd9d9d9;
  }

  getPosition() {
    return this.group.position;
  }
}
