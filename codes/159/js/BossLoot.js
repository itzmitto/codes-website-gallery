import { getWeapon } from "../data/weapons.js";

export default class BossLoot {
  constructor(player, inventory) {
    this.player = player;
    this.inventory = inventory;

    this.bossSouls = new Map();

    this.recipes = {
      "grave-warden-soul": [
        {
          id: "warden-greatsword",
          name: "Warden Greatsword",
          weaponId: "wardenGreatsword",
          soulCost: 1,
          extraSouls: 600,
        },
      ],

      "bone-king-soul": [
        {
          id: "bone-king-scepter",
          name: "Scepter of the Bone King",
          weaponId: "boneKingScepter",
          soulCost: 1,
          extraSouls: 1000,
        },
      ],

      "abyss-watcher-soul": [
        {
          id: "watcher-twinblade",
          name: "Watcher Twinblade",
          weaponId: "watcherTwinblade",
          soulCost: 1,
          extraSouls: 1600,
        },
      ],

      "devourer-soul": [
        {
          id: "abyssal-greatsword",
          name: "Abyssal Greatsword",
          weaponId: "abyssalGreatsword",
          soulCost: 1,
          extraSouls: 2400,
        },
      ],

      "fallen-god-soul": [
        {
          id: "sunken-kings-blade",
          name: "Blade of the Sunken King",
          weaponId: "sunkenKingsBlade",
          soulCost: 1,
          extraSouls: 5000,
        },
      ],
    };

    this.createUI();
    this.setupEvents();
  }

