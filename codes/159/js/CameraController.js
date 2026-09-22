import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class CameraController {
  constructor(camera, player, options = {}) {
    this.camera = camera;
    this.player = player;

    this.distance = options.distance || 9;

    this.height = options.height || 6;

    this.lookHeight = options.lookHeight || 1.2;

    this.smoothing = options.smoothing || 6;

    this.rotationSmoothing = options.rotationSmoothing || 8;

    this.mouseSensitivity = options.mouseSensitivity || 0.0022;

    this.minPitch = options.minPitch ?? -0.25;

    this.maxPitch = options.maxPitch ?? 0.85;

    this.minDistance = options.minDistance || 4.5;

    this.maxDistance = options.maxDistance || 13;

    this.zoomSpeed = options.zoomSpeed || 0.8;

    this.yaw = 0;
    this.pitch = 0.38;

    this.targetYaw = 0;
    this.targetPitch = 0.38;

    this.targetDistance = this.distance;

    this.locked = false;

    this.lockTarget = null;

    this.shakeAmount = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;

    this.currentPosition = new THREE.Vector3();

    this.currentLookTarget = new THREE.Vector3();

    this.desiredPosition = new THREE.Vector3();

    this.desiredLookTarget = new THREE.Vector3();

    this.tempVector = new THREE.Vector3();

    this.setupControls();
    this.snapToPlayer();
  }

  setupControls() {
    window.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement) {
        this.targetYaw -= event.movementX * this.mouseSensitivity;

        this.targetPitch -= event.movementY * this.mouseSensitivity;

        this.targetPitch = THREE.MathUtils.clamp(
          this.targetPitch,
          this.minPitch,
          this.maxPitch,
        );
      }
    });

    window.addEventListener(
      "wheel",
      (event) => {
        this.targetDistance += Math.sign(event.deltaY) * this.zoomSpeed;

        this.targetDistance = THREE.MathUtils.clamp(
          this.targetDistance,
          this.minDistance,
          this.maxDistance,
        );
      },
      {
        passive: true,
      },
    );

    window.addEventListener("mousedown", () => {
      if (!document.pointerLockElement) {
        document.body.requestPointerLock?.();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyQ" && !event.repeat) {
        window.dispatchEvent(new CustomEvent("camera:lock-request"));
      }
    });

    window.addEventListener("camera:shake", (event) => {
      this.shake(event.detail?.amount || 0.25, event.detail?.duration || 0.25);
    });
  }

  update(delta, enemies = []) {
    this.yaw = THREE.MathUtils.lerp(
      this.yaw,
      this.targetYaw,
      Math.min(1, this.rotationSmoothing * delta),
    );

    this.pitch = THREE.MathUtils.lerp(
      this.pitch,
      this.targetPitch,
      Math.min(1, this.rotationSmoothing * delta),
    );

    this.distance = THREE.MathUtils.lerp(
      this.distance,
      this.targetDistance,
      Math.min(1, this.smoothing * delta),
    );

    if (this.locked && (!this.lockTarget || this.lockTarget.dead)) {
      this.unlock();
    }

    if (this.locked && this.lockTarget) {
      this.updateLockTarget();
    }

    this.calculatePosition();

    this.currentPosition.lerp(
      this.desiredPosition,
      Math.min(1, this.smoothing * delta),
    );

    this.currentLookTarget.lerp(
      this.desiredLookTarget,
      Math.min(1, this.smoothing * delta),
    );

    const shakeOffset = this.updateShake(delta);

    this.camera.position.copy(this.currentPosition);

    this.camera.position.add(shakeOffset);

    this.camera.lookAt(this.currentLookTarget);

    if (!this.locked) {
      this.autoFindLockTarget(enemies);
    }
  }

  calculatePosition() {
    const playerPosition = this.player.group.position;

    if (this.locked && this.lockTarget) {
      const targetPosition = this.getTargetPosition(this.lockTarget);

      const midpoint = playerPosition.clone().lerp(targetPosition, 0.22);

      const direction = targetPosition.clone().sub(playerPosition).setY(0);

      if (direction.lengthSq() > 0.001) {
        direction.normalize();

        const lockYaw = Math.atan2(direction.x, direction.z);

        this.targetYaw = THREE.MathUtils.lerp(this.targetYaw, lockYaw, 0.08);
      }

      this.desiredLookTarget.set(
        midpoint.x,
        midpoint.y + this.lookHeight,
        midpoint.z,
      );
    } else {
      this.desiredLookTarget.set(
        playerPosition.x,
        playerPosition.y + this.lookHeight,
        playerPosition.z,
      );
    }

    const horizontalDistance = Math.cos(this.pitch) * this.distance;

    const verticalDistance = Math.sin(this.pitch) * this.distance + this.height;

    this.desiredPosition.set(
      this.desiredLookTarget.x + Math.sin(this.yaw) * horizontalDistance,

      this.desiredLookTarget.y + verticalDistance,

      this.desiredLookTarget.z + Math.cos(this.yaw) * horizontalDistance,
    );
  }

  toggleLock(enemies) {
    if (this.locked) {
      this.unlock();
      return null;
    }

    const target = this.findBestTarget(enemies);

    if (target) {
      this.lockOn(target);
    }

    return target;
  }

  lockOn(target) {
    if (!target || target.dead) {
      return false;
    }

    this.lockTarget = target;

    this.locked = true;

    window.dispatchEvent(
      new CustomEvent("camera:locked", {
        detail: {
          target,
        },
      }),
    );

    return true;
  }

  unlock() {
    const previous = this.lockTarget;

    this.locked = false;
    this.lockTarget = null;

    window.dispatchEvent(
      new CustomEvent("camera:unlocked", {
        detail: {
          target: previous,
        },
      }),
    );
  }

  findBestTarget(enemies, maxRange = 14) {
    let best = null;
    let bestScore = Infinity;

    const playerPosition = this.player.group.position;

    const forward = this.getCameraForward();

    for (const enemy of enemies) {
      if (!enemy || enemy.dead) {
        continue;
      }

      const position = this.getTargetPosition(enemy);

      if (!position) {
        continue;
      }

      const distance = playerPosition.distanceTo(position);

      if (distance > maxRange) {
        continue;
      }

      const direction = position.clone().sub(playerPosition).setY(0);

      if (direction.lengthSq() === 0) {
        continue;
      }

      direction.normalize();

      const angleScore =
        1 - THREE.MathUtils.clamp(forward.dot(direction), -1, 1);

      const score = distance * 0.45 + angleScore * 6;

      if (score < bestScore) {
        bestScore = score;

        best = enemy;
      }
    }

    return best;
  }

  autoFindLockTarget(enemies) {
    this.closestTarget = this.findBestTarget(enemies);
  }

  switchTarget(enemies, direction = 1) {
    if (!this.locked || !this.lockTarget) {
      return null;
    }

    const valid = enemies.filter(
      (enemy) => enemy && !enemy.dead && enemy !== this.lockTarget,
    );

    if (valid.length === 0) {
      return null;
    }

    const currentPosition = this.getTargetPosition(this.lockTarget);

    const currentDirection = currentPosition
      .clone()
      .sub(this.player.group.position)
      .setY(0)
      .normalize();

    let best = null;
    let bestAngle = Infinity;

    for (const enemy of valid) {
      const position = this.getTargetPosition(enemy);

      const enemyDirection = position
        .clone()
        .sub(this.player.group.position)
        .setY(0)
        .normalize();

      const cross =
        currentDirection.x * enemyDirection.z -
        currentDirection.z * enemyDirection.x;

      if (direction > 0 && cross >= 0) {
        continue;
      }

      if (direction < 0 && cross <= 0) {
        continue;
      }

      const angle = currentDirection.angleTo(enemyDirection);

      if (angle < bestAngle) {
        bestAngle = angle;

        best = enemy;
      }
    }

    if (best) {
      this.lockOn(best);
    }

    return best;
  }

  updateLockTarget() {
    const targetPosition = this.getTargetPosition(this.lockTarget);

    if (!targetPosition) {
      this.unlock();
      return;
    }

    const direction = targetPosition.clone().sub(this.player.group.position);

    const distance = direction.length();

    if (distance > 18) {
      this.unlock();
      return;
    }

    direction.y = 0;

    if (direction.lengthSq() > 0) {
      this.player.group.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }

  shake(amount = 0.25, duration = 0.25) {
    this.shakeAmount = Math.max(this.shakeAmount, amount);

    this.shakeDuration = duration;

    this.shakeTimer = duration;
  }

  updateShake(delta) {
    if (this.shakeTimer <= 0) {
      return new THREE.Vector3();
    }

    this.shakeTimer -= delta;

    const progress = THREE.MathUtils.clamp(
      this.shakeTimer / this.shakeDuration,
      0,
      1,
    );

    const strength = this.shakeAmount * progress;

    return new THREE.Vector3(
      (Math.random() - 0.5) * strength,

      (Math.random() - 0.5) * strength,

      (Math.random() - 0.5) * strength,
    );
  }

  snapToPlayer() {
    this.calculatePosition();

    this.currentPosition.copy(this.desiredPosition);

    this.currentLookTarget.copy(this.desiredLookTarget);

    this.camera.position.copy(this.currentPosition);

    this.camera.lookAt(this.currentLookTarget);
  }

  getCameraForward() {
    return new THREE.Vector3(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw),
    ).normalize();
  }

  getTargetPosition(target) {
    if (target.getPosition) {
      return target.getPosition().clone();
    }

    if (target.group?.position) {
      return target.group.position.clone();
    }

    return null;
  }

  setDistance(distance) {
    this.targetDistance = THREE.MathUtils.clamp(
      distance,
      this.minDistance,
      this.maxDistance,
    );
  }

  reset() {
    this.unlock();

    this.targetYaw = 0;
    this.targetPitch = 0.38;

    this.targetDistance = 9;

    this.snapToPlayer();
  }
}
