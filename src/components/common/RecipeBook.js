const recipeBook = [
    {
        ingredients: "4_hp_4_hp",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_hp_5.png",
                name: "Ring of HP +4"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_hp_5.png",
                name: "Ring of HP +4"
            }
        ],
        name: "Ring of HP +8",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_hp_4.png",
        wiza: 70,
        stat: 'HP',
        type: 'ring'
    },
    {
        ingredients: "8_hp_8_hp",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_hp_4.png",
                name: "Ring of HP +8"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_hp_4.png",
                name: "Ring of HP +8"
            }
        ],
        name: "Ring of HP +12",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_hp_3.png",
        wiza: 90,
        stat: 'HP',
        type: 'ring'
    },
    {
        ingredients: "ap_to_hp",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/placeholder.png",
                name: "48 AP"
            }
        ],
        name: "Ring of HP +12",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_hp_3.png",
        wiza: 0,
        kda: 5,
        stat: 'HP',
        type: 'ring'
    },
    {
        ingredients: "12_hp_12_hp",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_hp_3.png",
                name: "Ring of HP +12"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_hp_3.png",
                name: "Ring of HP +12"
            }
        ],
        name: "Ring of HP +16",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_hp_2.png",
        wiza: 120,
        stat: 'HP',
        type: 'ring'
    },
    {
        ingredients: "1_attack_1_attack",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_atk_5.png",
                name: "Ring of Attack +1"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_atk_5.png",
                name: "Ring of Attack +1"
            }
        ],
        name: "Ring of Attack +2",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_atk_4.png",
        wiza: 70,
        stat: 'Attack',
        type: 'ring'
    },
    {
        ingredients: "2_attack_2_attack",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_atk_4.png",
                name: "Ring of Attack +2"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_atk_4.png",
                name: "Ring of Attack +2"
            }
        ],
        name: "Ring of Attack +3",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_atk_3.png",
        wiza: 90,
        stat: 'Attack',
        type: 'ring'
    },
    {
        ingredients: "ap_to_atk",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/placeholder.png",
                name: "48 AP"
            }
        ],
        name: "Ring of Attack +3",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_atk_3.png",
        wiza: 0,
        kda: 5,
        stat: 'Attack',
        type: 'ring'
    },
    {
        ingredients: "3_attack_3_attack",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_atk_3.png",
                name: "Ring of Attack +3"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_atk_3.png",
                name: "Ring of Attack +3"
            }
        ],
        name: "Ring of Attack +4",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_atk_2.png",
        wiza: 120,
        stat: 'Attack',
        type: 'ring'
    },
    {
        ingredients: "1_defense_1_defense",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_def_5.png",
                name: "Ring of Defense +1"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_def_5.png",
                name: "Ring of Defense +1"
            }
        ],
        name: "Ring of Defense +2",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_def_4.png",
        wiza: 70,
        stat: 'Defense',
        type: 'ring'
    },
    {
        ingredients: "2_defense_2_defense",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_def_4.png",
                name: "Ring of Defense +2"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_def_4.png",
                name: "Ring of Defense +2"
            }
        ],
        name: "Ring of Defense +3",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_def_3.png",
        wiza: 90,
        stat: 'Defense',
        type: 'ring'
    },
    {
        ingredients: "ap_to_def",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/placeholder.png",
                name: "48 AP"
            }
        ],
        name: "Ring of Defense +3",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_def_3.png",
        wiza: 0,
        kda: 5,
        stat: 'Defense',
        type: 'ring'
    },
    {
        ingredients: "3_defense_3_defense",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_def_3.png",
                name: "Ring of Defense +3"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_def_3.png",
                name: "Ring of Defense +3"
            }
        ],
        name: "Ring of Defense +4",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_def_2.png",
        wiza: 120,
        stat: 'Defense',
        type: 'ring'
    },
    {
        ingredients: "2_damage_2_damage",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_dmg_5.png",
                name: "Ring of Damage +2"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_dmg_5.png",
                name: "Ring of Damage +2"
            }
        ],
        name: "Ring of Damage +4",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_dmg_4.png",
        wiza: 70,
        stat: 'Damage',
        type: 'ring'
    },
    {
        ingredients: "4_damage_4_damage",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_dmg_4.png",
                name: "Ring of Damage +4"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_dmg_4.png",
                name: "Ring of Damage +4"
            }
        ],
        name: "Ring of Damage +6",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_dmg_3.png",
        wiza: 90,
        stat: 'Damage',
        type: 'ring'
    },
    {
        ingredients: "ap_to_dmg",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/placeholder.png",
                name: "48 AP"
            }
        ],
        name: "Ring of Damage +6",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_dmg_3.png",
        wiza: 0,
        kda: 5,
        stat: 'Damage',
        type: 'ring'
    },
    {
        ingredients: "6_damage_6_damage",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_dmg_3.png",
                name: "Ring of Damage +6"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_dmg_3.png",
                name: "Ring of Damage +6"
            }
        ],
        name: "Ring of Damage +8",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_dmg_2.png",
        wiza: 120,
        stat: 'Damage',
        type: 'ring'
    },
    {
        ingredients: "2_speed_2_speed",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_speed_5.png",
                name: "Ring of Speed +2"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_speed_5.png",
                name: "Ring of Speed +2"
            }
        ],
        name: "Ring of Speed +4",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_speed_4.png",
        wiza: 70,
        stat: 'Speed',
        type: 'ring'
    },
    {
        ingredients: "4_speed_4_speed",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_speed_4.png",
                name: "Ring of Speed +4"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_speed_4.png",
                name: "Ring of Speed +4"
            }
        ],
        name: "Ring of Speed +6",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_speed_3.png",
        wiza: 90,
        stat: 'Speed',
        type: 'ring'
    },
    {
        ingredients: "ap_to_speed",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/placeholder.png",
                name: "48 AP"
            }
        ],
        name: "Ring of Speed +6",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_speed_3.png",
        wiza: 0,
        kda: 5,
        stat: 'Speed',
        type: 'ring'
    },
    {
        ingredients: "6_speed_6_speed",
        ingredientsInfo: [
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_speed_3.png",
                name: "Ring of Speed +6"
            },
            {
                url: "https://storage.googleapis.com/wizarena/equipment/ring_speed_3.png",
                name: "Ring of Speed +6"
            }
        ],
        name: "Ring of Speed +8",
        url: "https://storage.googleapis.com/wizarena/equipment/ring_speed_2.png",
        wiza: 120,
        stat: 'Speed',
        type: 'ring'
    },
    {"ingredients":"4_fire_4_fire","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_l.png","name":"Pendant of Fire Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_l.png","name":"Pendant of Fire Resistance (low)"}],"name":"Pendant of Fire Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},     {"ingredients":"4_acid_4_acid","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_l.png","name":"Pendant of Acid Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_l.png","name":"Pendant of Acid Resistance (low)"}],"name":"Pendant of Acid Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},{"ingredients":"4_dark_4_dark","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_dark_res_l.png","name":"Pendant of Dark Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_dark_res_l.png","name":"Pendant of Dark Resistance (low)"}],"name":"Pendant of Dark Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},{"ingredients":"4_earth_4_earth","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_l.png","name":"Pendant of Earth Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_l.png","name":"Pendant of Earth Resistance (low)"}],"name":"Pendant of Earth Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},{"ingredients":"4_ice_4_ice","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_l.png","name":"Pendant of Ice Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_l.png","name":"Pendant of Ice Resistance (low)"}],"name":"Pendant of Ice Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},{"ingredients":"4_psycho_4_psycho","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_l.png","name":"Pendant of Psycho Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_l.png","name":"Pendant of Psycho Resistance (low)"}],"name":"Pendant of Psycho Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},{"ingredients":"4_spirit_4_spirit","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_l.png","name":"Pendant of Spirit Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_l.png","name":"Pendant of Spirit Resistance (low)"}],"name":"Pendant of Spirit Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},{"ingredients":"4_sun_4_sun","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_l.png","name":"Pendant of Sun Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_l.png","name":"Pendant of Sun Resistance (low)"}],"name":"Pendant of Sun Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},{"ingredients":"4_thunder_4_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_l.png","name":"Pendant of Thunder Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_l.png","name":"Pendant of Thunder Resistance (low)"}],"name":"Pendant of Thunder Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},{"ingredients":"4_undead_4_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_l.png","name":"Pendant of Undead Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_l.png","name":"Pendant of Undead Resistance (low)"}],"name":"Pendant of Undead Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},{"ingredients":"4_water_4_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_l.png","name":"Pendant of Water Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_l.png","name":"Pendant of Water Resistance (low)"}],"name":"Pendant of Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},{"ingredients":"4_wind_4_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_l.png","name":"Pendant of Wind Resistance (low)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_l.png","name":"Pendant of Wind Resistance (low)"}],"name":"Pendant of Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_m.png","wiza":300.01,"stat":"Element Resistance (Medium)","level":1},
    {"ingredients":"5_fire_5_fire","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_m.png","name":"Pendant of Fire Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_m.png","name":"Pendant of Fire Resistance (medium)"}],"name":"Pendant of Fire Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_acid_5_acid","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_m.png","name":"Pendant of Acid Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_m.png","name":"Pendant of Acid Resistance (medium)"}],"name":"Pendant of Acid Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_dark_5_dark","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_m.png","name":"Pendant of Dark Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_m.png","name":"Pendant of Dark Resistance (medium)"}],"name":"Pendant of Dark Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_earth_5_earth","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_m.png","name":"Pendant of Earth Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_m.png","name":"Pendant of Earth Resistance (medium)"}],"name":"Pendant of Earth Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_ice_5_ice","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_m.png","name":"Pendant of Ice Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_m.png","name":"Pendant of Ice Resistance (medium)"}],"name":"Pendant of Ice Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_psycho_5_psycho","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_m.png","name":"Pendant of Psycho Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_m.png","name":"Pendant of Psycho Resistance (medium)"}],"name":"Pendant of Psycho Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_spirit_5_spirit","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_m.png","name":"Pendant of Spirit Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_m.png","name":"Pendant of Spirit Resistance (medium)"}],"name":"Pendant of Spirit Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_sun_5_sun","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_m.png","name":"Pendant of Sun Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_m.png","name":"Pendant of Sun Resistance (medium)"}],"name":"Pendant of Sun Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_thunder_5_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_m.png","name":"Pendant of Thunder Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_m.png","name":"Pendant of Thunder Resistance (medium)"}],"name":"Pendant of Thunder Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_undead_5_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_m.png","name":"Pendant of Undead Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_m.png","name":"Pendant of Undead Resistance (medium)"}],"name":"Pendant of Undead Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_water_5_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_m.png","name":"Pendant of Water Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_m.png","name":"Pendant of Water Resistance (medium)"}],"name":"Pendant of Water Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},{"ingredients":"5_wind_5_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_m.png","name":"Pendant of Wind Resistance (medium)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_m.png","name":"Pendant of Wind Resistance (medium)"}],"name":"Pendant of Wind Resistance (high)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","wiza":500.01,"stat":"Element Resistance (High)","level":2},
    {"ingredients":"8_speed_5_earth","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/ring_speed_2.png","name":"Ring of Speed +8"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_m.png","name":"Pendant of Earth Resistance (medium)"}],"name":"Pendant of Shock Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_shock_res.png","wiza":1200.01,"stat":"Perk Resistance","level":3},{"ingredients":"4_defense_5_ice","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/ring_def_2.png","name":"Ring of Defense +4"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_m.png","name":"Pendant of Ice Resistance (medium)"}],"name":"Pendant of Paralyze 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_paralyze_res.png","wiza":1200.01,"stat":"Perk Resistance","level":3},{"ingredients":"4_attack_5_fire","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/ring_atk_2.png","name":"Ring of Attack +4"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_m.png","name":"Pendant of Fire Resistance (medium)"}],"name":"Pendant of Fear 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear2_res.png","wiza":1200.01,"stat":"Perk Resistance","level":3},{"ingredients":"8_damage_5_sun","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/ring_dmg_2.png","name":"Ring of Damage +8"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_m.png","name":"Pendant of Sun Resistance (medium)"}],"name":"Pendant of Blind Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_res.png","wiza":1200.01,"stat":"Perk Resistance","level":3},{"ingredients":"16_hp_5_acid","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/ring_hp_2.png","name":"Ring of HP +16"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_m.png","name":"Pendant of Acid Resistance (medium)"}],"name":"Pendant of Poison 3 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_poison3_res.png","wiza":1200.01,"stat":"Perk Resistance","level":3},{"ingredients":"16_hp_5_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/ring_hp_2.png","name":"Ring of HP +16"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_m.png","name":"Pendant of Thunder Resistance (medium)"}],"name":"Pendant of Confuse Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_res.png","wiza":1200.01,"stat":"Perk Resistance","level":3},{"ingredients":"8_speed_5_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/ring_speed_2.png","name":"Ring of Speed +8"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_m.png","name":"Pendant of Water Resistance (medium)"}],"name":"Pendant of Freeze Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_freeze_res.png","wiza":1200.01,"stat":"Perk Resistance","level":3},
    {"ingredients":"6_fire_6_acid","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"}],"name":"Pendant of Fire and Acid Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_fire.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_fire_6_dark","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"}],"name":"Pendant of Fire and Dark Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_dark.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_fire_6_earth","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"}],"name":"Pendant of Fire and Earth Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_fire.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_fire_6_ice","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"}],"name":"Pendant of Fire and Ice Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_fire_6_psycho","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"}],"name":"Pendant of Fire and Psycho Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_fire.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_fire_6_spirit","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"}],"name":"Pendant of Fire and Spirit Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_spirit.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_fire_6_sun","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"}],"name":"Pendant of Fire and Sun Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_fire.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_fire_6_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"}],"name":"Pendant of Fire and Thunder Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_thunder.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_fire_6_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"}],"name":"Pendant of Fire and Undead Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_fire.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_fire_6_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"}],"name":"Pendant of Fire and Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_fire.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_fire_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_h.png","name":"Pendant of Fire Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Fire and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_fire.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_acid_6_dark","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"}],"name":"Pendant of Acid and Dark Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_dark_acid.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_acid_6_earth","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"}],"name":"Pendant of Acid and Earth Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_acid.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_acid_6_ice","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"}],"name":"Pendant of Acid and Ice Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_acid_6_psycho","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"}],"name":"Pendant of Acid and Psycho Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_psycho.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_acid_6_spirit","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"}],"name":"Pendant of Acid and Spirit Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_spirit.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_acid_6_sun","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"}],"name":"Pendant of Acid and Sun Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_acid.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_acid_6_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"}],"name":"Pendant of Acid and Thunder Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_thunder.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_acid_6_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"}],"name":"Pendant of Acid and Undead Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_acid.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_acid_6_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"}],"name":"Pendant of Acid and Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_water.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_acid_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_h.png","name":"Pendant of Acid Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Acid and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_acid.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_dark_6_earth","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"}],"name":"Pendant of Dark and Earth Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_dark_earth.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_dark_6_ice","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"}],"name":"Pendant of Dark and Ice Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_dark_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_dark_6_psycho","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"}],"name":"Pendant of Dark and Psycho Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_dark.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_dark_6_spirit","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"}],"name":"Pendant of Dark and Spirit Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_dark_spirit.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_dark_6_sun","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"}],"name":"Pendant of Dark and Sun Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_dark.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_dark_6_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"}],"name":"Pendant of Dark and Thunder Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_dark_thunder.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_dark_6_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"}],"name":"Pendant of Dark and Undead Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_dark.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_dark_6_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"}],"name":"Pendant of Dark and Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_dark.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_dark_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_h.png","name":"Pendant of Dark Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Dark and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_dark.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_earth_6_ice","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"}],"name":"Pendant of Earth and Ice Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_earth_6_psycho","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"}],"name":"Pendant of Earth and Psycho Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_psycho.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_earth_6_spirit","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"}],"name":"Pendant of Earth and Spirit Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_spirit.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_earth_6_sun","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"}],"name":"Pendant of Earth and Sun Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_earth.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_earth_6_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"}],"name":"Pendant of Earth and Thunder Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_thunder.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_earth_6_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"}],"name":"Pendant of Earth and Undead Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_undead.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_earth_6_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"}],"name":"Pendant of Earth and Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_water.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_earth_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_h.png","name":"Pendant of Earth Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Earth and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_earth.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_ice_6_psycho","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"}],"name":"Pendant of Ice and Psycho Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_ice_6_spirit","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"}],"name":"Pendant of Ice and Spirit Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_ice_6_sun","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"}],"name":"Pendant of Ice and Sun Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_ice_6_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"}],"name":"Pendant of Ice and Thunder Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_ice_6_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"}],"name":"Pendant of Ice and Undead Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_ice_6_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"}],"name":"Pendant of Ice and Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_ice_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_h.png","name":"Pendant of Ice Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Ice and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_ice.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_psycho_6_spirit","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"}],"name":"Pendant of Psycho and Spirit Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_spirit.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_psycho_6_sun","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"}],"name":"Pendant of Psycho and Sun Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_psycho.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_psycho_6_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"}],"name":"Pendant of Psycho and Thunder Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_thunder.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_psycho_6_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"}],"name":"Pendant of Psycho and Undead Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_psycho.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_psycho_6_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"}],"name":"Pendant of Psycho and Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_water.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_psycho_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_h.png","name":"Pendant of Psycho Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Psycho and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_psycho.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_spirit_6_sun","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"}],"name":"Pendant of Spirit and Sun Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_spirit.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_spirit_6_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"}],"name":"Pendant of Spirit and Thunder Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_thunder.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_spirit_6_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"}],"name":"Pendant of Spirit and Undead Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_spirit.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_spirit_6_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"}],"name":"Pendant of Spirit and Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_spirit.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_spirit_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_h.png","name":"Pendant of Spirit Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Spirit and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_spirit.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_sun_6_thunder","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"}],"name":"Pendant of Sun and Thunder Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_thunder.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_sun_6_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"}],"name":"Pendant of Sun and Undead Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_sun.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_sun_6_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"}],"name":"Pendant of Sun and Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_sun.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_sun_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_h.png","name":"Pendant of Sun Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Sun and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_sun.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_thunder_6_undead","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"}],"name":"Pendant of Thunder and Undead Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_thunder.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_thunder_6_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"}],"name":"Pendant of Thunder and Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_thunder.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_thunder_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_h.png","name":"Pendant of Thunder Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Thunder and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_thunder.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_undead_6_water","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"}],"name":"Pendant of Undead and Water Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_undead.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_undead_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_h.png","name":"Pendant of Undead Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Undead and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_undead_wind.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},{"ingredients":"6_water_6_wind","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_water_res_h.png","name":"Pendant of Water Resistance (high)"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_h.png","name":"Pendant of Wind Resistance (high)"}],"name":"Pendant of Water and Wind Resistance (medium)","url":"https://storage.googleapis.com/wizarena/equipment/pendant_wind_water.png","wiza":2000.01,"stat":"Double Element Resistance","level":4},
    {"ingredients":"poison 3_res_confuse_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_poison3_res.png","name":"Pendant of Poison 3 Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_res.png","name":"Pendant of Confuse Resistance"}],"name":"Pendant of Poison 3 and Confuse Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_poison.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"poison 3_res_freeze_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_poison3_res.png","name":"Pendant of Poison 3 Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_freeze_res.png","name":"Pendant of Freeze Resistance"}],"name":"Pendant of Poison 3 and Freeze Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_freeze_poison.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"poison 3_res_shock_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_poison3_res.png","name":"Pendant of Poison 3 Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_shock_res.png","name":"Pendant of Shock Resistance"}],"name":"Pendant of Poison 3 and Shock Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_shock_poison.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"poison 3_res_blind_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_poison3_res.png","name":"Pendant of Poison 3 Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_res.png","name":"Pendant of Blind Resistance"}],"name":"Pendant of Poison 3 and Blind Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_poison.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"poison 3_res_paralyze 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_poison3_res.png","name":"Pendant of Poison 3 Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_paralyze_res.png","name":"Pendant of Paralyze 2 Resistance"}],"name":"Pendant of Poison 3 and Paralyze 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_paralyze_poison.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"poison 3_res_fear 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_poison3_res.png","name":"Pendant of Poison 3 Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear2_res.png","name":"Pendant of Fear 2 Resistance"}],"name":"Pendant of Poison 3 and Fear 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear_poison.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"confuse_res_freeze_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_res.png","name":"Pendant of Confuse Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_freeze_res.png","name":"Pendant of Freeze Resistance"}],"name":"Pendant of Confuse and Freeze Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_freeze.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"confuse_res_shock_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_res.png","name":"Pendant of Confuse Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_shock_res.png","name":"Pendant of Shock Resistance"}],"name":"Pendant of Confuse and Shock Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_shock.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"confuse_res_blind_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_res.png","name":"Pendant of Confuse Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_res.png","name":"Pendant of Blind Resistance"}],"name":"Pendant of Confuse and Blind Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_confuse.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"confuse_res_paralyze 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_res.png","name":"Pendant of Confuse Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_paralyze_res.png","name":"Pendant of Paralyze 2 Resistance"}],"name":"Pendant of Confuse and Paralyze 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_paralyze.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"confuse_res_fear 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_res.png","name":"Pendant of Confuse Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear2_res.png","name":"Pendant of Fear 2 Resistance"}],"name":"Pendant of Confuse and Fear 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_confuse_fear.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"freeze_res_shock_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_freeze_res.png","name":"Pendant of Freeze Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_shock_res.png","name":"Pendant of Shock Resistance"}],"name":"Pendant of Freeze and Shock Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_freeze_shock.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"freeze_res_blind_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_freeze_res.png","name":"Pendant of Freeze Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_res.png","name":"Pendant of Blind Resistance"}],"name":"Pendant of Freeze and Blind Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_freeze.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"freeze_res_paralyze 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_freeze_res.png","name":"Pendant of Freeze Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_paralyze_res.png","name":"Pendant of Paralyze 2 Resistance"}],"name":"Pendant of Freeze and Paralyze 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_paralyze_freeze.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"freeze_res_fear 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_freeze_res.png","name":"Pendant of Freeze Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear2_res.png","name":"Pendant of Fear 2 Resistance"}],"name":"Pendant of Freeze and Fear 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear_freeze.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"shock_res_blind_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_shock_res.png","name":"Pendant of Shock Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_res.png","name":"Pendant of Blind Resistance"}],"name":"Pendant of Shock and Blind Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_shock.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"shock_res_paralyze 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_shock_res.png","name":"Pendant of Shock Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_paralyze_res.png","name":"Pendant of Paralyze 2 Resistance"}],"name":"Pendant of Shock and Paralyze 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_paralyze_shock.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"shock_res_fear 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_shock_res.png","name":"Pendant of Shock Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear2_res.png","name":"Pendant of Fear 2 Resistance"}],"name":"Pendant of Shock and Fear 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear_shock.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"blind_res_paralyze 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_res.png","name":"Pendant of Blind Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_paralyze_res.png","name":"Pendant of Paralyze 2 Resistance"}],"name":"Pendant of Blind and Paralyze 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_paralyze.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"blind_res_fear 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_res.png","name":"Pendant of Blind Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear2_res.png","name":"Pendant of Fear 2 Resistance"}],"name":"Pendant of Blind and Fear 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_blind_fear.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},{"ingredients":"paralyze 2_res_fear 2_res","ingredientsInfo":[{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_paralyze_res.png","name":"Pendant of Paralyze 2 Resistance"},{"url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear2_res.png","name":"Pendant of Fear 2 Resistance"}],"name":"Pendant of Paralyze 2 and Fear 2 Resistance","url":"https://storage.googleapis.com/wizarena/equipment/pendant_fear_paralyze.png","wiza":5000.01,"stat":"Double Perk Resistance","level":5},
    {
        "ingredients": "ap_to_fire",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Fire Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_fire_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_acid",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Acid Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_acid_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_dark",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Dark Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_acid_dark_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_earth",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Earth Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_earth_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_ice",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Ice Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_ice_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_psycho",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Psycho Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_psycho_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_spirit",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Spirit Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_spirit_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_sun",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Sun Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_sun_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_thunder",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Thunder Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_thunder_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_undead",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Undead Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_undead_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_water",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Water Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_water_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    },
    {
        "ingredients": "ap_to_wind",
        "ingredientsInfo": [
            {
                "url": "https://storage.googleapis.com/wizarena/placeholder.png",
                "name": "48 AP"
            }
        ],
        "name": "Pendant of Wind Resistance (medium)",
        "url": "https://storage.googleapis.com/wizarena/equipment/pendant_wind_res_m.png",
        "wiza": 0,
        "kda": 5,
        "stat": "Element Resistance (Medium)",
        "level": 1
    }
]

export default recipeBook
