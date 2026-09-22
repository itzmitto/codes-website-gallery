import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import Player from "./Player.js";
import Combat from "./Combat.js";
import Inventory from "./Inventory.js";
import LevelSystem from "./LevelSystem.js";
import SoulsSystem from "./SoulsSystem.js";
import Dungeon from "./Dungeon.js";
import SaveSystem from "./SaveSystem.js";
import UI from "./UI.js";

export default class Game {
  constructor(options = {}) {
    this.container =
      options.container || document.getElementById("game-container");

    this.startScreen = document.getElementById("start-screen");

    this.startButton = document.getElementById("start-button");

    this.deathScreen = document.getElementById("death-screen");

    this.running = false;
    this.started = false;
    this.playerDead = false;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      350,
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    this.clock = new THREE.Clock();

    this.scene.background = new THREE.Color(0x050505);

    this.scene.fog = new THREE.FogExp2(0x050505, 0.025);

    this.camera.position.set(0, 11, 13);

    this.camera.lookAt(0, 0, 0);

    this.setupRenderer();
    this.setupLighting();
    this.setupSystems();
    this.setupEvents();

    this.animate = this.animate.bind(this);
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.shadowMap.enabled = true;

    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure = 0.88;

    this.container.innerHTML = "";

    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0x252537, 0.55);

    this.scene.add(ambient);

    const moon = new THREE.DirectionalLight(0x8295dc, 1.2);

    moon.position.set(-12, 18, 10);

    moon.castShadow = true;

    moon.shadow.mapSize.set(2048, 2048);

    moon.shadow.camera.left = -40;

    moon.shadow.camera.right = 40;

    moon.shadow.camera.top = 40;

    moon.shadow.camera.bottom = -40;

    this.scene.add(moon);

    this.ambientLight = ambient;

    this.moonLight = moon;
  }

  setupSystems() {
    this.player = new Player(this.scene, this.camera);

    this.combat = new Combat(this.player);

    this.inventory = new Inventory(this.player);

    this.levelSystem = new LevelSystem(this.player);

    this.soulsSystem = new SoulsSystem(this.scene, this.player);

    this.dungeon = new Dungeon(this.scene, this.player, this.combat, {
      floor: 1,
      maxFloor: 10,
    });

    this.saveSystem = new SaveSystem(
      this.player,
      this.levelSystem,
      this.dungeon,
      this.soulsSystem,
    );

    this.ui = new UI(
      this.player,
      this.dungeon,
      this.inventory,
      this.saveSystem,
    );
  }

  setupEvents() {
    this.startButton?.addEventListener("click", () => {
      this.start();
    });

    window.addEventListener("resize", () => {
      this.resize();
    });

    window.addEventListener("shrine:rest", () => {
      this.saveSystem.save();
    });

    window.addEventListener("boss:defeated", () => {
      this.saveSystem.save();
    });

    window.addEventListener("dungeon:floor-complete", () => {
      this.saveSystem.save();
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyL" && !event.repeat) {
        this.saveSystem.load();
      }

      if (event.code === "KeyN" && !event.repeat) {
        this.newGame();
      }
    });
  }

  start() {
    if (this.started) {
      return;
    }

    this.started = true;

    this.startScreen?.classList.add("hidden");

    if (this.saveSystem.hasSave()) {
      this.saveSystem.load();
    }

    if (!this.running) {
      this.running = true;

      this.clock.start();

      requestAnimationFrame(this.animate);
    }
  }

  newGame() {
    this.saveSystem.deleteSave();

    this.player.health = 100;

    this.player.maxHealth = 100;

    this.player.stamina = 100;

    this.player.maxStamina = 100;

    this.player.souls = 0;

    this.player.setLevel(1);

    this.levelSystem.reset();

    this.dungeon.generateFloor(1);

    this.player.updateUI();

    this.saveSystem.save();
  }

  update(delta, time) {
    if (!this.started) {
      return;
    }

    if (this.player.isDead()) {
      this.handleDeath();

      return;
    }

    this.player.update(delta);

    this.combat.update(delta);

    this.dungeon.update(delta, time);

    this.soulsSystem.update(time);
  }

  handleDeath() {
    if (this.playerDead) {
      return;
    }

    this.playerDead = true;

    this.soulsSystem.handleDeath();

    this.deathScreen?.classList.remove("hidden");

    setTimeout(() => {
      this.respawn();
    }, 2000);
  }

  respawn() {
    this.player.health = this.player.maxHealth;

    this.player.stamina = this.player.maxStamina;

    const startRoom = this.dungeon.startRoom;

    if (startRoom) {
      const position = startRoom.getCenter();

      this.player.group.position.set(position.x, 0, position.z);
    } else {
      this.player.group.position.set(0, 0, 0);
    }

    this.player.updateUI();

    this.deathScreen?.classList.add("hidden");

    this.playerDead = false;
  }

  animate() {
    if (!this.running) {
      return;
    }

    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.05);

    const time = this.clock.elapsedTime;

    this.update(delta, time);

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  pause() {
    this.running = false;
  }

  resume() {
    if (this.running) {
      return;
    }

    this.running = true;

    this.clock.start();

    requestAnimationFrame(this.animate);
  }
}
