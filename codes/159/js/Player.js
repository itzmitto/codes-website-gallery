import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Player {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.group = new THREE.Group();

    this.health = 100;
    this.maxHealth = 100;

    this.stamina = 100;
    this.maxStamina = 100;

    this.level = 1;
    this.souls = 0;

    this.walkSpeed = 4.8;
    this.sprintSpeed = 7.5;
    this.dodgeSpeed = 12;

    this.staminaRegen = 28;
    this.sprintDrain = 18;
    this.dodgeCost = 32;

    this.isDodging = false;
    this.dodgeTimer = 0;
    this.dodgeDuration = 0.32;
    this.dodgeCooldown = 0.15;
    this.dodgeCooldownTimer = 0;

    this.invulnerable = false;

    this.keys = {};
    this.direction = new THREE.Vector3();
    this.lastDirection = new THREE.Vector3(0, 0, -1);
    this.dodgeDirection = new THREE.Vector3();

    this.minX = -9.7;
    this.maxX = 9.7;
    this.minZ = -9.7;
    this.maxZ = 9.7;

    this.healthFill = document.getElementById("health-fill");
    this.healthValue = document.getElementById("health-value");
    this.healthMax = document.getElementById("health-max");

    this.staminaFill = document.getElementById("stamina-fill");
    this.staminaValue = document.getElementById("stamina-value");
    this.staminaMax = document.getElementById("stamina-max");

    this.levelValue = document.getElementById("player-level");
    this.soulsValue = document.getElementById("souls-value");

    this.createModel();
    this.setupControls();
    this.updateUI();

    this.group.position.set(0, 0, 6);

    this.scene.add(this.group);
  }

  createModel() {
    const armorMaterial = new THREE.MeshStandardMaterial({
      color: 0x262932,
      roughness: 0.68,
      metalness: 0.4,
    });

    const darkMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x15171c,
      roughness: 0.55,
      metalness: 0.65,
    });

    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0xaeb4bd,
      roughness: 0.22,
      metalness: 0.95,
    });

    const clothMaterial = new THREE.MeshStandardMaterial({
      color: 0x241515,
      roughness: 0.95,
      metalness: 0,
    });

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.52, 1.25, 12),
      armorMaterial,
    );

    body.position.y = 1.05;
    body.castShadow = true;

    this.group.add(body);

    const chestArmor = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.65, 0.48),
      armorMaterial,
    );

    chestArmor.position.set(0, 1.25, -0.02);
    chestArmor.castShadow = true;

    this.group.add(chestArmor);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 16),
      darkMetalMaterial,
    );

    head.position.y = 1.95;
    head.scale.y = 1.1;
    head.castShadow = true;

    this.group.add(head);

    const helmetFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.28, 0.18),
      darkMetalMaterial,
    );

    helmetFront.position.set(0, 1.93, -0.31);
    helmetFront.castShadow = true;

    this.group.add(helmetFront);

    const leftShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 12),
      armorMaterial,
    );

    leftShoulder.position.set(-0.58, 1.45, 0);
    leftShoulder.scale.set(1.2, 0.75, 1);
    leftShoulder.castShadow = true;

    this.group.add(leftShoulder);

    const rightShoulder = leftShoulder.clone();

    rightShoulder.position.x = 0.58;

    this.group.add(rightShoulder);

    const leftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 0.8, 10),
      darkMetalMaterial,
    );

    leftLeg.position.set(-0.22, 0.4, 0);
    leftLeg.castShadow = true;

    this.group.add(leftLeg);

    const rightLeg = leftLeg.clone();

    rightLeg.position.x = 0.22;

    this.group.add(rightLeg);

    const cape = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 1.45),
      clothMaterial,
    );

    cape.position.set(0, 1.15, 0.35);
    cape.rotation.x = 0.12;

    this.group.add(cape);

    this.weaponPivot = new THREE.Group();

    this.weaponPivot.position.set(0.55, 1.2, 0);

    this.group.add(this.weaponPivot);

    const swordBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 1.65),
      steelMaterial,
    );

    swordBlade.position.z = -0.65;
    swordBlade.castShadow = true;

    this.weaponPivot.add(swordBlade);

    const swordGuard = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, 0.12),
      darkMetalMaterial,
    );

    swordGuard.position.z = 0.15;
    swordGuard.castShadow = true;

    this.weaponPivot.add(swordGuard);

    const swordHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.42, 8),
      darkMetalMaterial,
    );

    swordHandle.rotation.x = Math.PI / 2;
    swordHandle.position.z = 0.4;
    swordHandle.castShadow = true;

    this.weaponPivot.add(swordHandle);

    this.weaponPivot.rotation.x = -0.15;
    this.weaponPivot.rotation.y = -0.1;
  }

  setupControls() {
    window.addEventListener("keydown", (event) => {
      this.keys[event.code] = true;

      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        this.startDodge();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keys[event.code] = false;
    });
  }

  startDodge() {
    if (this.isDodging) {
      return;
    }

    if (this.dodgeCooldownTimer > 0) {
      return;
    }

    if (this.stamina < this.dodgeCost) {
      return;
    }

    this.direction.set(0, 0, 0);

    if (this.keys.KeyW) {
      this.direction.z -= 1;
    }

    if (this.keys.KeyS) {
      this.direction.z += 1;
    }

    if (this.keys.KeyA) {
      this.direction.x -= 1;
    }

    if (this.keys.KeyD) {
      this.direction.x += 1;
    }

    if (this.direction.lengthSq() === 0) {
      this.dodgeDirection.copy(this.lastDirection);
    } else {
      this.direction.normalize();
      this.dodgeDirection.copy(this.direction);
    }

    this.stamina -= this.dodgeCost;

    this.isDodging = true;
    this.invulnerable = true;
    this.dodgeTimer = this.dodgeDuration;

    this.updateUI();
  }

  update(delta) {
    if (this.dodgeCooldownTimer > 0) {
      this.dodgeCooldownTimer -= delta;
    }

    if (this.isDodging) {
      this.updateDodge(delta);
    } else {
      this.updateMovement(delta);
      this.updateStamina(delta);
    }

    this.clampPosition();
    this.updateCamera();
    this.updateUI();
  }

  updateMovement(delta) {
    this.direction.set(0, 0, 0);

    if (this.keys.KeyW) {
      this.direction.z -= 1;
    }

    if (this.keys.KeyS) {
      this.direction.z += 1;
    }

    if (this.keys.KeyA) {
      this.direction.x -= 1;
    }

    if (this.keys.KeyD) {
      this.direction.x += 1;
    }

    if (this.direction.lengthSq() === 0) {
      return;
    }

    this.direction.normalize();
    this.lastDirection.copy(this.direction);

    let speed = this.walkSpeed;

    const sprinting = this.keys.ShiftLeft && this.stamina > 0;

    if (sprinting) {
      speed = this.sprintSpeed;

      this.stamina -= this.sprintDrain * delta;

      if (this.stamina < 0) {
        this.stamina = 0;
      }
    }

    this.group.position.x += this.direction.x * speed * delta;

    this.group.position.z += this.direction.z * speed * delta;

    const targetRotation = Math.atan2(this.direction.x, this.direction.z);

    this.group.rotation.y = THREE.MathUtils.lerp(
      this.group.rotation.y,
      targetRotation,
      0.2,
    );
  }

  updateDodge(delta) {
    this.dodgeTimer -= delta;

    const progress = Math.max(this.dodgeTimer, 0) / this.dodgeDuration;

    const speed = this.dodgeSpeed * (0.55 + progress * 0.45);

    this.group.position.x += this.dodgeDirection.x * speed * delta;

    this.group.position.z += this.dodgeDirection.z * speed * delta;

    const targetRotation = Math.atan2(
      this.dodgeDirection.x,
      this.dodgeDirection.z,
    );

    this.group.rotation.y = targetRotation;

    this.group.rotation.z = Math.sin((1 - progress) * Math.PI) * 0.12;

    if (this.dodgeTimer <= 0) {
      this.isDodging = false;
      this.invulnerable = false;
      this.dodgeCooldownTimer = this.dodgeCooldown;
      this.group.rotation.z = 0;
    }
  }

  updateStamina(delta) {
    const moving =
      this.keys.KeyW || this.keys.KeyA || this.keys.KeyS || this.keys.KeyD;

    const sprinting = moving && this.keys.ShiftLeft && this.stamina > 0;

    if (!sprinting && this.stamina < this.maxStamina) {
      this.stamina += this.staminaRegen * delta;

      if (this.stamina > this.maxStamina) {
        this.stamina = this.maxStamina;
      }
    }
  }

  clampPosition() {
    this.group.position.x = THREE.MathUtils.clamp(
      this.group.position.x,
      this.minX,
      this.maxX,
    );

    this.group.position.z = THREE.MathUtils.clamp(
      this.group.position.z,
      this.minZ,
      this.maxZ,
    );
  }

  updateCamera() {
    const desiredPosition = new THREE.Vector3(
      this.group.position.x,
      this.group.position.y + 10,
      this.group.position.z + 11,
    );

    this.camera.position.lerp(desiredPosition, 0.08);

    this.camera.lookAt(this.group.position.x, 0.5, this.group.position.z);
  }

  takeDamage(amount) {
    if (this.invulnerable) {
      return false;
    }

    this.health -= amount;

    if (this.health < 0) {
      this.health = 0;
    }

    this.updateUI();

    return true;
  }

  heal(amount) {
    this.health += amount;

    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }

    this.updateUI();
  }

  addSouls(amount) {
    this.souls += amount;
    this.updateUI();
  }

  spendSouls(amount) {
    if (this.souls < amount) {
      return false;
    }

    this.souls -= amount;
    this.updateUI();

    return true;
  }

  setLevel(level) {
    this.level = level;
    this.updateUI();
  }

  updateUI() {
    if (this.healthFill) {
      this.healthFill.style.width = `${(this.health / this.maxHealth) * 100}%`;
    }

    if (this.healthValue) {
      this.healthValue.textContent = Math.ceil(this.health);
    }

    if (this.healthMax) {
      this.healthMax.textContent = this.maxHealth;
    }

    if (this.staminaFill) {
      this.staminaFill.style.width = `${(this.stamina / this.maxStamina) * 100}%`;
    }

    if (this.staminaValue) {
      this.staminaValue.textContent = Math.ceil(this.stamina);
    }

    if (this.staminaMax) {
      this.staminaMax.textContent = this.maxStamina;
    }

    if (this.levelValue) {
      this.levelValue.textContent = this.level;
    }

    if (this.soulsValue) {
      this.soulsValue.textContent = this.souls.toLocaleString();
    }
  }

  getPosition() {
    return this.group.position;
  }

  isDead() {
    return this.health <= 0;
  }
}
