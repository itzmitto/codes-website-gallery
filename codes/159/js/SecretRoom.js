import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export default class SecretRoom {
  constructor(scene, player, options = {}) {
    this.scene = scene;
    this.player = player;

    this.position = new THREE.Vector3(
      options.x || 0,
      options.y || 0,
      options.z || 0,
    );

    this.rotation = options.rotation || 0;

    this.width = options.width || 4;

    this.height = options.height || 4;

    this.depth = options.depth || 0.7;

    this.discoveryRange = options.discoveryRange || 1.8;

    this.revealDistance = options.revealDistance || 1.35;

    this.opened = false;
    this.discovered = false;
    this.revealing = false;

    this.group = new THREE.Group();

    this.group.position.copy(this.position);

    this.group.rotation.y = this.rotation;

    this.interactionMessage = document.getElementById("interaction-message");

    this.interactionText = document.getElementById("interaction-text");

    this.createWall();
    this.createSecretInterior();
    this.setupControls();

    this.scene.add(this.group);
  }

  createWall() {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x1b1917,
      roughness: 0.95,
      metalness: 0.03,
      transparent: true,
      opacity: 1,
    });

    this.wall = new THREE.Mesh(
      new THREE.BoxGeometry(this.width, this.height, this.depth),
      wallMaterial,
    );

    this.wall.position.y = this.height / 2;

    this.wall.castShadow = true;
    this.wall.receiveShadow = true;

    this.group.add(this.wall);

    const crackMaterial = new THREE.MeshBasicMaterial({
      color: 0x3f3224,
      transparent: true,
      opacity: 0.18,
    });

    this.crack = new THREE.Mesh(
      new THREE.PlaneGeometry(this.width * 0.6, this.height * 0.7),
      crackMaterial,
    );

    this.crack.position.set(0, this.height * 0.52, -this.depth / 2 - 0.01);

    this.group.add(this.crack);
  }

  createSecretInterior() {
    this.secretGroup = new THREE.Group();

    this.secretGroup.position.set(0, 0, -4);

    this.secretGroup.visible = false;

    this.group.add(this.secretGroup);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x26211d,
      roughness: 0.95,
    });

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.2, 7),
      floorMaterial,
    );

    floor.position.set(0, -0.1, -1.8);

    floor.receiveShadow = true;

    this.secretGroup.add(floor);

    const sideWallMaterial = new THREE.MeshStandardMaterial({
      color: 0x171513,
      roughness: 0.95,
    });

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 4, 7),
      sideWallMaterial,
    );

    leftWall.position.set(-3.5, 2, -1.8);

    leftWall.castShadow = true;
    leftWall.receiveShadow = true;

    this.secretGroup.add(leftWall);

    const rightWall = leftWall.clone();

    rightWall.position.x = 3.5;

    this.secretGroup.add(rightWall);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(7, 4, 0.5),
      sideWallMaterial,
    );

    backWall.position.set(0, 2, -5.3);

    backWall.castShadow = true;
    backWall.receiveShadow = true;

    this.secretGroup.add(backWall);

    const altarMaterial = new THREE.MeshStandardMaterial({
      color: 0x30281f,
      roughness: 0.7,
      metalness: 0.1,
    });

    const altar = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.8, 1.2),
      altarMaterial,
    );

    altar.position.set(0, 0.4, -4.3);

    altar.castShadow = true;

    this.secretGroup.add(altar);

    const relicMaterial = new THREE.MeshStandardMaterial({
      color: 0x6546a8,
      emissive: 0x2d165d,
      emissiveIntensity: 3,
      roughness: 0.2,
      metalness: 0.25,
    });

    this.relic = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45),
      relicMaterial,
    );

    this.relic.position.set(0, 1.3, -4.3);

    this.secretGroup.add(this.relic);

    this.relicLight = new THREE.PointLight(0x744cff, 4, 8);

    this.relicLight.position.set(0, 1.8, -4.3);

    this.secretGroup.add(this.relicLight);
  }

  setupControls() {
    window.addEventListener("keydown", (event) => {
      if (event.code !== "KeyF") {
        return;
      }

      if (event.repeat) {
        return;
      }

      if (this.opened || this.revealing) {
        return;
      }

      const distance = this.getDistanceToPlayer();

      if (distance <= this.revealDistance) {
        this.reveal();
      }
    });
  }

  update(time) {
    if (this.opened) {
      this.updateRelic(time);

      return;
    }

    const distance = this.getDistanceToPlayer();

    this.discovered = distance <= this.discoveryRange;

    if (this.discovered && !this.revealing) {
      this.showInteraction();
      this.highlightWall(time);
    } else {
      this.hideInteraction();
      this.resetWallHighlight();
    }
  }

  getDistanceToPlayer() {
    const worldPosition = new THREE.Vector3();

    this.group.getWorldPosition(worldPosition);

    return this.player.group.position.distanceTo(worldPosition);
  }

  showInteraction() {
    if (!this.interactionMessage || !this.interactionText) {
      return;
    }

    this.interactionText.textContent = "Inspect strange wall";

    this.interactionMessage.style.display = "flex";
  }

  hideInteraction() {
    if (!this.interactionMessage) {
      return;
    }

    this.interactionMessage.style.display = "none";
  }

  highlightWall(time) {
    this.crack.material.opacity = 0.18 + Math.sin(time * 4) * 0.08;

    this.wall.material.color.setHex(0x211d19);
  }

  resetWallHighlight() {
    this.crack.material.opacity = 0.18;

    this.wall.material.color.setHex(0x1b1917);
  }

  reveal() {
    if (this.opened || this.revealing) {
      return;
    }

    this.revealing = true;

    this.hideInteraction();

    this.secretGroup.visible = true;

    const startTime = performance.now();

    const duration = 1100;

    const startY = this.wall.position.y;

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      this.wall.position.y = startY + eased * (this.height + 0.5);

      this.wall.material.opacity = 1 - eased * 0.75;

      this.crack.material.opacity = 1 - eased;

      if (progress < 1) {
        requestAnimationFrame(animate);

        return;
      }

      this.wall.visible = false;

      this.crack.visible = false;

      this.revealing = false;

      this.opened = true;

      window.dispatchEvent(
        new CustomEvent("secret-room:opened", {
          detail: {
            position: this.group.position.clone(),
          },
        }),
      );
    };

    requestAnimationFrame(animate);
  }

  updateRelic(time) {
    if (!this.relic) {
      return;
    }

    this.relic.rotation.x += 0.005;

    this.relic.rotation.y += 0.012;

    this.relic.position.y = 1.3 + Math.sin(time * 2.2) * 0.12;

    this.relicLight.intensity = 3.8 + Math.sin(time * 4) * 0.5;
  }

  openInstantly() {
    this.secretGroup.visible = true;

    this.wall.visible = false;

    this.crack.visible = false;

    this.opened = true;
    this.revealing = false;
  }

  serialize() {
    return {
      opened: this.opened,
    };
  }

  load(data) {
    if (data?.opened) {
      this.openInstantly();
    }
  }

  getPosition() {
    return this.group.position;
  }
}
