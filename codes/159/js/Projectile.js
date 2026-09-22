import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Projectile {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.position = options.position?.clone() || new THREE.Vector3();

    this.direction = options.direction?.clone() || new THREE.Vector3(0, 0, -1);

    this.direction.normalize();

    this.speed = options.speed || 8;

    this.damage = options.damage || 15;

    this.range = options.range || 18;

    this.radius = options.radius || 0.3;

    this.owner = options.owner || null;

    this.target = options.target || null;

    this.homing = options.homing || 0;

    this.element = options.element || "physical";

    this.color = options.color || 0xff8a3d;

    this.alive = true;

    this.travelled = 0;

    this.group = new THREE.Group();

    this.createModel();

    this.group.position.copy(this.position);

    this.scene.add(this.group);
  }

  createModel() {
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 12, 12),
      new THREE.MeshStandardMaterial({
        color: this.color,
        emissive: this.color,
        emissiveIntensity: 2.5,
        roughness: 0.2,
        metalness: 0.1,
      }),
    );

    this.group.add(core);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius * 1.8, 12, 12),
      new THREE.MeshBasicMaterial({
        color: this.color,
        transparent: true,
        opacity: 0.16,
      }),
    );

    this.group.add(glow);

    const light = new THREE.PointLight(this.color, 2.6, 5);

    this.group.add(light);

    this.core = core;
    this.glow = glow;
  }

  update(delta, targets = []) {
    if (!this.alive) {
      return;
    }

    if (this.homing > 0 && this.target) {
      this.updateHoming(delta);
    }

    const movement = this.direction.clone().multiplyScalar(this.speed * delta);

    this.group.position.add(movement);

    this.travelled += movement.length();

    this.group.rotation.x += delta * 4;

    this.group.rotation.y += delta * 6;

    const pulse = 1 + Math.sin(performance.now() * 0.01) * 0.08;

    this.glow.scale.setScalar(pulse);

    this.checkCollision(targets);

    if (this.travelled >= this.range) {
      this.destroy();
    }
  }

  updateHoming(delta) {
    const targetPosition = this.target.getPosition
      ? this.target.getPosition()
      : this.target.group?.position;

    if (!targetPosition) {
      return;
    }

    const desired = new THREE.Vector3()
      .subVectors(targetPosition, this.group.position)
      .normalize();

    this.direction.lerp(
      desired,
      THREE.MathUtils.clamp(this.homing * delta, 0, 1),
    );

    this.direction.normalize();
  }

  checkCollision(targets) {
    for (const target of targets) {
      if (!target || target === this.owner || target.dead) {
        continue;
      }

      const targetPosition = target.getPosition
        ? target.getPosition()
        : target.group?.position;

      if (!targetPosition) {
        continue;
      }

      const distance = this.group.position.distanceTo(targetPosition);

      const targetRadius = target.hitRadius || 0.8;

      if (distance <= this.radius + targetRadius) {
        this.hit(target);

        break;
      }
    }
  }

  hit(target) {
    if (!this.alive) {
      return;
    }

    if (typeof target.takeDamage === "function") {
      target.takeDamage(this.damage);
    }

    this.applyElement(target);

    this.spawnHitEffect();

    window.dispatchEvent(
      new CustomEvent("projectile:hit", {
        detail: {
          projectile: this,
          target,
          damage: this.damage,
          element: this.element,
        },
      }),
    );

    this.destroy();
  }

  applyElement(target) {
    if (!target.statusEffects) {
      return;
    }

    if (this.element === "bleed") {
      target.statusEffects.addBuildUp("bleed", 28);
    }

    if (this.element === "poison") {
      target.statusEffects.addBuildUp("poison", 32);
    }

    if (this.element === "frost") {
      target.statusEffects.addBuildUp("frost", 30);
    }

    if (this.element === "dark") {
      target.statusEffects.addBuildUp("dark", 24);
    }
  }

  spawnHitEffect() {
    const particles = [];

    for (let i = 0; i < 12; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 6, 6),
        new THREE.MeshBasicMaterial({
          color: this.color,
        }),
      );

      particle.position.copy(this.group.position);

      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3,

        Math.random() * 2.5,

        (Math.random() - 0.5) * 3,
      );

      this.scene.add(particle);

      particles.push(particle);
    }

    const start = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - start) / 500, 1);

      for (const particle of particles) {
        particle.position.addScaledVector(particle.userData.velocity, 0.016);

        particle.userData.velocity.y -= 4 * 0.016;

        particle.scale.setScalar(1 - progress);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        for (const particle of particles) {
          this.scene.remove(particle);
        }
      }
    };

    requestAnimationFrame(animate);
  }

  destroy() {
    if (!this.alive) {
      return;
    }

    this.alive = false;

    this.scene.remove(this.group);
  }

  getPosition() {
    return this.group.position;
  }
}
