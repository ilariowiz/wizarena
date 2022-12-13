const allSpells = [
	{
		name: "Acid Arrow",
		atkBase: 5,
		dmgBase: 4,
		condition: { name: 'Poison 1', effect: "malus_1_def", pct: 40 },
		element: 'Acid'
	},
	{
		name: "Cloudkill",
		atkBase: 2,
		dmgBase: 3,
		condition: { name: 'Poison 3', effect: "skip", pct: 40 },
		element: 'Acid'
	},
	{
		name: "Acid Beam",
		atkBase: 6,
		dmgBase: 6,
		condition: {},
		element: 'Acid'
	},
	{
		name: "Poison Barrage",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Poison 2', effect: "malus_2_def", pct: 50 },
		element: 'Acid'
	},
	////// FIRE
	{
		name: "Fireball",
		atkBase: 6,
		dmgBase: 6,
		condition: {},
		element: 'Fire'
	},
	{
		name: "Ignite",
		atkBase: 4,
		dmgBase: 4,
		condition: { name: 'Burn', effect: "malus_1_dmg", pct: 30 },
		element: 'Fire'
	},
	{
		name: "Hellfire Strike",
		atkBase: 5,
		dmgBase: 7,
		condition: {},
		element: 'Fire'
	},
	{
		name: "Fiery Smoke",
		atkBase: 3,
		dmgBase: 3,
		condition: { name: 'Confuse', effect: "skip", pct: 20 },
		element: 'Fire'
	},
	//////ICE
	{
		name: "Ice Spear",
		atkBase: 6,
		dmgBase: 6,
		condition: {},
		element: 'Ice'
	},
	{
		name: "Ice Storm",
		atkBase: 3,
		dmgBase: 2,
		condition: { name: 'Freeze', effect: "skip", pct: 30 },
		element: 'Ice'
	},
	{
		name: "Frost Missiles",
		atkBase: 5,
		dmgBase: 7,
		condition: {},
		element: 'Ice'
	},
	{
		name: "Frostbite",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Slow', effect: "malus_1_atk", pct: 40 },
		element: 'Ice'
	},
	/////// THUNDER
	{
		name: "Lightning",
		atkBase: 5,
		dmgBase: 6,
		condition: {},
		element: 'Thunder'
	},
	{
		name: "Thunder",
		atkBase: 3,
		dmgBase: 3,
		condition: { name: 'Paralyze', effect: "skip", pct: 35 },
		element: 'Thunder'
	},
	{
		name: "Storm",
		atkBase: 6,
		dmgBase: 5,
		condition: {},
		element: 'Thunder'
	},
	{
		name: "Thunder Spike",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Confuse', effect: "skip", pct: 20 },
		element: 'Thunder'
	},
	//////// DARK
	{
		name: "Hallucination",
		atkBase: 3,
		dmgBase: 3,
		condition: { name: 'Paralyze', effect: "skip", pct: 30 },
		element: 'Dark'
	},
	{
		name: "Bane",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Slow', effect: "malus_1_atk", pct: 35 },
		element: 'Dark'
	},
	{
		name: "Unholy Nova",
		atkBase: 6,
		dmgBase: 6,
		condition: {},
		element: 'Dark'
	},
	{
		name: "Vindicate",
		atkBase: 5,
		dmgBase: 7,
		condition: {},
		element: 'Dark'
	},
	/////// WIND
	{
		name: "Tornado",
		atkBase: 6,
		dmgBase: 6,
		condition: {},
		element: 'Wind'
	},
	{
		name: "Wave of Nature",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Confuse', effect: "skip", pct: 30 },
		element: 'Wind'
	},
	{
		name: "Wind Strike",
		atkBase: 5,
		dmgBase: 7,
		condition: {},
		element: 'Wind'
	},
	{
		name: "Wind Rupture",
		atkBase: 4,
		dmgBase: 4,
		condition: { name: 'Slow', effect: "malus_1_atk", pct: 35 },
		element: 'Wind'
	},
    {
		name: "Earth Tremor",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Slow 2', effect: "malus_3_atk", pct: 90 },
		element: 'Earth'
	},
	{
		name: "Earthquake",
		atkBase: 3,
		dmgBase: 4,
		condition: { name: 'Shock', effect: "skip", pct: 40 },
		element: 'Earth'
	},
	{
		name: "Flesh to Stone",
		atkBase: 5,
		dmgBase: 7,
		condition: {},
		element: 'Earth'
	},
	{
		name: "Erupting Earth",
		atkBase: 6,
		dmgBase: 6,
		condition: {},
		element: 'Earth'
	},
	////// SUN
	{
		name: "Sacred Flame",
		atkBase: 6,
		dmgBase: 6,
		condition: {},
		element: 'Sun'
	},
	{
		name: "Sunbeam",
		atkBase: 5,
		dmgBase: 7,
		condition: { name: 'Confuse', effect: "skip", pct: 20 },
		element: 'Sun'
	},
	{
		name: "Dawn",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Blind', effect: "skip", pct: 50 },
		element: 'Sun'
	},
	{
		name: "Solar Faith",
		atkBase: 3,
		dmgBase: 4,
		condition: { name: 'Exhaust', effect: "malus_4_atk", pct: 60 },
		element: 'Sun'
	},
	////// SPIRIT
	{
		name: "Cursed Whispers",
		atkBase: 3,
		dmgBase: 4,
		condition: { name: 'Fear', effect: "malus_4_atk", pct: 55 },
		element: 'Spirit'
	},
	{
		name: "Summon Spirit",
		atkBase: 7,
		dmgBase: 5,
		condition: {},
		element: 'Spirit'
	},
	{
		name: "Mental Prison",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Paralyze 2', effect: "skip", pct: 40 },
		element: 'Spirit'
	},
	{
		name: "Wail of spirits",
		atkBase: 6,
		dmgBase: 7,
		condition: {},
		element: 'Spirit'
	},
	/////// UNDEAD
	{
		name: "Summon Undead",
		atkBase: 6,
		dmgBase: 6,
		condition: {},
		element: 'Undead'
	},
	{
		name: "Whiter",
		atkBase: 3,
		dmgBase: 4,
		condition: { name: 'Poison 3', effect: "skip", pct: 40 },
		element: 'Undead'
	},
	{
		name: "Circle of Death",
		atkBase: 7,
		dmgBase: 5,
		condition: {},
		element: 'Undead'
	},
	{
		name: "Decay",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Exhaust', effect: "malus_4_atk", pct: 60 },
		element: 'Undead'
	},
	/////// WATER
	{
		name: "Tsunami",
		atkBase: 6,
		dmgBase: 6,
		condition: {},
		element: 'Water'
	},
	{
		name: "Drown",
		atkBase: 3,
		dmgBase: 4,
		condition: { name: 'Exhaust', effect: "malus_4_atk", pct: 60 },
		element: 'Water'
	},
	{
		name: "Maelstrom",
		atkBase: 7,
		dmgBase: 5,
		condition: {},
		element: 'Water'
	},
	{
		name: "Watery Sphere",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Paralyze 2', effect: "skip", pct: 40 },
		element: 'Water'
	},
	/////// Psycho
	{
		name: "Nightmare",
		atkBase: 6,
		dmgBase: 6,
		condition: {},
		element: 'Psycho'
	},
	{
		name: "Fear",
		atkBase: 3,
		dmgBase: 4,
		condition: { name: 'Fear', effect: "malus_4_atk", pct: 55 },
		element: 'Psycho'
	},
	{
		name: "Madness",
		atkBase: 7,
		dmgBase: 5,
		condition: {},
		element: 'Psycho'
	},
	{
		name: "Command",
		atkBase: 4,
		dmgBase: 3,
		condition: { name: 'Paralyze 2', effect: "skip", pct: 40 },
		element: 'Psycho'
	}
]

export default allSpells