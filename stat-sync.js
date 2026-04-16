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

        for (let type of ["positive", "negative"]) {
          let cond = cfg[type].condition;
          if (game.cub.hasCondition(cond, token)) {
            await game.cub.removeCondition(cond, token);
          }
        }

        if (value > 0) {
          await applyCondition(token, cfg.positive, value);
        } 
        else if (value < 0) {
          await applyCondition(token, cfg.negative, Math.abs(value));
        }
      }
    }

  } catch (err) {
    console.error("Stat Condition Sync | Error:", err);
  }
});

async function applyCondition(token, cfg, value) {

  if (!game.cub.hasCondition(cfg.condition, token)) {
    await game.cub.addCondition(cfg.condition, token);
  }

  if (typeof EffectCounter !== "undefined") {
    let counter = EffectCounter.findCounter(token.document, cfg.icon);
    if (counter) {
      await counter.setValue(value);
    }
  }
}
