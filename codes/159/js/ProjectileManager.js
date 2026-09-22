import Projectile from "./Projectile.js";

export default class ProjectileManager {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.projectiles = [];
  }

  spawn(options = {}) {
    const projectile = new Projectile(this.scene, options);

    this.projectiles.push(projectile);

    return projectile;
  }

  spawnFromEnemy(enemy, options = {}) {
    const enemyPosition = enemy.getPosition
      ? enemy.getPosition()
      : enemy.group.position;

    const playerPosition = this.player.group.position;

    const direction = playerPosition
      .clone()
      .sub(enemyPosition)
      .setY(0)
      .normalize();

    return this.spawn({
      position: enemyPosition.clone().add({
        x: 0,
        y: options.height || 1.4,
        z: 0,
      }),

      direction,

      speed: options.speed || 8,

      damage: options.damage || enemy.damage || 15,

      range: options.range || 18,

      radius: options.radius || 0.25,

      owner: enemy,

      target: this.player,

      homing: options.homing || 0,

      element: options.element || "physical",

      color: options.color || 0xff5a32,
    });
  }

  spawnFromPlayer(direction, enemies, options = {}) {
    const position = this.player.group.position.clone();

    position.y += options.height || 1.2;

    let target = options.target || null;

    if (!target && options.autoTarget) {
      target = this.findNearestTarget(enemies, options.targetRange || 12);
    }

    let finalDirection = direction?.clone();

    if (!finalDirection) {
      finalDirection = this.getPlayerForward();
    }

    if (target) {
      const targetPosition = target.getPosition
        ? target.getPosition()
        : target.group?.position;

      if (targetPosition) {
        finalDirection = targetPosition.clone().sub(position).normalize();
      }
    }

    return this.spawn({
      position,

      direction: finalDirection,

      speed: options.speed || 11,

      damage: options.damage || 24,

      range: options.range || 22,

      radius: options.radius || 0.22,

      owner: this.player,

      target,

      homing: options.homing || 0,

      element: options.element || "physical",

      color: options.color || 0x7ab8ff,
    });
  }

  spawnSpread(origin, direction, count = 5, spread = 0.35, options = {}) {
    const spawned = [];

    const startAngle = (-spread * (count - 1)) / 2;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + spread * i;

      const rotatedDirection = direction
        .clone()
        .applyAxisAngle(
          {
            x: 0,
            y: 1,
            z: 0,
          },
          angle,
        )
        .normalize();

      const projectile = this.spawn({
        position: origin.clone(),

        direction: rotatedDirection,

        speed: options.speed || 9,

        damage: options.damage || 18,

        range: options.range || 16,

        radius: options.radius || 0.2,

        owner: options.owner || null,

        element: options.element || "physical",

        color: options.color || 0xff824a,
      });

      spawned.push(projectile);
    }

    return spawned;
  }

  spawnRing(origin, count = 12, options = {}) {
    const spawned = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;

      const direction = {
        x: Math.sin(angle),

        y: 0,

        z: Math.cos(angle),
      };

      const projectile = this.spawn({
        position: origin.clone(),

        direction: direction,

        speed: options.speed || 7,

        damage: options.damage || 20,

        range: options.range || 14,

        radius: options.radius || 0.2,

        owner: options.owner || null,

        element: options.element || "dark",

        color: options.color || 0xb452ff,
      });

      spawned.push(projectile);
    }

    return spawned;
  }

  findNearestTarget(enemies, range = 12) {
    let nearest = null;

    let nearestDistance = range;

    for (const enemy of enemies) {
      if (!enemy || enemy.dead) {
        continue;
      }

      const position = enemy.getPosition
        ? enemy.getPosition()
        : enemy.group?.position;

      if (!position) {
        continue;
      }

      const distance = this.player.group.position.distanceTo(position);

      if (distance < nearestDistance) {
        nearestDistance = distance;

        nearest = enemy;
      }
    }

    return nearest;
  }

  getPlayerForward() {
    return {
      x: Math.sin(this.player.group.rotation.y),

      y: 0,

      z: Math.cos(this.player.group.rotation.y),
    };
  }

  update(delta, enemies = []) {
    const targets = [this.player, ...enemies];

    for (const projectile of this.projectiles) {
      projectile.update(delta, targets);
    }

    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.alive,
    );
  }

  removeByOwner(owner) {
    for (const projectile of this.projectiles) {
      if (projectile.owner === owner) {
        projectile.destroy();
      }
    }

    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.alive,
    );
  }

  clear() {
    for (const projectile of this.projectiles) {
      projectile.destroy();
    }

    this.projectiles = [];
  }
}
