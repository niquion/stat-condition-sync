Hooks.once("ready", async () => {
  const icons = [
    "worlds/campana-de-los-magnificos/arvys%20icons/estados/atk-.png",
    "worlds/campana-de-los-magnificos/arvys%20icons/estados/hab-.png",
    "worlds/campana-de-los-magnificos/arvys%20icons/estados/VEL-.png",
    "worlds/campana-de-los-magnificos/arvys%20icons/estados/def-.png",
    "worlds/campana-de-los-magnificos/arvys%20icons/estados/res-.png",
    "worlds/campana-de-los-magnificos/arvys%20icons/estados/sue-.png"
  ];

  for (let path of icons) {
    await loadTexture(path);
  }
});

Hooks.on("updateActor", async (actor, changes) => {
  try {
    if (!actor?.isOwner) return;
    if (!foundry.utils.hasProperty(changes, "system.attributes")) return;

    const STAT_CONFIG = {
      bono_atq: {
        positive: { condition: "ATK+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/ataque%2B.png" },
        negative: { condition: "ATK-", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/atk-.png" }
      },
      bono_hab: {
        positive: { condition: "HAB+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/hab%2B.png" },
        negative: { condition: "HAB-", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/hab-.png" }
      },
      bono_vel: {
        positive: { condition: "VEL+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/vel%2B.png" },
        negative: { condition: "VEL-", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/VEL-.png" }
      },
      bono_def: {
        positive: { condition: "DEF+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/def%2B.png" },
        negative: { condition: "DEF-", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/def-.png" }
      },
      bono_res: {
        positive: { condition: "RES+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/res%2B.png" },
        negative: { condition: "RES-", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/res-.png" }
      },
      bono_sue: {
        positive: { condition: "SUE+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/SUE%2B.png" },
        negative: { condition: "SUE-", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/sue-.png" }
      }
    };

    const tokens = actor.getActiveTokens(true);
    if (!tokens.length) return;

    for (let token of tokens) {
      for (let [attrKey, cfg] of Object.entries(STAT_CONFIG)) {

        let attr = actor.system.attributes[attrKey];
        if (!attr) continue;

        let value = attr.value ?? 0;

        let desiredState =
          value > 0 ? "positive" :
          value < 0 ? "negative" :
          "none";

        let hasPositive = game.cub.hasCondition(cfg.positive.condition, token);
        let hasNegative = game.cub.hasCondition(cfg.negative.condition, token);

        let currentState =
          hasPositive ? "positive" :
          hasNegative ? "negative" :
          "none";

        if (currentState === desiredState) {
          if (desiredState !== "none") {
            await updateCounter(token, cfg[desiredState], Math.abs(value));
          }
          continue;
        }
        
        if (hasPositive) {
          await game.cub.removeCondition(cfg.positive.condition, token);
        }
        if (hasNegative) {
          await game.cub.removeCondition(cfg.negative.condition, token);
        }

        if (desiredState !== "none") {
          await game.cub.addCondition(cfg[desiredState].condition, token);
          await updateCounter(token, cfg[desiredState], Math.abs(value));

          await new Promise(r => setTimeout(r, 50));
          token.document.object?.draw();
        }
      }
    }

  } catch (err) {
    console.error("Stat Condition Sync | Error:", err);
  }
});

async function updateCounter(token, cfg, value) {
  if (typeof EffectCounter === "undefined") return;

  let counter = EffectCounter.findCounter(token.document, cfg.icon);
  if (counter) {
    await counter.setValue(value);
  }
}
