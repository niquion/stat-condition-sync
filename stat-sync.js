Hooks.on("updateActor", async (actor, changes) => {
  try {
    if (!actor?.isOwner) return;

    if (!foundry.utils.hasProperty(changes, "system.attributes")) return;

    const STAT_CONFIG = {
      bono_atq: { condition: "ATK+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/ataque%2B.png" },
      bono_hab: { condition: "HAB+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/hab%2B.png" },
      bono_vel: { condition: "VEL+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/vel%2B.png" },
      bono_def: { condition: "DEF+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/def%2B.png" },
      bono_res: { condition: "RES+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/res%2B.png" },
      bono_sue: { condition: "SUE+", icon: "worlds/campana-de-los-magnificos/arvys%20icons/estados/SUE%2B.png" }
    };

    const tokens = actor.getActiveTokens(true);
    if (!tokens.length) return;

    for (let token of tokens) {
      for (let [attrKey, cfg] of Object.entries(STAT_CONFIG)) {

        let attr = actor.system.attributes[attrKey];
        if (!attr) continue;

        let value = attr.value ?? 0;

        if (value <= 0) {
          if (game.cub.hasCondition(cfg.condition, token)) {
            await game.cub.removeCondition(cfg.condition, token);
          }
        } else {
          if (!game.cub.hasCondition(cfg.condition, token)) {
            await game.cub.addCondition(cfg.condition, token);
          }
        }

        if (typeof EffectCounter !== "undefined") {
          let counter = EffectCounter.findCounter(token.document, cfg.icon);
          if (counter) {
            await counter.setValue(value);
          }
        }
      }
    }

  } catch (err) {
    console.error("Stat Condition Sync | Error:", err);
  }
});