export default class Inventory {
  constructor(player) {
    this.player = player;

    this.capacity = 24;

    this.items = [];

    this.equippedWeapon = null;
    this.equippedArmor = null;

    this.isOpen = false;

    this.createUI();
    this.setupEvents();
    this.render();
  }

  createUI() {
    this.overlay = document.createElement("div");
    this.overlay.id = "inventory-overlay";

    Object.assign(this.overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "500",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0, 0, 0, 0.72)",
      backdropFilter: "blur(8px)",
    });

    this.panel = document.createElement("div");

    Object.assign(this.panel.style, {
      width: "min(900px, calc(100vw - 60px))",
      maxHeight: "80vh",
      overflow: "hidden",
      border: "1px solid rgba(170, 140, 95, 0.35)",
      background: "linear-gradient(145deg, #11100e, #080808)",
      boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7)",
      color: "#ddd3c3",
    });

    const header = document.createElement("div");

    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 24px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    });

    const title = document.createElement("div");

    title.innerHTML = `
      <div style="
        color:#8c7654;
        font-size:10px;
        letter-spacing:4px;
        margin-bottom:5px;
      ">
        ASHEN DEPTHS
      </div>

      <div style="
        font-family:Georgia,serif;
        font-size:26px;
        letter-spacing:2px;
      ">
        Inventory
      </div>
    `;

    this.capacityText = document.createElement("div");

    Object.assign(this.capacityText.style, {
      color: "#6d675e",
      fontSize: "12px",
      letterSpacing: "1px",
    });

    header.appendChild(title);
    header.appendChild(this.capacityText);

    const content = document.createElement("div");

    Object.assign(content.style, {
      display: "grid",
      gridTemplateColumns: "1fr 260px",
      minHeight: "460px",
    });

    this.grid = document.createElement("div");

    Object.assign(this.grid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: "10px",
      padding: "20px",
      overflowY: "auto",
    });

    this.details = document.createElement("div");

    Object.assign(this.details.style, {
      padding: "24px",
      borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(255, 255, 255, 0.015)",
    });

    content.appendChild(this.grid);

    content.appendChild(this.details);

    this.panel.appendChild(header);

    this.panel.appendChild(content);

    this.overlay.appendChild(this.panel);

    document.body.appendChild(this.overlay);
  }

  setupEvents() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "Tab") {
        event.preventDefault();
        this.toggle();
      }

      if (event.code === "Escape" && this.isOpen) {
        this.close();
      }
    });

    window.addEventListener("loot:weapon", (event) => {
      this.addItem({
        id: crypto.randomUUID(),
        type: "weapon",
        name: event.detail.name,
        rarity: event.detail.rarity,
        damage: event.detail.damage,
      });
    });

    window.addEventListener("loot:armor", (event) => {
      this.addItem({
        id: crypto.randomUUID(),
        type: "armor",
        name: event.detail.name,
        rarity: event.detail.rarity,
        defense: event.detail.defense,
      });
    });
  }

  addItem(item) {
    if (this.items.length >= this.capacity) {
      window.dispatchEvent(new CustomEvent("inventory:full"));

      return false;
    }

    const normalizedItem = {
      id: item.id || crypto.randomUUID(),

      name: item.name || "Unknown Item",

      type: item.type || "item",

      rarity: item.rarity || "common",

      damage: item.damage || 0,

      defense: item.defense || 0,

      heal: item.heal || 0,

      amount: item.amount || 1,

      description: item.description || "",
    };

    this.items.push(normalizedItem);

    this.render();

    window.dispatchEvent(
      new CustomEvent("inventory:item-added", {
        detail: normalizedItem,
      }),
    );

    return true;
  }

  removeItem(id) {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    const [removed] = this.items.splice(index, 1);

    if (this.equippedWeapon?.id === removed.id) {
      this.equippedWeapon = null;
    }

    if (this.equippedArmor?.id === removed.id) {
      this.equippedArmor = null;
    }

    this.render();

    return true;
  }

  equip(item) {
    if (item.type === "weapon") {
      this.equippedWeapon = item;

      window.dispatchEvent(
        new CustomEvent("inventory:weapon-equipped", {
          detail: item,
        }),
      );
    }

    if (item.type === "armor") {
      this.equippedArmor = item;

      window.dispatchEvent(
        new CustomEvent("inventory:armor-equipped", {
          detail: item,
        }),
      );
    }

    this.render();
    this.showDetails(item);
  }

  useItem(item) {
    if (item.type === "consumable") {
      if (item.heal > 0) {
        this.player.heal(item.heal);
      }

      if (item.amount > 1) {
        item.amount -= 1;
      } else {
        this.removeItem(item.id);
      }

      this.render();
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;

    this.overlay.style.display = "flex";

    this.render();
  }

  close() {
    this.isOpen = false;

    this.overlay.style.display = "none";
  }

  render() {
    this.grid.innerHTML = "";

    this.capacityText.textContent = `${this.items.length} / ${this.capacity}`;

    for (let i = 0; i < this.capacity; i++) {
      const slot = document.createElement("button");

      Object.assign(slot.style, {
        minHeight: "100px",
        position: "relative",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        background: "rgba(255, 255, 255, 0.025)",
        color: "#ddd3c3",
        cursor: this.items[i] ? "pointer" : "default",
        padding: "12px",
        textAlign: "left",
        transition: "0.15s ease",
      });

      const item = this.items[i];

      if (!item) {
        slot.innerHTML = `
          <div style="
            height:100%;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#302e2b;
            font-size:18px;
          ">
            ◇
          </div>
        `;

        this.grid.appendChild(slot);

        continue;
      }

      const color = this.getRarityColor(item.rarity);

      slot.style.borderColor = `${color}55`;

      slot.innerHTML = `
        <div style="
          width:34px;
          height:34px;
          display:grid;
          place-items:center;
          margin-bottom:10px;
          border:1px solid ${color}66;
          color:${color};
          font-size:18px;
        ">
          ${this.getItemIcon(item)}
        </div>

        <div style="
          color:#e1d7c6;
          font-size:12px;
          line-height:1.3;
          margin-bottom:5px;
        ">
          ${item.name}
        </div>

        <div style="
          color:${color};
          font-size:9px;
          text-transform:uppercase;
          letter-spacing:1px;
        ">
          ${item.rarity}
        </div>

        ${
          item.amount > 1
            ? `
              <div style="
                position:absolute;
                right:8px;
                bottom:7px;
                color:#8f887d;
                font-size:10px;
              ">
                x${item.amount}
              </div>
            `
            : ""
        }
      `;

      slot.addEventListener("mouseenter", () => {
        slot.style.background = "rgba(255, 255, 255, 0.06)";
      });

      slot.addEventListener("mouseleave", () => {
        slot.style.background = "rgba(255, 255, 255, 0.025)";
      });

      slot.addEventListener("click", () => {
        this.showDetails(item);
      });

      this.grid.appendChild(slot);
    }

    this.renderDefaultDetails();
  }

  renderDefaultDetails() {
    const weaponName = this.equippedWeapon ? this.equippedWeapon.name : "None";

    const armorName = this.equippedArmor ? this.equippedArmor.name : "None";

    this.details.innerHTML = `
      <div style="
        color:#85735a;
        font-size:10px;
        letter-spacing:3px;
        margin-bottom:20px;
      ">
        EQUIPMENT
      </div>

      <div style="
        margin-bottom:20px;
      ">
        <div style="
          color:#5f5a52;
          font-size:10px;
          margin-bottom:6px;
        ">
          WEAPON
        </div>

        <div style="
          color:#d8cdbd;
          font-size:14px;
        ">
          ${weaponName}
        </div>
      </div>

      <div>
        <div style="
          color:#5f5a52;
          font-size:10px;
          margin-bottom:6px;
        ">
          ARMOR
        </div>

        <div style="
          color:#d8cdbd;
          font-size:14px;
        ">
          ${armorName}
        </div>
      </div>
    `;
  }

  showDetails(item) {
    const color = this.getRarityColor(item.rarity);

    let stats = "";

    if (item.type === "weapon") {
      stats = `
        <div style="
          margin-top:22px;
          display:flex;
          justify-content:space-between;
          color:#8a8379;
          font-size:12px;
        ">
          <span>Damage</span>
          <strong style="color:#ddd3c3;">
            ${item.damage}
          </strong>
        </div>
      `;
    }

    if (item.type === "armor") {
      stats = `
        <div style="
          margin-top:22px;
          display:flex;
          justify-content:space-between;
          color:#8a8379;
          font-size:12px;
        ">
          <span>Defense</span>
          <strong style="color:#ddd3c3;">
            ${item.defense}
          </strong>
        </div>
      `;
    }

    if (item.type === "consumable") {
      stats = `
        <div style="
          margin-top:22px;
          display:flex;
          justify-content:space-between;
          color:#8a8379;
          font-size:12px;
        ">
          <span>Healing</span>
          <strong style="color:#ddd3c3;">
            ${item.heal}
          </strong>
        </div>
      `;
    }

    let buttonText = "USE";

    if (item.type === "weapon" || item.type === "armor") {
      buttonText = "EQUIP";
    }

    this.details.innerHTML = `
      <div style="
        color:${color};
        font-size:10px;
        letter-spacing:3px;
        text-transform:uppercase;
        margin-bottom:9px;
      ">
        ${item.rarity}
      </div>

      <div style="
        font-family:Georgia,serif;
        font-size:24px;
        line-height:1.2;
        color:#e3d9c8;
      ">
        ${item.name}
      </div>

      ${
        item.description
          ? `
            <div style="
              margin-top:16px;
              color:#726d65;
              font-family:Georgia,serif;
              font-size:13px;
              line-height:1.6;
            ">
              ${item.description}
            </div>
          `
          : ""
      }

      ${stats}

      <button
        id="inventory-action"
        style="
          width:100%;
          margin-top:28px;
          padding:12px;
          border:1px solid ${color}66;
          background:${color}14;
          color:${color};
          cursor:pointer;
          font-size:10px;
          font-weight:700;
          letter-spacing:2px;
        "
      >
        ${buttonText}
      </button>
    `;

    const button = this.details.querySelector("#inventory-action");

    button.addEventListener("click", () => {
      if (item.type === "weapon" || item.type === "armor") {
        this.equip(item);

        return;
      }

      this.useItem(item);
    });
  }

  getItemIcon(item) {
    if (item.type === "weapon") {
      return "†";
    }

    if (item.type === "armor") {
      return "⬡";
    }

    if (item.type === "consumable") {
      return "◉";
    }

    return "◆";
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

    return "#c8c8c8";
  }
}
