const allSpells = [
	//ACID
	{
		"name": "Acid Arrow",
		"atkBase": 6,
		"dmgBase": 9,
		"condition": { "name": "Poison 1", "effect": "malus_3_def", "pct": 40 },
		"element": "Acid"
	},
	{
		"name": "Cloudkill",
		"atkBase": 5,
		"dmgBase": 7,
		"condition": { "name": "Poison 2", "effect": "malus_6_def", "pct": 60 },
		"element": "Acid"
	},
	{
		"name": "Infestation",
		"atkBase": 6,
		"dmgBase": 8,
		"condition": { "name": "Disease", "effect": "malus_4_dmg", "pct": 50 },
		"element": "Acid"
	},
	{
		"name": "Poison Barrage",
		"atkBase": 3,
		"dmgBase": 8,
		"condition": { "name": "Poison 3", "effect": "skip", "pct": 50 },
		"element": "Acid"
	},
	{
		"name": "Corrosion",
		"atkBase": 5,
		"dmgBase": 6,
		"condition": { "name": "Poison 3", "effect": "skip", "pct": 50 },
		"element": "Acid"
	},
	{
		"name": "Acid Beam",
		"atkBase": 9,
		"dmgBase": 12,
		"condition": {},
		"element": "Acid"
	},
	{
	    "name": "Necrosis",
	    "atkBase": 8,
	    "dmgBase": 13,
	    "condition": {},
	    "element": "Acid"
	},
	//FIRE
	{
		"name": "Ignite",
		"atkBase": 7,
		"dmgBase": 8,
		"condition": { "name": "Burn", "effect": "malus_3_def", "pct": 40 },
		"element": "Fire"
	},
	{
		"name": "Hellish Flame",
		"atkBase": 6,
		"dmgBase": 6,
		"condition": { "name": "Burn 2", "effect": "malus_6_def", "pct": 60 },
		"element": "Fire"
	},
	{
		"name": "Fiery Smoke",
		"atkBase": 7,
		"dmgBase": 7,
		"condition": { "name": "Burn 3", "effect": "malus_4_dmg", "pct": 50 },
		"element": "Fire"
	},
	{
		"name": "Hellfire Strike",
		"atkBase": 7,
		"dmgBase": 4,
		"condition": { "name": "Fear 2", "effect": "skip", "pct": 50 },
		"element": "Fire"
	},
	{
		"name": "Dragon's Breath",
		"atkBase": 6,
		"dmgBase": 5,
		"condition": { "name": "Fear 2", "effect": "skip", "pct": 50 },
		"element": "Fire"
	},
	{
		"name": "Fireball",
		"atkBase": 10,
		"dmgBase": 11,
		"condition": {},
		"element": "Fire"
	},
	//ICE
	{
		"name": "Ice Shield",
		"atkBase": 9,
		"dmgBase": 6,
		"condition": { "name": "Harden", "effect": "malus_3_dmg", "pct": 40 },
		"element": "Ice"
	},
	{
		"name": "Ice Spear",
		"atkBase": 7,
		"dmgBase": 5,
		"condition": { "name": "Harden 2", "effect": "malus_6_dmg", "pct": 60 },
		"element": "Ice"
	},
	{
		"name": "Ice Storm",
		"atkBase": 10,
		"dmgBase": 4,
		"condition": { "name": "Harden 3", "effect": "malus_4_def", "pct": 50 },
		"element": "Ice"
	},
	{
		"name": "Frostbite",
		"atkBase": 5,
		"dmgBase": 6,
		"condition": { "name": "Freeze", "effect": "skip", "pct": 50 },
		"element": "Ice"
	},
	{
		"name": "Avalanche",
		"atkBase": 8,
		"dmgBase": 3,
		"condition": { "name": "Freeze", "effect": "skip", "pct": 50 },
		"element": "Ice"
	},
	{
		"name": "Frost Missiles",
		"atkBase": 13,
		"dmgBase": 8,
		"condition": {},
		"element": "Ice"
	},
	//THUNDER
	{
		"name": "Thunder",
		"atkBase": 5,
		"dmgBase": 10,
		"condition": { "name": "Exhaust", "effect": "malus_3_atk", "pct": 40 },
		"element": "Thunder"
	},
	{
		"name": "Storm",
		"atkBase": 4,
		"dmgBase": 8,
		"condition": { "name": "Exhaust 2", "effect": "malus_6_atk", "pct": 60 },
		"element": "Thunder"
	},
	{
		"name": "Thunder Spike",
		"atkBase": 5,
		"dmgBase": 9,
		"condition": { "name": "Exhaust 3", "effect": "malus_4_dmg", "pct": 50 },
		"element": "Thunder"
	},
	{
		"name": "Shock",
		"atkBase": 3,
		"dmgBase": 8,
		"condition": { "name": "Shock", "effect": "skip", "pct": 50 },
		"element": "Thunder"
	},
	{
		"name": "Shatter",
		"atkBase": 5,
		"dmgBase": 6,
		"condition": { "name": "Shock", "effect": "skip", "pct": 50 },
		"element": "Thunder"
	},
	{
		"name": "Lightning",
		"atkBase": 8,
		"dmgBase": 13,
		"condition": {},
		"element": "Thunder"
	},
	//DARK
	{
		"name": "Hallucination",
		"atkBase": 7,
		"dmgBase": 8,
		"condition": { "name": "Exhaust", "effect": "malus_3_atk", "pct": 40 },
		"element": "Dark"
	},
	{
		"name": "Bane",
		"atkBase": 6,
		"dmgBase": 6,
		"condition": { "name": "Exhaust 2", "effect": "malus_6_atk", "pct": 60 },
		"element": "Dark"
	},
	{
		"name": "Hex",
		"atkBase": 7,
		"dmgBase": 7,
		"condition": { "name": "Curse", "effect": "malus_4_def", "pct": 50 },
		"element": "Dark"
	},
	{
		"name": "Blight",
		"atkBase": 5,
		"dmgBase": 6,
		"condition": { "name": "Shock", "effect": "skip", "pct": 50 },
		"element": "Dark"
	},
	{
		"name": "Abyss",
		"atkBase": 6,
		"dmgBase": 5,
		"condition": { "name": "Poison 3", "effect": "skip", "pct": 50 },
		"element": "Dark"
	},
	{
		"name": "Vindicate",
		"atkBase": 7,
		"dmgBase": 14,
		"condition": {},
		"element": "Dark"
	},
	{
		"name": "Unholy Nova",
		"atkBase": 10,
		"dmgBase": 11,
		"condition": {},
		"element": "Dark"
	},
	//WIND
	{
		"name": "Tornado",
		"atkBase": 9,
		"dmgBase": 6,
		"condition": { "name": "Protection", "effect": "malus_3_dmg", "pct": 40 },
		"element": "Wind"
	},
	{
	    "name": "Vortex",
	    "atkBase": 7,
	    "dmgBase": 5,
	    "condition": { "name": "Protection 2", "effect": "malus_6_dmg", "pct": 60 },
	    "element": "Wind"
	},
	{
		"name": "Wave of Nature",
		"atkBase": 8,
		"dmgBase": 6,
		"condition": { "name": "Slow", "effect": "malus_4_atk", "pct": 50 },
		"element": "Wind"
	},
	{
		"name": "Wind Rupture",
		"atkBase": 4,
		"dmgBase": 7,
		"condition": { "name": "Paralyze 2", "effect": "skip", "pct": 50 },
		"element": "Wind"
	},
	{
		"name": "Wind Barrier",
		"atkBase": 7,
		"dmgBase": 4,
		"condition": { "name": "Blind", "effect": "skip", "pct": 50 },
		"element": "Wind"
	},
	{
		"name": "Whirl",
		"atkBase": 12,
		"dmgBase": 9,
		"condition": {},
		"element": "Wind"
	},
	{
		"name": "Wind Strike",
		"atkBase": 10,
		"dmgBase": 11,
		"condition": {},
		"element": "Wind"
	},
	//EARTH
    {
		"name": "Earth Tremor",
		"atkBase": 10,
		"dmgBase": 5,
		"condition": { "name": "Slow 2", "effect": "malus_3_def", "pct": 40 },
		"element": "Earth"
	},
	{
		"name": "Earthquake",
		"atkBase": 7,
		"dmgBase": 5,
		"condition": { "name": "Slow 3", "effect": "malus_6_def", "pct": 60 },
		"element": "Earth"
	},
	{
		"name": "Rock Shield",
		"atkBase": 8,
		"dmgBase": 6,
		"condition": { "name": "Slow", "effect": "malus_4_atk", "pct": 50 },
		"element": "Earth"
	},
	{
		"name": "Bones of the Earth",
		"atkBase": 5,
		"dmgBase": 6,
		"condition": { "name": "Confuse", "effect": "skip", "pct": 50 },
		"element": "Earth"
	},
	{
		"name": "Flesh to Stone",
		"atkBase": 4,
		"dmgBase": 7,
		"condition": { "name": "Paralyze 2", "effect": "skip", "pct": 50 },
		"element": "Earth"
	},
	{
		"name": "Meteors",
		"atkBase": 13,
		"dmgBase": 8,
		"condition": {},
		"element": "Earth"
	},
	{
		"name": "Erupting Earth",
		"atkBase": 10,
		"dmgBase": 11,
		"condition": {},
		"element": "Earth"
	},
	//SUN
	{
		"name": "Sacred Flame",
		"atkBase": 6,
		"dmgBase": 9,
		"condition": { "name": "Exhaust", "effect": "malus_3_atk", "pct": 40 },
		"element": "Sun"
	},
	{
		"name": "Sunbeam",
		"atkBase": 5,
		"dmgBase": 7,
		"condition": { "name": "Exhaust 2", "effect": "malus_6_atk", "pct": 60 },
		"element": "Sun"
	},
	{
		"name": "Light Shield",
		"atkBase": 6,
		"dmgBase": 8,
		"condition": { "name": "Exhaust 3", "effect": "malus_4_dmg", "pct": 50 },
		"element": "Sun"
	},
	{
		"name": "Solar Faith",
		"atkBase": 3,
		"dmgBase": 8,
		"condition": { "name": "Blind", "effect": "skip", "pct": 50 },
		"element": "Sun"
	},
	{
		"name": "Dawn",
		"atkBase": 5,
		"dmgBase": 6,
		"condition": { "name": "Blind", "effect": "skip", "pct": 50 },
		"element": "Sun"
	},
	{
		"name": "Divine Light",
		"atkBase": 8,
		"dmgBase": 13,
		"condition": {},
		"element": "Sun"
	},
	//SPIRIT
	{
		"name": "Phantasmal Force",
		"atkBase": 8,
		"dmgBase": 7,
		"condition": { "name": "Protection", "effect": "malus_3_dmg", "pct": 40 },
		"element": "Spirit"
	},
	{
		"name": "Summon Spirit",
		"atkBase": 6,
		"dmgBase": 6,
		"condition": { "name": "Protection 2", "effect": "malus_6_dmg", "pct": 60 },
		"element": "Spirit"
	},
	{
		"name": "Mental Prison",
		"atkBase": 7,
		"dmgBase": 7,
		"condition": { "name": "Protection 3", "effect": "malus_4_def", "pct": 50 },
		"element": "Spirit"
	},
	{
		"name": "Cursed Whispers",
		"atkBase": 5,
		"dmgBase": 6,
		"condition": { "name": "Confuse", "effect": "skip", "pct": 50 },
		"element": "Spirit"
	},
	{
		"name": "Possession",
		"atkBase": 6,
		"dmgBase": 5,
		"condition": { "name": "Confuse", "effect": "skip", "pct": 50 },
		"element": "Spirit"
	},
	{
		"name": "Wail of spirits",
		"atkBase": 13,
		"dmgBase": 8,
		"condition": {},
		"element": "Spirit"
	},
	//UNDEAD
	{
		"name": "Whiter",
		"atkBase": 7,
		"dmgBase": 8,
		"condition": { "name": "Poison 1", "effect": "malus_3_def", "pct": 40 },
		"element": "Undead"
	},
	{
		"name": "Decay",
		"atkBase": 4,
		"dmgBase": 8,
		"condition": { "name": "Poison 2", "effect": "malus_6_def", "pct": 60 },
		"element": "Undead"
	},
	{
		"name": "Summon Undead",
		"atkBase": 6,
		"dmgBase": 8,
		"condition": { "name": "Slow", "effect": "malus_4_atk", "pct": 50 },
		"element": "Undead"
	},
	{
		"name": "Finger of Death",
		"atkBase": 4,
		"dmgBase": 7,
		"condition": { "name": "Fear 2", "effect": "skip", "pct": 50 },
		"element": "Undead"
	},
	{
		"name": "Danse Macabre",
		"atkBase": 7,
		"dmgBase": 4,
		"condition": { "name": "Fear 2", "effect": "skip", "pct": 50 },
		"element": "Undead"
	},
	{
		"name": "Circle of Death",
		"atkBase": 11,
		"dmgBase": 10,
		"condition": {},
		"element": "Undead"
	},
	//WATER
	{
		"name": "Water Barrier",
		"atkBase": 9,
		"dmgBase": 6,
		"condition": { "name": "Protection", "effect": "malus_3_dmg", "pct": 40 },
		"element": "Water"
	},
	{
		"name": "Watery Sphere",
		"atkBase": 6,
		"dmgBase": 6,
		"condition": { "name": "Protection 2", "effect": "malus_6_dmg", "pct": 60 },
		"element": "Water"
	},
	{
		"name": "Drown",
		"atkBase": 7,
		"dmgBase": 7,
		"condition": { "name": "Slow", "effect": "malus_4_atk", "pct": 50 },
		"element": "Water"
	},
	{
		"name": "Maelstrom",
		"atkBase": 6,
		"dmgBase": 5,
		"condition": { "name": "Freeze", "effect": "skip", "pct": 50 },
		"element": "Water"
	},
	{
		"name": "Flood",
		"atkBase": 5,
		"dmgBase": 6,
		"condition": { "name": "Paralyze 2", "effect": "skip", "pct": 50 },
		"element": "Water"
	},
	{
		"name": "Tsunami",
		"atkBase": 12,
		"dmgBase": 9,
		"condition": {},
		"element": "Water"
	},
	//PSYCHO
	{
		"name": "Madness",
		"atkBase": 7,
		"dmgBase": 8,
		"condition": { "name": "Exhaust", "effect": "malus_3_atk", "pct": 40 },
		"element": "Psycho"
	},
	{
		"name": "Maddening Darkness",
		"atkBase": 7,
		"dmgBase": 5,
		"condition": { "name": "Exhaust 2", "effect": "malus_6_atk", "pct": 60 },
		"element": "Psycho"
	},
	{
		"name": "Fear",
		"atkBase": 9,
		"dmgBase": 5,
		"condition": { "name": "Fear", "effect": "malus_4_def", "pct": 50 },
		"element": "Psycho"
	},
	{
		"name": "Command",
		"atkBase": 7,
		"dmgBase": 4,
		"condition": { "name": "Paralyze 2", "effect": "skip", "pct": 50 },
		"element": "Psycho"
	},
	{
		"name": "Deadly Illusion",
		"atkBase": 5,
		"dmgBase": 6,
		"condition": { "name": "Confuse", "effect": "skip", "pct": 50 },
		"element": "Psycho"
	},
	{
		"name": "Nightmare",
		"atkBase": 10,
		"dmgBase": 11,
		"condition": {},
		"element": "Psycho"
	}
]

export default allSpells
