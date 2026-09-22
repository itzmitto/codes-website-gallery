import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class Shrine {
  constructor(scene, player, levelSystem, options = {}) {
    this.scene = scene;
    this.player = player;
    this.levelSystem = levelSystem;

    this.position = new THREE.Vector3(options.x || 0, 0, options.z || 0);

    this.interactionRange = options.interactionRange || 2.4;

    this.active = false;
    this.menuOpen = false;

    this.group = new THREE.Group();

    this.group.position.copy(this.position);

    this.interactionMessage = document.getElementById("interaction-message");

    this.interactionText = document.getElementById("interaction-text");

    this.createModel();
    this.createMenu();
    this.setupControls();

    this.scene.add(this.group);
  }

  createModel() {
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f1d1a,
      roughness: 0.9,
      metalness: 0.05,
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x4b4032,
      roughness: 0.5,
      metalness: 0.65,
    });

    const emberMaterial = new THREE.MeshStandardMaterial({
      color: 0xc1732c,
      emissive: 0x8b3e10,
      emissiveIntensity: 2.6,
      roughness: 0.3,
    });

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45, 1.75, 0.45, 8),
      stoneMaterial,
    );

    base.position.y = 0.22;
    base.castShadow = true;
    base.receiveShadow = true;

    this.group.add(base);

    const upperBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.25, 0.28, 8),
      stoneMaterial,
    );

    upperBase.position.y = 0.55;
    upperBase.castShadow = true;

    this.group.add(upperBase);

    const swordBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 2.1, 0.22),
      metalMaterial,
    );

    swordBlade.position.y = 1.5;
    swordBlade.rotation.z = 0.08;
    swordBlade.castShadow = true;

    this.group.add(swordBlade);

    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.13, 0.18),
      metalMaterial,
    );

    guard.position.set(0, 0.82, 0);

    guard.rotation.z = 0.08;
    guard.castShadow = true;

    this.group.add(guard);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.65, 8),
      metalMaterial,
    );

    handle.position.y = 0.5;
    handle.rotation.z = 0.08;
    handle.castShadow = true;

    this.group.add(handle);

    this.ember = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 1),
      emberMaterial,
    );

    this.ember.position.set(0, 0.82, 0.25);

    this.group.add(this.ember);

    this.light = new THREE.PointLight(0xff7b2c, 4.5, 10);

    this.light.position.set(0, 1.4, 0);

    this.group.add(this.light);

    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.035, 8, 48),
      new THREE.MeshBasicMaterial({
        color: 0xb96f29,
        transparent: true,
        opacity: 0.45,
      }),
    );

    this.ring.rotation.x = Math.PI / 2;

    this.ring.position.y = 0.63;

    this.group.add(this.ring);
  }

  createMenu() {
    this.overlay = document.createElement("div");

    Object.assign(this.overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "600",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.78)",
      backdropFilter: "blur(8px)",
    });

    this.panel = document.createElement("div");

    Object.assign(this.panel.style, {
      width: "min(760px, calc(100vw - 50px))",
      border: "1px solid rgba(174,128,70,0.35)",
      background: "linear-gradient(145deg,#12100d,#080706)",
      boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
      padding: "28px",
      color: "#ddd3c1",
    });

    this.overlay.appendChild(this.panel);

    document.body.appendChild(this.overlay);

    this.renderMenu();
  }

  setupControls() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyF" && !event.repeat && !this.menuOpen) {
        this.tryInteract();
      }

      if (event.code === "Escape" && this.menuOpen) {
        this.closeMenu();
      }
    });
  }

  update(time) {
    const distance = this.player.group.position.distanceTo(this.group.position);

    this.active = distance <= this.interactionRange;

    if (this.active && !this.menuOpen) {
      this.showInteraction();
    } else {
      this.hideInteraction();
    }

    this.ember.rotation.y += 0.01;

    this.ember.position.y = 0.82 + Math.sin(time * 2.2) * 0.05;

    this.ring.rotation.z += 0.003;

    this.light.intensity = 4.3 + Math.sin(time * 5) * 0.35;
  }

  tryInteract() {
    if (!this.active) {
      return;
    }

    this.rest();
  }

  rest() {
    this.player.health = this.player.maxHealth;

    this.player.stamina = this.player.maxStamina;

    this.player.updateUI();

    this.openMenu();

    window.dispatchEvent(new CustomEvent("shrine:rest"));
  }

  openMenu() {
    this.menuOpen = true;

    this.overlay.style.display = "flex";

    this.renderMenu();
  }

  closeMenu() {
    this.menuOpen = false;

    this.overlay.style.display = "none";
  }

  renderMenu() {
    const stats = this.levelSystem.getAllStats();

    const cost = this.levelSystem.getLevelCost();

    this.panel.innerHTML = `
      <div style="
        text-align:center;
        margin-bottom:30px;
      ">
        <div style="
          color:#8a6842;
          font-size:10px;
          letter-spacing:5px;
          margin-bottom:8px;
        ">
          ASH SHRINE
        </div>

        <div style="
          font-family:Georgia,serif;
          font-size:34px;
          color:#e0d4c2;
        ">
          Rest at the Shrine
        </div>

        <div style="
          margin-top:8px;
          color:#655f56;
          font-size:12px;
        ">
          ${this.player.souls.toLocaleString()} Souls
        </div>
      </div>

      <div
        id="shrine-stats"
        style="
          display:grid;
          gap:10px;
        "
      ></div>

      <button
        id="shrine-leave"
        style="
          width:100%;
          margin-top:24px;
          padding:13px;
          border:1px solid rgba(255,255,255,0.1);
          background:#11100e;
          color:#8d8578;
          cursor:pointer;
          letter-spacing:2px;
          font-size:10px;
        "
      >
        LEAVE SHRINE
      </button>
    `;

    const statsContainer = this.panel.querySelector("#shrine-stats");

    const statNames = {
      vitality: "Vitality",
      endurance: "Endurance",
      strength: "Strength",
      dexterity: "Dexterity",
      defense: "Defense",
    };

    for (const [key, label] of Object.entries(statNames)) {
      const row = document.createElement("button");

      Object.assign(row.style, {
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        alignItems: "center",
        gap: "18px",
        width: "100%",
        padding: "14px 16px",
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.025)",
        color: "#d6ccbc",
        cursor: "pointer",
        textAlign: "left",
      });

      row.innerHTML = `
        <span style="
          font-family:Georgia,serif;
          font-size:16px;
        ">
          ${label}
        </span>

        <span style="
          color:#9a9184;
          font-size:13px;
        ">
          ${stats[key]}
          →
          ${stats[key] + 1}
        </span>

        <span style="
          color:#b1844b;
          font-size:11px;
          min-width:90px;
          text-align:right;
        ">
          ${cost.toLocaleString()}
        </span>
      `;

      row.addEventListener("click", () => {
        const success = this.levelSystem.levelUp(key);

        if (success) {
          this.renderMenu();
        }
      });

      statsContainer.appendChild(row);
    }

    this.panel.querySelector("#shrine-leave").addEventListener("click", () => {
      this.closeMenu();
    });
  }

  showInteraction() {
    if (!this.interactionMessage || !this.interactionText) {
      return;
    }

    this.interactionText.textContent = "Rest at Ash Shrine";

    this.interactionMessage.style.display = "flex";
  }

  hideInteraction() {
    if (!this.interactionMessage) {
      return;
    }

    this.interactionMessage.style.display = "none";
  }

  getPosition() {
    return this.group.position;
  }
}
