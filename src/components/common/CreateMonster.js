import { sample } from 'lodash'
import allSpells from './Spells'

const orc_berserker = require('../../assets/monsters/orc_1.png')
const orc_defensive = require('../../assets/monsters/orc_defensive.png')
const orc_average = require('../../assets/monsters/orc_average.png')

const elements = [
    "Acid", "Dark", "Earth", "Fire", "Ice", "Psycho", "Spirit", "Sun", "Thunder", "Undead", "Water", "Wind"
]

const createMonster = (key, level) => {

    let monsterImage;
    let monsterLevel = 0

    const atkMod = 4.67
    const hpMod = 1
    const dmgMod = 2.67

    let hp, defense, attack, damage, speed;

    let spaceHp, spaceAtk, spaceDmg, spaceDef, spaceSpeed;

    if (key === "Berserker") {

        spaceHp = Math.floor(Math.random() * 6) + 18;
        spaceAtk = Math.floor(Math.random() * 5) + 43;
        spaceDmg = Math.floor(Math.random() * 6) + 29; //da 28 a 32
        spaceDef = Math.floor(Math.random() * 4) + 17;
        spaceSpeed = Math.floor(Math.random() * 4) + 5;

        monsterImage = orc_berserker
    }

    if (key === "Defensive") {

        spaceHp = Math.floor(Math.random() * 6) + 16; //da 15 a 24
        spaceAtk = Math.floor(Math.random() * 5) + 17; //da 15 a 19
        spaceDmg = Math.floor(Math.random() * 6) + 19; //da 18 a 22
        spaceDef = Math.floor(Math.random() * 7) + 57; //da 55 a 62
        spaceSpeed = Math.floor(Math.random() * 2) + 0; //da 1 a 2

        monsterImage = orc_defensive
    }

    if (key === "Average") {

        spaceHp = Math.floor(Math.random() * 6) + 20; //da 20 a 27
        spaceAtk = Math.floor(Math.random() * 5) + 29; //da 15 a 19
        spaceDmg = Math.floor(Math.random() * 6) + 24; //da 18 a 22
        spaceDef = Math.floor(Math.random() * 6) + 34; //da 46 a 49
        spaceSpeed = Math.floor(Math.random() * 4) + 2; //da 1 a 3

        monsterImage = orc_average
    }

    hp = Math.floor(level * spaceHp / 100)
    monsterLevel += hp

    attack = Math.floor(level * spaceAtk / 100 / atkMod)
    monsterLevel += Math.round(attack*atkMod)

    damage = Math.floor(level * spaceDmg / 100 / dmgMod)
    monsterLevel += Math.round(damage*dmgMod)

    defense = Math.floor(level * spaceDef / 100 / atkMod)
    monsterLevel += Math.round(defense*atkMod)

    speed = Math.floor(level * spaceSpeed / 100 / dmgMod)
    monsterLevel += Math.round(speed*dmgMod)

    const element = sample(elements)
    const resistance = sample(elements)
    const weakness = sample(elements.filter(i => i !== resistance))

    const spells = allSpells.filter(i => i.element === element)

    const spellSelected = sample(spells)

    attack -= spellSelected.atkBase
    damage -= spellSelected.dmgBase

    monsterLevel -= spellSelected.atkBase * atkMod
    monsterLevel -= spellSelected.dmgBase * dmgMod

    //console.log(monsterLevel, hp, attack, damage, defense, speed, element, resistance, weakness, spellSelected);

    return { name: `${key} Orc`, id: 'orc', image: monsterImage, level: Math.round(monsterLevel), hp, attack, damage, defense, speed, element, resistance, weakness, spellSelected, "upgrades-spell": {"attack": {int: 0}, "damage": {int: 0}} }
}

export default createMonster
