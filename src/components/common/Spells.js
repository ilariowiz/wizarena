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
]

export default allSpells
