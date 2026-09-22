import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Chest {
  constructor(scene, player, options = {}) {
    this.scene = scene;
    this.player = player;

    this.type = options.type || "wood";
    this.x = options.x || 0;
    this.z = options.z || 0;

    this.openRange = options.openRange || 2.2;
    this.opened = false;

    this.loot = options.loot || [
      {
        type: "souls",
        amount: 100,
      },
    ];

    this.group = new THREE.Group();
    this.lidPivot = new THREE.Group();

    this.interactionMessage = document.getElementById("interaction-message");

    this.interactionText = document.getElementById("interaction-text");

    this.createModel();

    this.group.position.set(this.x, 0, this.z);

    this.scene.add(this.group);

    this.setupControls();
  }

  createModel() {
    const colors = {
      wood: {
        base: 0x4e2f1c,
        trim: 0x2a1a10,
        glow: null,
      },

      silver: {
        base: 0x6f747c,
        trim: 0x30343a,
        glow: 0xaabfff,
      },

      gold: {
        base: 0x8f6720,
        trim: 0x3b2a0c,
        glow: 0xffc94d,
      },

      cursed: {
        base: 0x281c32,
        trim: 0x120b18,
        glow: 0xa93cff,
      },
    };

    const style = colors[this.type] || colors.wood;

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: style.base,
      roughness: 0.6,
      metalness: this.type === "wood" ? 0.05 : 0.55,
    });

    const trimMaterial = new THREE.MeshStandardMaterial({
      color: style.trim,
      roughness: 0.45,
      metalness: 0.65,
    });

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.75, 1),
      baseMaterial,
    );

    base.position.y = 0.45;
    base.castShadow = true;
    base.receiveShadow = true;

    this.group.add(base);

    this.lidPivot.position.set(0, 0.78, 0.5);

    this.group.add(this.lidPivot);

    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.42, 1),
      baseMaterial,
    );

    lid.position.set(0, 0.16, -0.5);

    lid.castShadow = true;

    this.lidPivot.add(lid);

    const band1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.8, 1.05),
      trimMaterial,
    );

    band1.position.set(-0.48, 0.45, 0);

    this.group.add(band1);

    const band2 = band1.clone();

    band2.position.x = 0.48;

    this.group.add(band2);

    const lock = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.3, 0.14),
      trimMaterial,
    );

    lock.position.set(0, 0.62, -0.55);

    lock.castShadow = true;

    this.group.add(lock);

    if (style.glow) {
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: style.glow,
        transparent: true,
        opacity: 0.35,
      });

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 16, 16),
        glowMaterial,
      );

      glow.position.y = 0.7;
      glow.scale.set(1.5, 0.7, 1);

      this.group.add(glow);

      const light = new THREE.PointLight(style.glow, 2.5, 5);

      light.position.set(0, 1.2, 0);

      this.group.add(light);
    }
  }

  setupControls() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyF" && !event.repeat) {
        this.tryOpen();
      }
    });
  }

  update() {
    if (this.opened) {
      return;
    }

    const distance = this.player.group.position.distanceTo(this.group.position);

    if (distance <= this.openRange) {
      this.showInteraction();
    } else {
      this.hideInteraction();
    }
  }

  showInteraction() {
    if (!this.interactionMessage || !this.interactionText) {
      return;
    }

    this.interactionText.textContent = `Open ${this.getDisplayName()}`;

    this.interactionMessage.style.display = "flex";
  }

  hideInteraction() {
    if (!this.interactionMessage) {
      return;
    }

    this.interactionMessage.style.display = "none";
  }

  tryOpen() {
    if (this.opened) {
      return;
    }

    const distance = this.player.group.position.distanceTo(this.group.position);

    if (distance > this.openRange) {
      return;
    }

    this.open();
  }

  open() {
    if (this.opened) {
      return;
    }

    this.opened = true;

    this.hideInteraction();

    this.animateOpen();

    setTimeout(() => {
      this.giveLoot();
    }, 500);
  }

  animateOpen() {
    const duration = 650;
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      this.lidPivot.rotation.x = -eased * Math.PI * 0.62;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  giveLoot() {
    for (const item of this.loot) {
      if (item.type === "souls") {
        this.player.addSouls(item.amount);
      }

      if (item.type === "heal") {
        this.player.heal(item.amount);
      }
    }

    this.spawnLootEffect();
  }

  spawnLootEffect() {
    const particles = [];

    for (let i = 0; i < 16; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 6, 6),
        new THREE.MeshBasicMaterial({
          color: this.getGlowColor(),
        }),
      );

      particle.position.copy(this.group.position);

      particle.position.y = 1.1;

      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2.5,
        1.5 + Math.random() * 2,
        (Math.random() - 0.5) * 2.5,
      );

      this.scene.add(particle);

      particles.push(particle);
    }

    const startTime = performance.now();

    const animate = (time) => {
      const delta = (time - startTime) / 1000;

      for (const particle of particles) {
        particle.position.x += particle.userData.velocity.x * 0.016;

        particle.position.y += particle.userData.velocity.y * 0.016;

        particle.position.z += particle.userData.velocity.z * 0.016;

        particle.userData.velocity.y -= 3.5 * 0.016;

        particle.scale.setScalar(Math.max(0, 1 - delta * 0.8));
      }

      if (delta < 1.2) {
        requestAnimationFrame(animate);
      } else {
        for (const particle of particles) {
          this.scene.remove(particle);
        }
      }
    };

    requestAnimationFrame(animate);
  }

  getDisplayName() {
    if (this.type === "silver") {
      return "Silver Chest";
    }

    if (this.type === "gold") {
      return "Golden Chest";
    }

    if (this.type === "cursed") {
      return "Cursed Chest";
    }

    return "Chest";
  }

  getGlowColor() {
    if (this.type === "silver") {
      return 0xaabfff;
    }

    if (this.type === "gold") {
      return 0xffc94d;
    }

    if (this.type === "cursed") {
      return 0xb23cff;
    }

    return 0xffa34f;
  }

  getPosition() {
    return this.group.position;
  }
}
