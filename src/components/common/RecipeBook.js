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
        stat: 'HP'
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
        stat: 'HP'
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
        stat: 'HP'
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
        stat: 'Attack'
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
        stat: 'Attack'
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
        stat: 'Attack'
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
        stat: 'Defense'
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
        stat: 'Defense'
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
        stat: 'Defense'
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
        stat: 'Damage'
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
        stat: 'Damage'
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
        stat: 'Damage'
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
        stat: 'Speed'
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
        stat: 'Speed'
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
        stat: 'Speed'
    },
]

export default recipeBook
