ig.module("game.feature.skills.al-custom-skills").requires(	"game.feature.player.entities.player", "game.feature.player.player-model", "game.feature.skills.skills", "game.feature.menu.gui.circuit.circuit-detail-elements", "impact.feature.gui.gui", "impact.feature.gui.base.basic-gui", "game.feature.menu.gui.menu-misc", "game.feature.menu.gui.stats.stats-misc").defines(function() {
	var dbs = ig.arcaneLabDatabase.get("customSkills");
    const checkCustomSkill = (a, b) => {
		if(!sc.model.isCutscene() && sc.model.player.getItemAmount("toggle-arcanelab-skill") != 0 && sc.model.player.getToggleItemState("toggle-arcanelab-skill")) {
			for (var dbd in dbs) {
				var dbo = dbs[dbd];
				if((dbo.element === "BASE" || a == sc.ELEMENT[dbo.element]) && new ig.VarCondition(dbo.activeCondition || "true").evaluate() && ig.vars.get("custom-skills."+dbo.element+"."+dbd) == true) {
					for(var dbl of dbo.list) {
						if(dbl.actionCheckKey === b || sc.PLAYER_ACTION[dbl.actionCheckKey] === b) {
							dbo.skill = dbl.replaceTo;
							if(dbl.icon) {
								dbo.icon = dbl.icon;
							}
							return dbo;
						}
					}
				}
			}
		}
        return "";
    }
    const isCustomSkill = (a, b) => {
		for (var dbd in dbs) {
			var dbo = dbs[dbd];
			if(a == sc.ELEMENT[dbo.element]) {
				for(var dbl of dbo.list) {
					if(dbl.replaceTo === b) {
						dbo.skill = dbl.replaceTo;
						if(dbl.icon) {
							dbo.icon = dbl.icon;
						}
						return dbo;
					}
				}
			}
		}
        return "";
    }
    var actionIdx = Math.max(...Object.values(sc.PLAYER_ACTION)) + 1;
	for (var dbd in dbs) {
		for(var dbl of dbs[dbd].list) {
			sc.PLAYER_ACTION[dbl.replaceTo] = actionIdx;
			actionIdx++;
		}
    }
    ig.ENTITY.Player.inject({
        getChargeAction: function(a, b) {
            for (var c = a.actionKey; b && !this.model.getAction(sc.PLAYER_ACTION[c + b]);) b--;
            if (!b) return 0;
            var d = sc.PLAYER_SP_COST[b - 1];
            sc.newgame.get("infinite-sp") || this.model.params.consumeSp(d);
            var actionKey = checkCustomSkill(this.model.currentElementMode, c + b);
            if (actionKey) {
				return actionKey.skill;
			}
            return c + b;
        }
    });
    sc.PlayerModel.inject({
        getCombatArt: function(a, b) {
			var actionKey = checkCustomSkill(a, b);
			if (actionKey) {
				return this.elementConfigs[a].getPlayerAction(actionKey.skill);
			}
            return this.elementConfigs[a].getPlayerAction(b)
        },
        getCombatArtName: function(a) {
            var actionKey = checkCustomSkill(this.currentElementMode, a);
            if (actionKey) {
                return this.elementConfigs[this.currentElementMode].getAction(actionKey.skill).name;
            }
            return this.elementConfigs[this.currentElementMode].getActiveCombatArtName(a)
        },
        getActiveCombatArt: function(a, b) {
            var actionKey = checkCustomSkill(a, b);
            if (actionKey) {
                return this.elementConfigs[a].getAction(sc.PLAYER_ACTION[actionKey.skill]);
            }
            return this.elementConfigs[a].getAction(b)
        },
        getAction: function(a) {;
            var actionKey = checkCustomSkill(this.currentElementMode, a);
            if (actionKey) {
				var ea = this.elementConfigs[this.currentElementMode].getAction(sc.PLAYER_ACTION[actionKey.skill]);
                return ea?ea:this.baseConfig.actions[actionKey.skill].action;
            }
            return this.elementConfigs[this.currentElementMode].getAction(a) || this.baseConfig.getAction(a)
        },
        getActionByElement: function(a, b) {
            var actionKey = checkCustomSkill(a, b);
            if (actionKey) {
				var ea = this.elementConfigs[a].getAction(sc.PLAYER_ACTION[actionKey.skill]);
                return ea?ea:this.baseConfig.actions[actionKey.skill].action;
            }
            return this.elementConfigs[a].getAction(b) || this.baseConfig.getAction(b)
        }
    });
    sc.StatusViewCombatArtsContainer.inject({
        addArts: function(a, b, c) {
            for (var e = 0; e < 3; e++) {
                var f = sc.model.player.getActiveCombatArt(b, sc.PLAYER_ACTION[a + (e + 1)]);
                if (f)
                    if (f = sc.model.player.getCombatArt(b, f.name)) {
						var customCheck = isCustomSkill(b, f.key);
                        f = new sc.StatusViewCombatArtsEntry(e + 1, f);
						if(customCheck) {
                            f.icon.setImage(new ig.Image(customCheck.icon.src), customCheck.icon.offX || 0, customCheck.icon.offY || 0, 24, 24)
                            f.name.setText(f.name.text.replace("\\c[3]", "\\c[2]"))
						}
                        this.list.addEntry(f);
                        if (e != c - 1) {
                            f = new sc.StatusViewCombatArtsLineSingle;
                            this.list.addEntry(f)
                        }
                    }
            }
        }
	});
});