  createUI() {
    this.overlay = document.createElement("div");

    Object.assign(this.overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "750",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.78)",
      backdropFilter: "blur(8px)",
    });

    this.panel = document.createElement("div");

    Object.assign(this.panel.style, {
      width: "min(820px, calc(100vw - 50px))",
      maxHeight: "82vh",
      overflowY: "auto",
      padding: "30px",
      border: "1px solid rgba(164,55,45,0.4)",
      background: "linear-gradient(145deg,#130c0b,#070606)",
      boxShadow: "0 35px 100px rgba(0,0,0,0.8)",
      color: "#ded3c4",
    });

    this.overlay.appendChild(this.panel);

    document.body.appendChild(this.overlay);
  }

  setupEvents() {
    window.addEventListener("loot:picked", (event) => {
      const item = event.detail;

      if (item.type !== "bossSoul") {
        return;
      }

      this.addBossSoul(item.id || this.slugify(item.name), item.name);
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyB" && !event.repeat) {
        this.toggle();
      }

      if (event.code === "Escape" && this.overlay.style.display === "flex") {
        this.close();
      }
    });
  }

  addBossSoul(id, name, amount = 1) {
    const current = this.bossSouls.get(id) || {
      id,
      name,
      amount: 0,
    };

    current.amount += amount;

    this.bossSouls.set(id, current);

    window.dispatchEvent(
      new CustomEvent("boss-soul:acquired", {
        detail: {
          ...current,
        },
      }),
    );

    this.render();
  }

  removeBossSoul(id, amount = 1) {
    const soul = this.bossSouls.get(id);

    if (!soul || soul.amount < amount) {
      return false;
    }

    soul.amount -= amount;

    if (soul.amount <= 0) {
      this.bossSouls.delete(id);
    } else {
      this.bossSouls.set(id, soul);
    }

    this.render();

    return true;
  }

  consumeSoul(id) {
    const soul = this.bossSouls.get(id);

    if (!soul) {
      return false;
    }

    const values = {
      "grave-warden-soul": 2500,

      "bone-king-soul": 4500,

      "abyss-watcher-soul": 7000,

      "devourer-soul": 11000,

      "fallen-god-soul": 25000,
    };

    const value = values[id] || 2000;

    if (!this.removeBossSoul(id, 1)) {
      return false;
    }

    this.player.addSouls(value);

    window.dispatchEvent(
      new CustomEvent("boss-soul:consumed", {
        detail: {
          id,
          amount: value,
        },
      }),
    );

    return true;
  }

  craft(soulId, recipeId) {
    const recipes = this.recipes[soulId];

    if (!recipes) {
      return false;
    }

    const recipe = recipes.find((item) => item.id === recipeId);

    if (!recipe) {
      return false;
    }

    const bossSoul = this.bossSouls.get(soulId);

    if (!bossSoul || bossSoul.amount < recipe.soulCost) {
      return false;
    }

    if (this.player.souls < recipe.extraSouls) {
      return false;
    }

    const weapon = getWeapon(recipe.weaponId);

    if (!weapon) {
      return false;
    }

    if (this.inventory.items.length >= this.inventory.capacity) {
      window.dispatchEvent(new CustomEvent("inventory:full"));

      return false;
    }

    const removed = this.removeBossSoul(soulId, recipe.soulCost);

    if (!removed) {
      return false;
    }

    const paid = this.player.spendSouls(recipe.extraSouls);

    if (!paid) {
      this.addBossSoul(soulId, bossSoul.name, recipe.soulCost);

      return false;
    }

    this.inventory.addItem(weapon.toInventoryItem());

    window.dispatchEvent(
      new CustomEvent("boss-soul:crafted", {
        detail: {
          soulId,
          recipe,
          weapon,
        },
      }),
    );

    this.render();

    return true;
  }

  open() {
    this.render();

    this.overlay.style.display = "flex";
  }

  close() {
    this.overlay.style.display = "none";
  }

  toggle() {
    if (this.overlay.style.display === "flex") {
      this.close();
    } else {
      this.open();
    }
  }

  render() {
    const entries = Array.from(this.bossSouls.values());

    this.panel.innerHTML = `
      <div style="
        text-align:center;
        margin-bottom:28px;
      ">
        <div style="
          color:#a34539;
          font-size:10px;
          letter-spacing:5px;
          margin-bottom:8px;
        ">
          FORBIDDEN TRANSPOSITION
        </div>

        <div style="
          font-family:Georgia,serif;
          font-size:34px;
          color:#e4d7c6;
        ">
          Boss Souls
        </div>

        <div style="
          margin-top:9px;
          color:#655e56;
          font-size:12px;
        ">
          ${this.player.souls.toLocaleString()} Souls
        </div>
      </div>

      <div
        id="boss-soul-list"
        style="
          display:grid;
          gap:14px;
        "
      ></div>

      <button
        id="boss-soul-close"
        style="
          width:100%;
          margin-top:24px;
          padding:13px;
          border:1px solid rgba(255,255,255,0.08);
          background:#0d0b0a;
          color:#82796d;
          cursor:pointer;
          font-size:10px;
          letter-spacing:3px;
        "
      >
        CLOSE
      </button>
    `;

    const list = this.panel.querySelector("#boss-soul-list");

    if (entries.length === 0) {
      list.innerHTML = `
        <div style="
          padding:40px 20px;
          border:1px solid rgba(255,255,255,0.05);
          color:#514b45;
          text-align:center;
          font-family:Georgia,serif;
          font-size:14px;
        ">
          No boss souls have been claimed.
        </div>
      `;
    }

    for (const soul of entries) {
      this.renderSoul(list, soul);
    }

    this.panel
      .querySelector("#boss-soul-close")
      .addEventListener("click", () => {
        this.close();
      });
  }

  renderSoul(container, soul) {
    const wrapper = document.createElement("div");

    Object.assign(wrapper.style, {
      padding: "18px",
      border: "1px solid rgba(180,55,45,0.16)",
      background: "rgba(255,255,255,0.018)",
    });

    wrapper.innerHTML = `
      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:16px;
        margin-bottom:16px;
      ">
        <div>
          <div style="
            color:#d6c7b7;
            font-family:Georgia,serif;
            font-size:20px;
          ">
            ${soul.name}
          </div>

          <div style="
            margin-top:5px;
            color:#9f3d34;
            font-size:10px;
            letter-spacing:2px;
          ">
            BOSS SOUL ×${soul.amount}
          </div>
        </div>

        <button
          data-consume="${soul.id}"
          style="
            padding:10px 14px;
            border:1px solid rgba(182,138,73,0.35);
            background:#17120d;
            color:#ba955c;
            cursor:pointer;
            font-size:9px;
            letter-spacing:2px;
          "
        >
          CONSUME
        </button>
      </div>

      <div
        data-recipes="${soul.id}"
        style="
          display:grid;
          gap:8px;
        "
      ></div>
    `;

    const recipeContainer = wrapper.querySelector(
      `[data-recipes="${soul.id}"]`,
    );

    const recipes = this.recipes[soul.id] || [];

    if (recipes.length === 0) {
      recipeContainer.innerHTML = `
        <div style="
          color:#524d47;
          font-size:11px;
        ">
          No transposition recipe discovered.
        </div>
      `;
    }

    for (const recipe of recipes) {
      const row = document.createElement("button");

      Object.assign(row.style, {
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: "20px",
        padding: "13px 15px",
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.025)",
        color: "#d0c5b5",
        cursor: "pointer",
        textAlign: "left",
      });

      row.innerHTML = `
        <div>
          <div style="
            font-family:Georgia,serif;
            font-size:15px;
          ">
            ${recipe.name}
          </div>

          <div style="
            margin-top:4px;
            color:#5f5951;
            font-size:9px;
            letter-spacing:1px;
          ">
            ${recipe.soulCost} BOSS SOUL
          </div>
        </div>

        <div style="
          color:#a98451;
          font-size:11px;
        ">
          ${recipe.extraSouls.toLocaleString()}
        </div>
      `;

      row.addEventListener("click", () => {
        this.craft(soul.id, recipe.id);
      });

      recipeContainer.appendChild(row);
    }

    wrapper
      .querySelector(`[data-consume="${soul.id}"]`)
      .addEventListener("click", () => {
        this.consumeSoul(soul.id);

        this.render();
      });

    container.appendChild(wrapper);
  }

  slugify(value) {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  serialize() {
    return Array.from(this.bossSouls.values()).map((soul) => ({
      ...soul,
    }));
  }

  load(data) {
    this.bossSouls.clear();

    if (!Array.isArray(data)) {
      return;
    }

    for (const soul of data) {
      if (!soul?.id) {
        continue;
      }

      this.bossSouls.set(soul.id, {
        id: soul.id,
        name: soul.name || soul.id,
        amount: Math.max(0, soul.amount || 0),
      });
    }

    this.render();
  }
}
