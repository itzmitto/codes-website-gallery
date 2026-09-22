import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Enemy {
  constructor(scene, player, options = {}) {
    this.scene = scene;
    this.player = player;

    this.name = options.name || "Hollow";
    this.health = options.health || 60;
    this.maxHealth = this.health;
    this.damage = options.damage || 12;
    this.speed = options.speed || 2.1;
    this.attackRange = options.attackRange || 1.6;
    this.detectionRange = options.detectionRange || 8;
    this.attackCooldown = options.attackCooldown || 1.25;
    this.soulsReward = options.soulsReward || 25;

    this.dead = false;
    this.attackTimer = 0;
    this.hitTimer = 0;

    this.group = new THREE.Group();

    this.direction = new THREE.Vector3();
    this.tempDirection = new THREE.Vector3();

    this.createModel();

    this.group.position.set(options.x || 0, 0, options.z || 0);

    this.scene.add(this.group);
  }

  createModel() {
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x302d35,
      roughness: 0.8,
      metalness: 0.15,
    });

    const armorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1f24,
      roughness: 0.55,
      metalness: 0.55,
    });

    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3b22,
    });

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 1.2, 12),
      bodyMaterial,
    );

    body.position.y = 0.95;
    body.castShadow = true;

    this.group.add(body);

    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.6, 0.5),
      armorMaterial,
    );

    chest.position.y = 1.25;
    chest.castShadow = true;

    this.group.add(chest);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 14, 14),
      armorMaterial,
    );

    head.position.y = 1.9;
    head.castShadow = true;

    this.group.add(head);

    const leftEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      eyeMaterial,
    );

    leftEye.position.set(-0.1, 1.93, -0.29);

    this.group.add(leftEye);

    const rightEye = leftEye.clone();

    rightEye.position.x = 0.1;

    this.group.add(rightEye);

    const leftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.17, 0.75, 8),
      armorMaterial,
    );

    leftLeg.position.set(-0.2, 0.38, 0);

    leftLeg.castShadow = true;

    this.group.add(leftLeg);

    const rightLeg = leftLeg.clone();

    rightLeg.position.x = 0.2;

    this.group.add(rightLeg);

    this.weaponPivot = new THREE.Group();

    this.weaponPivot.position.set(0.55, 1.15, 0);

    this.group.add(this.weaponPivot);

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.09, 1.45),
      new THREE.MeshStandardMaterial({
        color: 0x81848c,
        roughness: 0.3,
        metalness: 0.85,
      }),
    );

    blade.position.z = -0.6;
    blade.castShadow = true;

    this.weaponPivot.add(blade);
  }

  update(delta) {
    if (this.dead) {
      return;
    }

    if (this.attackTimer > 0) {
      this.attackTimer -= delta;
    }

    if (this.hitTimer > 0) {
      this.hitTimer -= delta;
    }

    const distance = this.group.position.distanceTo(this.player.group.position);

    if (distance > this.detectionRange) {
      return;
    }

    this.direction
      .subVectors(this.player.group.position, this.group.position)
      .setY(0);

    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
    }

    const targetRotation = Math.atan2(this.direction.x, this.direction.z);

    this.group.rotation.y = THREE.MathUtils.lerp(
      this.group.rotation.y,
      targetRotation,
      0.12,
    );

    if (distance > this.attackRange) {
      this.group.position.x += this.direction.x * this.speed * delta;

      this.group.position.z += this.direction.z * this.speed * delta;

      return;
    }

    if (this.attackTimer <= 0) {
      this.attack();
    }
  }

  attack() {
    this.attackTimer = this.attackCooldown;

    this.weaponPivot.rotation.y = -1.2;

    setTimeout(() => {
      if (this.dead) {
        return;
      }

      const distance = this.group.position.distanceTo(
        this.player.group.position,
      );

      if (distance <= this.attackRange + 0.3) {
        this.player.takeDamage(this.damage);
      }

      this.weaponPivot.rotation.y = 0;
    }, 220);
  }

  takeDamage(amount) {
    if (this.dead) {
      return;
    }

    this.health -= amount;

    this.hitTimer = 0.12;

    this.group.scale.set(1.08, 0.94, 1.08);

    setTimeout(() => {
      if (!this.dead) {
        this.group.scale.set(1, 1, 1);
      }
    }, 90);

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    if (this.dead) {
      return;
    }

    this.dead = true;

    this.player.addSouls(this.soulsReward);

    const startY = this.group.position.y;

    const startScale = this.group.scale.clone();

    const duration = 500;

    const startTime = performance.now();

    const animateDeath = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);

      this.group.position.y = startY - progress * 1.5;

      this.group.scale.set(
        startScale.x * (1 - progress),
        startScale.y * (1 - progress),
        startScale.z * (1 - progress),
      );

      if (progress < 1) {
        requestAnimationFrame(animateDeath);
      } else {
        this.scene.remove(this.group);
      }
    };

    requestAnimationFrame(animateDeath);
  }

  getPosition() {
    return this.group.position;
  }
}
