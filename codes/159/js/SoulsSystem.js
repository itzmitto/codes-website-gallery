import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class SoulsSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.droppedSouls = null;
    this.recoveryRange = 1.7;
    this.hasRecoverableSouls = false;
    this.droppedAmount = 0;
  }

  dropSouls(position) {
    if (this.player.souls <= 0) {
      return;
    }

    if (this.droppedSouls) {
      this.scene.remove(this.droppedSouls);

      this.droppedSouls = null;
    }

    this.droppedAmount = this.player.souls;

    this.player.souls = 0;
    this.player.updateUI();

    this.createSoulDrop(position);

    this.hasRecoverableSouls = true;
  }

  createSoulDrop(position) {
    const group = new THREE.Group();

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.32, 1),
      new THREE.MeshStandardMaterial({
        color: 0xd8b85c,
        emissive: 0x9b6d1b,
        emissiveIntensity: 2.5,
        roughness: 0.2,
        metalness: 0.15,
      }),
    );

    group.add(core);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.035, 8, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffd96a,
        transparent: true,
        opacity: 0.8,
      }),
    );

    ring.rotation.x = Math.PI / 2;

    group.add(ring);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffc84d,
        transparent: true,
        opacity: 0.12,
      }),
    );

    group.add(glow);

    const light = new THREE.PointLight(0xffc04a, 3.5, 6);

    light.position.y = 0.4;

    group.add(light);

    group.position.copy(position);

    group.position.y = 0.75;

    group.userData.core = core;
    group.userData.ring = ring;
    group.userData.glow = glow;
    group.userData.baseY = group.position.y;
    group.userData.offset = Math.random() * Math.PI * 2;

    this.droppedSouls = group;

    this.scene.add(group);
  }

  update(time) {
    if (!this.droppedSouls || !this.hasRecoverableSouls) {
      return;
    }

    const group = this.droppedSouls;

    group.position.y =
      group.userData.baseY +
      Math.sin(time * 2.5 + group.userData.offset) * 0.12;

    group.rotation.y += 0.012;

    group.userData.ring.rotation.z += 0.025;

    const pulse = 1 + Math.sin(time * 4) * 0.08;

    group.userData.glow.scale.setScalar(pulse);

    const distance = this.player.group.position.distanceTo(group.position);

    if (distance <= this.recoveryRange) {
      this.recoverSouls();
    }
  }

  recoverSouls() {
    if (!this.hasRecoverableSouls || !this.droppedSouls) {
      return;
    }

    const amount = this.droppedAmount;

    this.player.addSouls(amount);

    this.hasRecoverableSouls = false;
    this.droppedAmount = 0;

    this.animateRecovery();
  }

  animateRecovery() {
    const group = this.droppedSouls;

    if (!group) {
      return;
    }

    const startTime = performance.now();

    const startPosition = group.position.clone();

    const duration = 500;

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      const target = this.player.group.position.clone();

      target.y += 1.2;

      group.position.lerpVectors(startPosition, target, eased);

      group.scale.setScalar(1 - eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(group);

        this.droppedSouls = null;

        window.dispatchEvent(
          new CustomEvent("souls:recovered", {
            detail: {
              amount: this.player.souls,
            },
          }),
        );
      }
    };

    requestAnimationFrame(animate);
  }

  loseDroppedSouls() {
    if (this.droppedSouls) {
      this.scene.remove(this.droppedSouls);
    }

    this.droppedSouls = null;
    this.droppedAmount = 0;
    this.hasRecoverableSouls = false;

    window.dispatchEvent(new CustomEvent("souls:lost"));
  }

  handleDeath() {
    if (this.hasRecoverableSouls) {
      this.loseDroppedSouls();
    }

    const position = this.player.group.position.clone();

    this.dropSouls(position);
  }

  serialize() {
    if (!this.hasRecoverableSouls || !this.droppedSouls) {
      return {
        recoverable: false,
        amount: 0,
        position: null,
      };
    }

    return {
      recoverable: true,
      amount: this.droppedAmount,
      position: {
        x: this.droppedSouls.position.x,
        y: this.droppedSouls.position.y,
        z: this.droppedSouls.position.z,
      },
    };
  }

  load(data) {
    if (!data || !data.recoverable || !data.position || !data.amount) {
      return;
    }

    this.droppedAmount = data.amount;

    this.hasRecoverableSouls = true;

    this.createSoulDrop(
      new THREE.Vector3(data.position.x, data.position.y, data.position.z),
    );
  }
}
