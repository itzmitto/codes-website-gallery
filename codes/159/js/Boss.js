import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Boss {
  constructor(scene, player, options = {}) {
    this.scene = scene;
    this.player = player;

    this.name = options.name || "Grave Warden";

    this.maxHealth = options.health || 800;
    this.health = this.maxHealth;

    this.damage = options.damage || 28;
    this.speed = options.speed || 1.25;

    this.attackRange = options.attackRange || 2.4;
    this.detectionRange = options.detectionRange || 18;

    this.soulsReward = options.soulsReward || 1800;

    this.dead = false;
    this.started = false;

    this.phase = 1;

    this.attackTimer = 0;
    this.attackCooldown = 1.8;

    this.specialTimer = 4;
    this.specialCooldown = 5;

    this.attackState = null;
    this.attackProgress = 0;

    this.group = new THREE.Group();

    this.direction = new THREE.Vector3();
    this.temp = new THREE.Vector3();

    this.bossUI = document.getElementById("boss-ui");
    this.bossName = document.getElementById("boss-name");
    this.bossHealthFill = document.getElementById("boss-health-fill");

    this.createModel();

    this.group.position.set(options.x || 0, 0, options.z || -18);

    this.scene.add(this.group);

    this.hideBossUI();
  }

  createModel() {
    const armor = new THREE.MeshStandardMaterial({
      color: 0x1b1c20,
      roughness: 0.45,
      metalness: 0.75,
    });

    const darkArmor = new THREE.MeshStandardMaterial({
      color: 0x0e0f12,
      roughness: 0.5,
      metalness: 0.8,
    });

    const cloth = new THREE.MeshStandardMaterial({
      color: 0x301010,
      roughness: 0.95,
    });

    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0x94979d,
      roughness: 0.2,
      metalness: 0.95,
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xb12b18,
      emissive: 0x671006,
      emissiveIntensity: 3,
      roughness: 0.35,
    });

    const legs = new THREE.Group();

    const leftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.3, 1.3, 10),
      darkArmor,
    );

    leftLeg.position.set(-0.35, 0.65, 0);
    leftLeg.castShadow = true;

    legs.add(leftLeg);

    const rightLeg = leftLeg.clone();

    rightLeg.position.x = 0.35;

    legs.add(rightLeg);

    this.group.add(legs);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.9, 1.9, 12),
      armor,
    );

    body.position.y = 1.85;
    body.castShadow = true;

    this.group.add(body);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.05, 0.75), armor);

    chest.position.set(0, 2.15, -0.03);
    chest.castShadow = true;

    this.group.add(chest);

    const shoulderLeft = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 12, 12),
      darkArmor,
    );

    shoulderLeft.position.set(-1, 2.45, 0);
    shoulderLeft.scale.set(1.3, 0.7, 1);
    shoulderLeft.castShadow = true;

    this.group.add(shoulderLeft);

    const shoulderRight = shoulderLeft.clone();

    shoulderRight.position.x = 1;

    this.group.add(shoulderRight);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 16, 16),
      darkArmor,
    );

    head.position.y = 3.25;
    head.scale.set(0.95, 1.15, 0.95);
    head.castShadow = true;

    this.group.add(head);

    const facePlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.42, 0.22),
      darkArmor,
    );

    facePlate.position.set(0, 3.25, -0.46);

    facePlate.castShadow = true;

    this.group.add(facePlate);

    const eyeLeft = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      glowMaterial,
    );

    eyeLeft.position.set(-0.18, 3.28, -0.59);

    this.group.add(eyeLeft);

    const eyeRight = eyeLeft.clone();

    eyeRight.position.x = 0.18;

    this.group.add(eyeRight);

    const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.5), cloth);

    cape.position.set(0, 1.9, 0.55);

    cape.rotation.x = 0.08;

    this.group.add(cape);

    this.weaponPivot = new THREE.Group();

    this.weaponPivot.position.set(1.05, 2.25, 0);

    this.group.add(this.weaponPivot);

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.18, 3.6),
      bladeMaterial,
    );

    blade.position.z = -1.4;
    blade.castShadow = true;

    this.weaponPivot.add(blade);

    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.18, 0.18),
      darkArmor,
    );

    guard.position.z = 0.4;
    guard.castShadow = true;

    this.weaponPivot.add(guard);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.85, 8),
      darkArmor,
    );

    handle.rotation.x = Math.PI / 2;
    handle.position.z = 0.8;
    handle.castShadow = true;

    this.weaponPivot.add(handle);

    this.aura = new THREE.PointLight(0x7f1510, 1.8, 7);

    this.aura.position.y = 2.4;

    this.group.add(this.aura);
  }

  startFight() {
    if (this.started || this.dead) {
      return;
    }

    this.started = true;

    this.showBossUI();

    window.dispatchEvent(
      new CustomEvent("boss:start", {
        detail: {
          boss: this,
        },
      }),
    );
  }

  update(delta, time) {
    if (this.dead) {
      return;
    }

    const distance = this.group.position.distanceTo(this.player.group.position);

    if (!this.started && distance <= this.detectionRange) {
      this.startFight();
    }

    if (!this.started) {
      return;
    }

    this.attackTimer -= delta;
    this.specialTimer -= delta;

    this.updatePhase();
    this.updateAura(time);

    if (this.attackState) {
      this.updateAttack(delta);
      return;
    }

    this.facePlayer();

    if (this.specialTimer <= 0) {
      this.startSpecialAttack();
      return;
    }

    if (distance <= this.attackRange && this.attackTimer <= 0) {
      this.startNormalAttack();
      return;
    }

    if (distance > this.attackRange * 0.85) {
      this.moveTowardPlayer(delta);
    }
  }

  facePlayer() {
    this.direction
      .subVectors(this.player.group.position, this.group.position)
      .setY(0);

    if (this.direction.lengthSq() === 0) {
      return;
    }

    this.direction.normalize();

    const targetRotation = Math.atan2(this.direction.x, this.direction.z);

    this.group.rotation.y = THREE.MathUtils.lerp(
      this.group.rotation.y,
      targetRotation,
      0.1,
    );
  }

  moveTowardPlayer(delta) {
    this.direction
      .subVectors(this.player.group.position, this.group.position)
      .setY(0);

    if (this.direction.lengthSq() === 0) {
      return;
    }

    this.direction.normalize();

    const phaseSpeed =
      this.phase === 1
        ? this.speed
        : this.phase === 2
          ? this.speed * 1.25
          : this.speed * 1.55;

    this.group.position.x += this.direction.x * phaseSpeed * delta;

    this.group.position.z += this.direction.z * phaseSpeed * delta;
  }

  startNormalAttack() {
    this.attackTimer =
      this.phase === 1 ? this.attackCooldown : this.attackCooldown * 0.72;

    this.attackState = {
      type: "slash",
      duration: this.phase === 3 ? 0.55 : 0.72,
      hit: false,
    };

    this.attackProgress = 0;
  }

  startSpecialAttack() {
    this.specialTimer =
      this.phase === 1 ? this.specialCooldown : this.phase === 2 ? 4 : 3;

    const attack =
      this.phase === 1
        ? "slam"
        : this.phase === 2
          ? Math.random() > 0.5
            ? "slam"
            : "charge"
          : Math.random() > 0.45
            ? "spin"
            : "charge";

    this.attackState = {
      type: attack,
      duration: attack === "slam" ? 1.3 : attack === "charge" ? 1.1 : 1.4,
      hit: false,
    };

    this.attackProgress = 0;
  }

  updateAttack(delta) {
    this.attackProgress += delta;

    const progress = this.attackProgress / this.attackState.duration;

    if (this.attackState.type === "slash") {
      this.updateSlash(progress);
    }

    if (this.attackState.type === "slam") {
      this.updateSlam(progress);
    }

    if (this.attackState.type === "charge") {
      this.updateCharge(progress, delta);
    }

    if (this.attackState.type === "spin") {
      this.updateSpin(progress);
    }

    if (progress >= 1) {
      this.finishAttack();
    }
  }

  updateSlash(progress) {
    this.weaponPivot.rotation.y = THREE.MathUtils.lerp(
      -1.4,
      1.6,
      this.ease(progress),
    );

    this.weaponPivot.rotation.x = Math.sin(progress * Math.PI) * 0.45;

    if (progress >= 0.45 && !this.attackState.hit) {
      this.attackState.hit = true;

      this.damagePlayer(this.damage, this.attackRange + 0.4);
    }
  }

  updateSlam(progress) {
    if (progress < 0.55) {
      this.weaponPivot.rotation.x = THREE.MathUtils.lerp(
        0,
        -1.8,
        progress / 0.55,
      );
    } else {
      this.weaponPivot.rotation.x = THREE.MathUtils.lerp(
        -1.8,
        0.55,
        (progress - 0.55) / 0.45,
      );
    }

    if (progress >= 0.62 && !this.attackState.hit) {
      this.attackState.hit = true;

      this.createSlamWave();

      this.damagePlayer(this.damage * 1.45, 3.8);
    }
  }

  updateCharge(progress, delta) {
    if (progress < 0.2) {
      this.weaponPivot.rotation.y = -0.8;
      return;
    }

    this.direction
      .subVectors(this.player.group.position, this.group.position)
      .setY(0);

    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
    }

    this.group.position.x += this.direction.x * 8 * delta;

    this.group.position.z += this.direction.z * 8 * delta;

    if (progress >= 0.3 && !this.attackState.hit) {
      const distance = this.group.position.distanceTo(
        this.player.group.position,
      );

      if (distance <= 2) {
        this.attackState.hit = true;

        this.player.takeDamage(this.damage * 1.2);
      }
    }
  }

  updateSpin(progress) {
    this.weaponPivot.rotation.y = progress * Math.PI * 5;

    this.group.rotation.y += 0.22;

    if (progress >= 0.2 && !this.attackState.hit) {
      this.attackState.hit = true;

      this.damagePlayer(this.damage * 1.25, 3);
    }
  }

  damagePlayer(damage, range) {
    const distance = this.group.position.distanceTo(this.player.group.position);

    if (distance > range) {
      return;
    }

    this.player.takeDamage(Math.round(damage));
  }

  createSlamWave() {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.9, 48),
      new THREE.MeshBasicMaterial({
        color: 0xd13e20,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      }),
    );

    ring.rotation.x = -Math.PI / 2;

    ring.position.copy(this.group.position);

    ring.position.y = 0.08;

    this.scene.add(ring);

    const start = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - start) / 600, 1);

      const scale = 1 + progress * 5;

      ring.scale.set(scale, scale, scale);

      ring.material.opacity = 0.65 * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(ring);
      }
    };

    requestAnimationFrame(animate);
  }

  finishAttack() {
    this.attackState = null;
    this.attackProgress = 0;

    this.weaponPivot.rotation.x = 0;
    this.weaponPivot.rotation.y = 0;
  }

  updatePhase() {
    const percentage = this.health / this.maxHealth;

    const previousPhase = this.phase;

    if (percentage <= 0.35) {
      this.phase = 3;
    } else if (percentage <= 0.7) {
      this.phase = 2;
    } else {
      this.phase = 1;
    }

    if (this.phase !== previousPhase) {
      this.onPhaseChange();
    }
  }

  onPhaseChange() {
    if (this.phase === 2) {
      this.aura.color.setHex(0xd24a18);

      this.aura.intensity = 3;
    }

    if (this.phase === 3) {
      this.aura.color.setHex(0xff1e0d);

      this.aura.intensity = 5;

      this.speed *= 1.08;
    }

    window.dispatchEvent(
      new CustomEvent("boss:phase", {
        detail: {
          phase: this.phase,
          boss: this,
        },
      }),
    );
  }

  updateAura(time) {
    this.aura.intensity =
      (this.phase === 1 ? 1.8 : this.phase === 2 ? 3 : 4.8) +
      Math.sin(time * 5) * 0.3;
  }

  takeDamage(amount) {
    if (this.dead) {
      return;
    }

    this.health -= amount;

    if (this.health < 0) {
      this.health = 0;
    }

    this.updateBossUI();

    this.group.scale.set(1.04, 0.96, 1.04);

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

    this.hideBossUI();

    window.dispatchEvent(
      new CustomEvent("boss:defeated", {
        detail: {
          name: this.name,
          souls: this.soulsReward,
          position: this.group.position.clone(),
        },
      }),
    );

    const start = performance.now();

    const duration = 1400;

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);

      this.group.rotation.z = progress * 0.9;

      this.group.position.y = -progress * 2;

      this.group.scale.setScalar(1 - progress * 0.8);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(this.group);
      }
    };

    requestAnimationFrame(animate);
  }

  showBossUI() {
    if (this.bossName) {
      this.bossName.textContent = this.name;
    }

    if (this.bossUI) {
      this.bossUI.classList.remove("hidden");
    }

    this.updateBossUI();
  }

  hideBossUI() {
    if (this.bossUI) {
      this.bossUI.classList.add("hidden");
    }
  }

  updateBossUI() {
    if (!this.bossHealthFill) {
      return;
    }

    const percentage = Math.max(0, this.health / this.maxHealth) * 100;

    this.bossHealthFill.style.width = `${percentage}%`;
  }

  ease(value) {
    const clamped = THREE.MathUtils.clamp(value, 0, 1);

    return 1 - Math.pow(1 - clamped, 3);
  }

  getPosition() {
    return this.group.position;
  }
}
