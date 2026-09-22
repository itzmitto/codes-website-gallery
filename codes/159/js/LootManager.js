import Loot from "./Loot.js";
import { getWeapon } from "../data/weapons.js";
import { rollLoot, rollMultipleLoot } from "../data/loot.js";

export default class LootManager {
  constructor(
    scene,
    player,
    inventory
  ) {
    this.scene = scene;
    this.player = player;
    this.inventory = inventory;

    this.activeLoot = [];
  }

  spawnLoot(
    item,
    position
  ) {
    if (!item) {
      return null;
    }

    if (
      item.type ===
      "weapon"
    ) {
      return this.spawnWeapon(
        item,
        position
      );
    }

    if (
      item.type ===
      "souls"
    ) {
      return this.spawnSouls(
        item,
        position
      );
    }

    if (
      item.type ===
      "consumable"
    ) {
      return this.spawnConsumable(
        item,
        position
      );
    }

    if (
      item.type ===
      "armor"
    ) {
      return this.spawnArmor(
        item,
        position
      );
    }

    if (
      item.type ===
      "relic"
    ) {
      return this.spawnRelic(
        item,
        position
      );
    }

    if (
      item.type ===
      "bossSoul"
    ) {
      return this.spawnBossSoul(
        item,
        position
      );
    }

    return null;
  }

  spawnWeapon(
    item,
    position
  ) {
    const weapon =
      getWeapon(
        item.weaponId
      );

    if (!weapon) {
      return null;
    }

    const loot =
      new Loot(
        this.scene,
        this.player,
        {
          name:
            weapon.name,

          type:
            "weapon",

          rarity:
            weapon.rarity,

          damage:
            weapon.damage,

          x:
            position.x,

          y:
            position.y ?? 0.7,

          z:
            position.z
        }
      );

    loot.weapon =
      weapon;

    this.activeLoot.push(
      loot
    );

    return loot;
  }

  spawnSouls(
    item,
    position
  ) {
    const loot =
      new Loot(
        this.scene,
        this.player,
        {
          name:
            `${item.amount || 0} Souls`,

          type:
            "souls",

          rarity:
            item.rarity ||
            "common",

          amount:
            item.amount ||
            0,

          x:
            position.x,

          y:
            position.y ?? 0.7,

          z:
            position.z
        }
      );

    this.activeLoot.push(
      loot
    );

    return loot;
  }

  spawnConsumable(
    item,
    position
  ) {
    const loot =
      new Loot(
        this.scene,
        this.player,
        {
          name:
            item.name ||
            "Consumable",

          type:
            "heal",

          rarity:
            item.rarity ||
            "common",

          amount:
            item.heal ||
            item.amount ||
            25,

          x:
            position.x,

          y:
            position.y ?? 0.7,

          z:
            position.z
        }
      );

    this.activeLoot.push(
      loot
    );

    return loot;
  }

  spawnArmor(
    item,
    position
  ) {
    const loot =
      new Loot(
        this.scene,
        this.player,
        {
          name:
            item.name ||
            "Unknown Armor",

          type:
            "armor",

          rarity:
            item.rarity ||
            "common",

          defense:
            item.defense ||
            0,

          x:
            position.x,

          y:
            position.y ?? 0.7,

          z:
            position.z
        }
      );

    this.activeLoot.push(
      loot
    );

    return loot;
  }

  spawnRelic(
    item,
    position
  ) {
    const loot =
      new Loot(
        this.scene,
        this.player,
        {
          name:
            item.name ||
            "Ancient Relic",

          type:
            "relic",

          rarity:
            item.rarity ||
            "legendary",

          x:
            position.x,

          y:
            position.y ?? 0.8,

          z:
            position.z
        }
      );

    this.activeLoot.push(
      loot
    );

    return loot;
  }

  spawnBossSoul(
    item,
    position
  ) {
    const loot =
      new Loot(
        this.scene,
        this.player,
        {
          name:
            item.name ||
            "Boss Soul",

          type:
            "bossSoul",

          rarity:
            "boss",

          x:
            position.x,

          y:
            position.y ?? 0.9,

          z:
            position.z
        }
      );

    this.activeLoot.push(
      loot
    );

    return loot;
  }

  spawnFromTable(
    tableName,
    position
  ) {
    const item =
      rollLoot(
        tableName
      );

    if (!item) {
      return null;
    }

    return this.spawnLoot(
      item,
      position
    );
  }

  spawnMultipleFromTable(
    tableName,
    amount,
    position
  ) {
    const items =
      rollMultipleLoot(
        tableName,
        amount
      );

    const spawned = [];

    items.forEach(
      (item, index) => {
        const angle =
          (
            Math.PI *
            2 *
            index
          ) /
          Math.max(
            items.length,
            1
          );

        const distance =
          0.6 +
          Math.random() *
            0.5;

        const dropPosition = {
          x:
            position.x +
            Math.cos(angle) *
              distance,

          y:
            position.y ??
            0.7,

          z:
            position.z +
            Math.sin(angle) *
              distance
        };

        const loot =
          this.spawnLoot(
            item,
            dropPosition
          );

        if (loot) {
          spawned.push(
            loot
          );
        }
      }
    );

    return spawned;
  }

  spawnEnemyLoot(
    enemy
  ) {
    if (!enemy) {
      return;
    }

    const position = {
      x:
        enemy.group.position.x,

      y:
        0.7,

      z:
        enemy.group.position.z
    };

    if (
      enemy.elite
    ) {
      this.spawnMultipleFromTable(
        "eliteEnemy",
        2,
        position
      );

      return;
    }

    const soulAmount =
      Math.max(
        10,
        Math.round(
          enemy.soulsReward *
          0.35
        )
      );

    this.spawnSouls(
      {
        amount:
          soulAmount,
        rarity:
          "common"
      },
      position
    );
  }

  spawnBossLoot(
    bossData,
    position
  ) {
    if (
      !bossData?.loot
    ) {
      return;
    }

    const successfulDrops =
      bossData.loot.filter(
        (item) =>
          Math.random() <=
          (item.chance ?? 1)
      );

    successfulDrops.forEach(
      (item, index) => {
        const angle =
          (
            Math.PI *
            2 *
            index
          ) /
          Math.max(
            successfulDrops.length,
            1
          );

        this.spawnLoot(
          item,
          {
            x:
              position.x +
              Math.cos(angle) *
                1.1,

            y:
              0.8,

            z:
              position.z +
              Math.sin(angle) *
                1.1
          }
        );
      }
    );
  }

  update(time) {
    for (
      const loot
      of this.activeLoot
    ) {
      loot.update(
        time
      );
    }

    this.activeLoot =
      this.activeLoot.filter(
        (loot) =>
          !loot.pickedUp
      );
  }

  clear() {
    for (
      const loot
      of this.activeLoot
    ) {
      if (
        loot.group?.parent
      ) {
        this.scene.remove(
          loot.group
        );
      }
    }

    this.activeLoot = [];
  }
}