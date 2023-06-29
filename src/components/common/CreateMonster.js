import { sample } from 'lodash'
import allSpells from './Spells'

const elements = [
    "Acid", "Dark", "Earth", "Fire", "Ice", "Psycho", "Spirit", "Sun", "Thunder", "Undead", "Water", "Wind"
]

const createMonster = (key, level) => {

    let monsterLevel = 0

    const atkMod = 4.67
    const hpMod = 1
    const dmgMod = 2.67

    let hp, defense, attack, damage, speed;

    let spaceHp, spaceAtk, spaceDmg, spaceDef, spaceSpeed;

    if (key === "Berserker") {

        spaceHp = Math.floor(Math.random() * 6) + 17; //da 16 a 22
        spaceAtk = Math.floor(Math.random() * 5) + 41; //da 40 a 44
        spaceDmg = Math.floor(Math.random() * 5) + 29; //da 28 a 32
        spaceDef = Math.floor(Math.random() * 4) + 19; //da 18 a 21
        spaceSpeed = Math.floor(Math.random() * 3) + 4; //da 3 a 5
    }

    if (key === "Defensive") {

        spaceHp = Math.floor(Math.random() * 6) + 21; //da 20 a 27
        spaceAtk = Math.floor(Math.random() * 5) + 17; //da 15 a 19
        spaceDmg = Math.floor(Math.random() * 5) + 19; //da 18 a 22
        spaceDef = Math.floor(Math.random() * 6) + 48; //da 46 a 49
        spaceSpeed = Math.floor(Math.random() * 3) + 0; //da 1 a 3
    }

    if (key === "Average") {

        spaceHp = Math.floor(Math.random() * 6) + 20; //da 20 a 27
        spaceAtk = Math.floor(Math.random() * 5) + 29; //da 15 a 19
        spaceDmg = Math.floor(Math.random() * 5) + 24; //da 18 a 22
        spaceDef = Math.floor(Math.random() * 6) + 34; //da 46 a 49
        spaceSpeed = Math.floor(Math.random() * 3) + 2; //da 1 a 3
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

    console.log(monsterLevel, hp, attack, damage, defense, speed, element, resistance, weakness, spellSelected);

    return { name: `${key} Orc`, id: 'orc', level: Math.round(monsterLevel), hp, attack, damage, defense, speed, element, resistance, weakness, spellSelected }
}

export default createMonster
