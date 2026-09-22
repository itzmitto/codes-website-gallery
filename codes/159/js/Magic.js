import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Magic {
  constructor(player, projectileManager) {
    this.player = player;
    this.projectileManager = projectileManager;

    this.cooldowns = new Map();

    this.spells = {
      emberBolt: {
        name: "Ember Bolt",
        staminaCost: 18,
        cooldown: 0.55,
        damage: 34,
        speed: 13,
        range: 24,
        element: "fire",
        color: 0xff642c,
      },

      frostShard: {
        name: "Frost Shard",
        staminaCost: 22,
        cooldown: 0.8,
        damage: 28,
        speed: 11,
        range: 22,
        element: "frost",
        color: 0x75caff,
        homing: 2.4,
      },

      abyssOrb: {
        name: "Abyss Orb",
        staminaCost: 30,
        cooldown: 1.15,
        damage: 48,
        speed: 8,
        range: 25,
        element: "dark",
        color: 0x9b4cff,
        homing: 1.4,
      },

      bloodVolley: {
        name: "Blood Volley",
        staminaCost: 35,
        cooldown: 1.35,
        damage: 21,
        speed: 12,
        range: 19,
        element: "bleed",
        color: 0xd82e35,
      },

      soulBurst: {
        name: "Soul Burst",
        staminaCost: 42,
        cooldown: 3,
        damage: 38,
        speed: 8,
        range: 13,
        element: "dark",
        color: 0xc07aff,
      },
    };

    this.selectedSpell = "emberBolt";

    this.setupControls();
  }

  setupControls() {
    window.addEventListener("keydown", (event) => {
      if (event.repeat) {
        return;
      }

      if (event.code === "Digit1") {
        this.selectSpell("emberBolt");
      }

      if (event.code === "Digit2") {
        this.selectSpell("frostShard");
      }

      if (event.code === "Digit3") {
        this.selectSpell("abyssOrb");
      }

      if (event.code === "Digit4") {
        this.selectSpell("bloodVolley");
      }

      if (event.code === "Digit5") {
        this.selectSpell("soulBurst");
      }

      if (event.code === "KeyE") {
        this.castSelected();
      }
    });
  }

  update(delta) {
    for (const [spell, time] of this.cooldowns) {
      const next = time - delta;

      if (next <= 0) {
        this.cooldowns.delete(spell);
      } else {
        this.cooldowns.set(spell, next);
      }
    }
  }

  selectSpell(name) {
    if (!this.spells[name]) {
      return false;
    }

    this.selectedSpell = name;

    window.dispatchEvent(
      new CustomEvent("magic:selected", {
        detail: {
          id: name,
          spell: this.spells[name],
        },
      }),
    );

    return true;
  }

  castSelected(enemies = []) {
    return this.cast(this.selectedSpell, enemies);
  }

  cast(spellName, enemies = []) {
    const spell = this.spells[spellName];

    if (!spell) {
      return false;
    }

    if (this.cooldowns.has(spellName)) {
      return false;
    }

    if (this.player.isDodging) {
      return false;
    }

    if (this.player.stamina < spell.staminaCost) {
      window.dispatchEvent(new CustomEvent("magic:no-stamina"));

      return false;
    }

    this.player.stamina -= spell.staminaCost;

    this.player.updateUI();

    this.cooldowns.set(spellName, spell.cooldown);

    if (spellName === "emberBolt") {
      this.castEmberBolt(spell, enemies);
    }

    if (spellName === "frostShard") {
      this.castFrostShard(spell, enemies);
    }

    if (spellName === "abyssOrb") {
      this.castAbyssOrb(spell, enemies);
    }

    if (spellName === "bloodVolley") {
      this.castBloodVolley(spell);
    }

    if (spellName === "soulBurst") {
      this.castSoulBurst(spell);
    }

    window.dispatchEvent(
      new CustomEvent("magic:cast", {
        detail: {
          id: spellName,
          spell,
        },
      }),
    );

    return true;
  }

  castEmberBolt(spell, enemies) {
    this.projectileManager.spawnFromPlayer(null, enemies, {
      damage: spell.damage,
      speed: spell.speed,
      range: spell.range,
      radius: 0.24,
      element: spell.element,
      color: spell.color,
      autoTarget: true,
      targetRange: 11,
    });
  }

  castFrostShard(spell, enemies) {
    this.projectileManager.spawnFromPlayer(null, enemies, {
      damage: spell.damage,
      speed: spell.speed,
      range: spell.range,
      radius: 0.23,
      element: spell.element,
      color: spell.color,
      homing: spell.homing,
      autoTarget: true,
      targetRange: 14,
    });
  }

  castAbyssOrb(spell, enemies) {
    this.projectileManager.spawnFromPlayer(null, enemies, {
      damage: spell.damage,
      speed: spell.speed,
      range: spell.range,
      radius: 0.38,
      element: spell.element,
      color: spell.color,
      homing: spell.homing,
      autoTarget: true,
      targetRange: 15,
    });
  }

  castBloodVolley(spell) {
    const origin = this.player.group.position.clone();

    origin.y += 1.25;

    const direction = this.getPlayerForward();

    this.projectileManager.spawnSpread(origin, direction, 5, 0.16, {
      owner: this.player,
      damage: spell.damage,
      speed: spell.speed,
      range: spell.range,
      radius: 0.16,
      element: spell.element,
      color: spell.color,
    });
  }

  castSoulBurst(spell) {
    const origin = this.player.group.position.clone();

    origin.y += 0.8;

    const count = 14;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;

      const direction = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));

      this.projectileManager.spawn({
        position: origin.clone(),

        direction,

        speed: spell.speed,

        damage: spell.damage,

        range: spell.range,

        radius: 0.2,

        owner: this.player,

        element: spell.element,

        color: spell.color,
      });
    }

    this.spawnBurstEffect(spell.color);
  }

  spawnBurstEffect(color) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.9, 48),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      }),
    );

    ring.rotation.x = -Math.PI / 2;

    ring.position.copy(this.player.group.position);

    ring.position.y = 0.1;

    this.projectileManager.scene.add(ring);

    const start = performance.now();

    const duration = 450;

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);

      const scale = 1 + progress * 4;

      ring.scale.set(scale, scale, scale);

      ring.material.opacity = 0.7 * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.projectileManager.scene.remove(ring);
      }
    };

    requestAnimationFrame(animate);
  }

  getPlayerForward() {
    return new THREE.Vector3(
      Math.sin(this.player.group.rotation.y),
      0,
      Math.cos(this.player.group.rotation.y),
    ).normalize();
  }

  getSelectedSpell() {
    return {
      id: this.selectedSpell,
      ...this.spells[this.selectedSpell],
    };
  }

  getCooldown(spellName) {
    return this.cooldowns.get(spellName) || 0;
  }
}
