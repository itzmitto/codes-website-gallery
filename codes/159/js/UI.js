export default class UI {
  constructor(player, dungeon, inventory, saveSystem) {
    this.player = player;
    this.dungeon = dungeon;
    this.inventory = inventory;
    this.saveSystem = saveSystem;

    this.floorNumber = document.getElementById("floor-number");

    this.interactionMessage = document.getElementById("interaction-message");

    this.interactionText = document.getElementById("interaction-text");

    this.notificationContainer = null;

    this.floorCompleteVisible = false;

    this.createNotificationContainer();
    this.createFloorCompleteUI();
    this.setupEvents();
    this.updateFloor();
  }

  createNotificationContainer() {
    this.notificationContainer = document.createElement("div");

    Object.assign(this.notificationContainer.style, {
      position: "fixed",
      top: "90px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "900",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      pointerEvents: "none",
    });

    document.body.appendChild(this.notificationContainer);
  }

  createFloorCompleteUI() {
    this.floorOverlay = document.createElement("div");

    Object.assign(this.floorOverlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "850",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(8px)",
    });

    this.floorPanel = document.createElement("div");

    Object.assign(this.floorPanel.style, {
      width: "min(600px, calc(100vw - 50px))",
      padding: "34px",
      textAlign: "center",
      border: "1px solid rgba(176,132,76,0.35)",
      background: "linear-gradient(145deg,#14110d,#080706)",
      boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
      color: "#ddd3c1",
    });

    this.floorOverlay.appendChild(this.floorPanel);

    document.body.appendChild(this.floorOverlay);
  }

  setupEvents() {
    window.addEventListener("dungeon:generated", () => {
      this.updateFloor();
    });

    window.addEventListener("dungeon:room-change", (event) => {
      const room = event.detail.room;

      if (!room) {
        return;
      }

      this.showRoomName(room);
    });

    window.addEventListener("room:cleared", (event) => {
      this.showNotification(
        `${this.getRoomLabel(event.detail.type)} Cleared`,
        "#c79d5b",
      );
    });

    window.addEventListener("loot:picked", (event) => {
      const item = event.detail;

      this.showNotification(
        item.name || "Loot acquired",
        this.getRarityColor(item.rarity),
      );
    });

    window.addEventListener("inventory:full", () => {
      this.showNotification("Inventory Full", "#d84d44");
    });

    window.addEventListener("inventory:weapon-equipped", (event) => {
      this.showNotification(
        `${event.detail.name} Equipped`,
        this.getRarityColor(event.detail.rarity),
      );
    });

    window.addEventListener("inventory:armor-equipped", (event) => {
      this.showNotification(
        `${event.detail.name} Equipped`,
        this.getRarityColor(event.detail.rarity),
      );
    });

    window.addEventListener("player:level-up", (event) => {
      this.showNotification(`Level ${event.detail.level}`, "#d4a65e");
    });

    window.addEventListener("souls:recovered", () => {
      this.showNotification("Souls Recovered", "#e3bd58");
    });

    window.addEventListener("souls:lost", () => {
      this.showNotification("Lost Souls Destroyed", "#a72c2c");
    });

    window.addEventListener("secret-room:opened", () => {
      this.showNotification("Secret Room Discovered", "#9a63e8", 2200);
    });

    window.addEventListener("boss:start", (event) => {
      this.showBossIntro(event.detail.boss);
    });

    window.addEventListener("boss:phase", (event) => {
      this.showNotification(`Phase ${event.detail.phase}`, "#d8462d");
    });

    window.addEventListener("boss:defeated", (event) => {
      this.showNotification(`${event.detail.name} Defeated`, "#e0b263", 2600);
    });

    window.addEventListener("dungeon:floor-complete", (event) => {
      this.showFloorComplete(event.detail.floor);
    });

    window.addEventListener("dungeon:complete", () => {
      this.showGameComplete();
    });

    window.addEventListener("save:complete", () => {
      this.showNotification("Game Saved", "#8ab78d");
    });

    window.addEventListener("save:loaded", () => {
      this.showNotification("Save Loaded", "#8aa9d4");
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyP" && !event.repeat) {
        this.saveSystem.save();
      }
    });
  }

  showNotification(text, color = "#d4c6b0", duration = 1500) {
    const notification = document.createElement("div");

    Object.assign(notification.style, {
      minWidth: "220px",
      maxWidth: "420px",
      padding: "12px 20px",
      border: `1px solid ${color}55`,
      background: "rgba(9,9,9,0.92)",
      color,
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "1.5px",
      textAlign: "center",
      boxShadow: "0 12px 35px rgba(0,0,0,0.5)",
      opacity: "0",
      transform: "translateY(-10px)",
      transition: "0.2s ease",
    });

    notification.textContent = text;

    this.notificationContainer.appendChild(notification);

    requestAnimationFrame(() => {
      notification.style.opacity = "1";

      notification.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      notification.style.opacity = "0";

      notification.style.transform = "translateY(-10px)";

      setTimeout(() => {
        notification.remove();
      }, 220);
    }, duration);
  }

  showRoomName(room) {
    const label = this.getRoomLabel(room.type);

    if (!label) {
      return;
    }

    this.showNotification(
      label,
      room.type === "boss"
        ? "#cf3b2d"
        : room.type === "secret"
          ? "#955de0"
          : "#b99b71",
      1200,
    );
  }

  showBossIntro(boss) {
    const overlay = document.createElement("div");

    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "800",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.35)",
      pointerEvents: "none",
      opacity: "0",
      transition: "0.3s ease",
    });

    const title = document.createElement("div");

    Object.assign(title.style, {
      fontFamily: "Georgia, serif",
      fontSize: "clamp(36px,6vw,72px)",
      color: "#d8cec0",
      letterSpacing: "6px",
      textAlign: "center",
      textShadow: "0 8px 30px #000",
      transform: "scale(0.94)",
      transition: "0.4s ease",
    });

    title.textContent = boss.name;

    overlay.appendChild(title);

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";

      title.style.transform = "scale(1)";
    });

    setTimeout(() => {
      overlay.style.opacity = "0";

      title.style.transform = "scale(1.04)";

      setTimeout(() => {
        overlay.remove();
      }, 350);
    }, 1700);
  }

  showFloorComplete(floor) {
    this.floorCompleteVisible = true;

    this.floorPanel.innerHTML = `
      <div style="
        color:#92734a;
        font-size:10px;
        letter-spacing:5px;
        margin-bottom:10px;
      ">
        FLOOR ${floor} CLEARED
      </div>

      <div style="
        font-family:Georgia,serif;
        font-size:38px;
        color:#e3d7c4;
        margin-bottom:16px;
      ">
        The path descends deeper
      </div>

      <div style="
        color:#756e64;
        font-size:13px;
        line-height:1.7;
        margin-bottom:28px;
      ">
        The guardian has fallen. Continue into the depths when you are ready.
      </div>

      <button
        id="next-floor-button"
        style="
          width:100%;
          padding:14px;
          border:1px solid rgba(181,137,77,0.55);
          background:#a4773f;
          color:#080705;
          cursor:pointer;
          font-size:11px;
          font-weight:700;
          letter-spacing:3px;
        "
      >
        DESCEND TO FLOOR ${floor + 1}
      </button>
    `;

    this.floorOverlay.style.display = "flex";

    const button = this.floorPanel.querySelector("#next-floor-button");

    button.addEventListener("click", () => {
      const changed = this.dungeon.nextFloor();

      if (changed) {
        this.floorOverlay.style.display = "none";

        this.floorCompleteVisible = false;

        this.updateFloor();

        this.saveSystem.save();
      }
    });
  }

  showGameComplete() {
    this.floorPanel.innerHTML = `
      <div style="
        color:#b08a56;
        font-size:10px;
        letter-spacing:6px;
        margin-bottom:12px;
      ">
        ASHEN DEPTHS
      </div>

      <div style="
        font-family:Georgia,serif;
        font-size:42px;
        color:#e5d9c7;
        margin-bottom:18px;
      ">
        The Depths Are Silent
      </div>

      <div style="
        color:#7a7369;
        font-size:13px;
        line-height:1.8;
      ">
        The final guardian has fallen.
        You survived the descent.
      </div>
    `;

    this.floorOverlay.style.display = "flex";
  }

  updateFloor() {
    if (this.floorNumber) {
      this.floorNumber.textContent = this.dungeon.getFloor();
    }
  }

  getRoomLabel(type) {
    const labels = {
      start: "Ashen Entrance",

      combat: "Forsaken Chamber",

      treasure: "Treasure Chamber",

      elite: "Guardian Chamber",

      secret: "Hidden Chamber",

      boss: "Guardian Arena",

      shrine: "Ash Shrine",
    };

    return labels[type] || null;
  }

  getRarityColor(rarity) {
    if (rarity === "uncommon") {
      return "#4fd46d";
    }

    if (rarity === "rare") {
      return "#4b8cff";
    }

    if (rarity === "epic") {
      return "#a548ff";
    }

    if (rarity === "legendary") {
      return "#ff9f1c";
    }

    if (rarity === "boss") {
      return "#ff3434";
    }

    return "#d0c8bd";
  }
}
