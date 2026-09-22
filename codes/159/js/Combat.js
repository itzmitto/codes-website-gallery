import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Combat {
  constructor(player) {
    this.player = player;

    this.enemies = [];

    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0;

    this.attackType = null;
    this.hasHit = false;

    this.comboIndex = 0;
    this.comboTimer = 0;
    this.comboResetTime = 0.75;

    this.lightAttackCost = 18;
    this.heavyAttackCost = 34;

    this.lightDamage = 24;
    this.heavyDamage = 48;

    this.lightRange = 2.1;
    this.heavyRange = 2.6;

    this.lightDuration = 0.38;
    this.heavyDuration = 0.72;

    this.lightHitTime = 0.18;
    this.heavyHitTime = 0.34;

    this.attackDirection = new THREE.Vector3();
    this.tempDirection = new THREE.Vector3();

    this.setupControls();
  }

  setupControls() {
    window.addEventListener("mousedown", (event) => {
      if (event.button === 0) {
        this.lightAttack();
      }

      if (event.button === 2) {
        this.heavyAttack();
      }
    });

    window.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  addEnemy(enemy) {
    if (!this.enemies.includes(enemy)) {
      this.enemies.push(enemy);
    }
  }

  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);

    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }

  setEnemies(enemies) {
    this.enemies = enemies;
  }

  lightAttack() {
    if (this.isAttacking) {
      return;
    }

    if (this.player.isDodging) {
      return;
    }

    if (this.player.stamina < this.lightAttackCost) {
      return;
    }

    this.player.stamina -= this.lightAttackCost;

    this.isAttacking = true;
    this.attackType = "light";
    this.attackTimer = 0;
    this.attackDuration = this.lightDuration;
    this.hasHit = false;

    this.comboIndex += 1;

    if (this.comboIndex > 3) {
      this.comboIndex = 1;
    }

    this.comboTimer = this.comboResetTime;

    this.captureAttackDirection();
  }

  heavyAttack() {
    if (this.isAttacking) {
      return;
    }

    if (this.player.isDodging) {
      return;
    }

    if (this.player.stamina < this.heavyAttackCost) {
      return;
    }

    this.player.stamina -= this.heavyAttackCost;

    this.isAttacking = true;
    this.attackType = "heavy";
    this.attackTimer = 0;
    this.attackDuration = this.heavyDuration;
    this.hasHit = false;

    this.comboIndex = 0;
    this.comboTimer = 0;

    this.captureAttackDirection();
  }

  captureAttackDirection() {
    this.attackDirection.set(
      Math.sin(this.player.group.rotation.y),
      0,
      Math.cos(this.player.group.rotation.y),
    );

    this.attackDirection.normalize();
  }

  update(delta) {
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;

      if (this.comboTimer <= 0) {
        this.comboIndex = 0;
      }
    }

    if (!this.isAttacking) {
      this.resetWeaponRotation();
      return;
    }

    this.attackTimer += delta;

    if (this.attackType === "light") {
      this.updateLightAttack();
    }

    if (this.attackType === "heavy") {
      this.updateHeavyAttack();
    }

    if (this.attackTimer >= this.attackDuration) {
      this.finishAttack();
    }
  }

  updateLightAttack() {
    const progress = this.attackTimer / this.lightDuration;

    let startAngle = -1.1;
    let endAngle = 1.05;

    if (this.comboIndex === 2) {
      startAngle = 1.1;
      endAngle = -1.05;
    }

    if (this.comboIndex === 3) {
      startAngle = -1.45;
      endAngle = 1.35;
    }

    const rotation = THREE.MathUtils.lerp(
      startAngle,
      endAngle,
      this.easeAttack(progress),
    );

    this.player.weaponPivot.rotation.y = rotation;

    this.player.weaponPivot.rotation.x =
      -0.15 + Math.sin(progress * Math.PI) * 0.35;

    if (!this.hasHit && this.attackTimer >= this.lightHitTime) {
      this.hasHit = true;

      this.performHit(this.lightDamage, this.lightRange, 0.35);
    }
  }

  updateHeavyAttack() {
    const progress = this.attackTimer / this.heavyDuration;

    if (progress < 0.45) {
      const windup = progress / 0.45;

      this.player.weaponPivot.rotation.y = THREE.MathUtils.lerp(
        0,
        -1.7,
        windup,
      );

      this.player.weaponPivot.rotation.x = THREE.MathUtils.lerp(
        -0.15,
        -1.1,
        windup,
      );
    } else {
      const swing = (progress - 0.45) / 0.55;

      this.player.weaponPivot.rotation.y = THREE.MathUtils.lerp(
        -1.7,
        1.8,
        this.easeAttack(swing),
      );

      this.player.weaponPivot.rotation.x = THREE.MathUtils.lerp(
        -1.1,
        0.3,
        swing,
      );
    }

    if (!this.hasHit && this.attackTimer >= this.heavyHitTime) {
      this.hasHit = true;

      this.performHit(this.heavyDamage, this.heavyRange, 0.15);
    }
  }

  performHit(damage, range, minDot) {
    const playerPosition = this.player.group.position;

    for (const enemy of this.enemies) {
      if (!enemy) {
        continue;
      }

      if (enemy.dead) {
        continue;
      }

      const enemyPosition = enemy.getPosition
        ? enemy.getPosition()
        : enemy.group?.position;

      if (!enemyPosition) {
        continue;
      }

      const distance = playerPosition.distanceTo(enemyPosition);

      if (distance > range) {
        continue;
      }

      this.tempDirection
        .subVectors(enemyPosition, playerPosition)
        .setY(0)
        .normalize();

      const dot = this.attackDirection.dot(this.tempDirection);

      if (dot < minDot) {
        continue;
      }

      if (typeof enemy.takeDamage === "function") {
        enemy.takeDamage(damage, this.player);
      }

      this.applyKnockback(enemy, this.attackType === "heavy" ? 0.9 : 0.35);
    }
  }

  applyKnockback(enemy, amount) {
    const enemyPosition = enemy.getPosition
      ? enemy.getPosition()
      : enemy.group?.position;

    if (!enemyPosition) {
      return;
    }

    this.tempDirection
      .subVectors(enemyPosition, this.player.group.position)
      .setY(0);

    if (this.tempDirection.lengthSq() === 0) {
      return;
    }

    this.tempDirection.normalize();

    enemyPosition.x += this.tempDirection.x * amount;

    enemyPosition.z += this.tempDirection.z * amount;
  }

  finishAttack() {
    this.isAttacking = false;
    this.attackType = null;
    this.attackTimer = 0;
    this.hasHit = false;

    this.resetWeaponRotation();
  }

  resetWeaponRotation() {
    if (!this.player.weaponPivot) {
      return;
    }

    this.player.weaponPivot.rotation.x = THREE.MathUtils.lerp(
      this.player.weaponPivot.rotation.x,
      -0.15,
      0.18,
    );

    this.player.weaponPivot.rotation.y = THREE.MathUtils.lerp(
      this.player.weaponPivot.rotation.y,
      -0.1,
      0.18,
    );
  }

  easeAttack(value) {
    return 1 - Math.pow(1 - THREE.MathUtils.clamp(value, 0, 1), 3);
  }
}
