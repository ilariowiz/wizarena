import Rainbow from 'rainbowvis.js'
import { MIN_LEVEL, MAX_LEVEL } from '../../actions/types'

export const calcLevelWizard = (item) => {

    if (!item || !item.hp) {
        return ""
    }
    //console.log(item);

    const hp = item.hp.int
    const def = item.defense.int
    const atk = item.attack.int
    const dmg = item.damage.int
    const speed = item.speed.int


    let hpLevel = hp * 1
    let defLevel = def * 4.67
    let atkLevel = atk * 4.67
    let dmgLevel = dmg * 2.67
    let speedLevel = speed * 2.67

    const level = Math.round(hpLevel + defLevel + atkLevel + dmgLevel + speedLevel)

    //console.log(level);
    return level
}


export const calcLevelWizardAfterUpgrade = (item, stat) => {

    if (!item || !item.hp) {
        return 0
    }

    let hp = item.hp
    let def = item.defense
    let atk = item.attack
    let dmg = item.damage

    if (stat === "hp") {
        hp += 1
    }
    else if (stat === "defense") {
        def += 1
    }
    else if (stat === "attack") {
        atk += 1
    }
    else if (stat === "damage") {
        dmg += 1
    }

    let hpLevel = hp * 1
    let defLevel = def * 4.67
    let atkLevel = atk * 4.67
    let dmgLevel = dmg * 2.67


    const level = Math.round(hpLevel + defLevel + atkLevel + dmgLevel)

    //console.log(level);
    return level
}

export const calcLevelWizardAfterDowngrade = (item, stat) => {

    if (!item || !item.hp) {
        return 0
    }

    let hp = item.hp
    let def = item.defense
    let atk = item.attack
    let dmg = item.damage
    let speed = item.speed

    if (stat === "hp") {
        hp -= 1
    }
    else if (stat === "defense") {
        def -= 1
    }
    else if (stat === "attack") {
        atk -= 1
    }
    else if (stat === "damage") {
        dmg -= 1
    }
    else if (stat === "speed") {
        speed -= 1
    }

    let hpLevel = hp * 1
    let defLevel = def * 4.67
    let atkLevel = atk * 4.67
    let dmgLevel = dmg * 2.67


    const level = Math.round(hpLevel + defLevel + atkLevel + dmgLevel)

    //console.log(level);
    return level
}

export const getColorTextBasedOnLevel = (level) => {
    if (!level) {
        return "white"
    }

    let rainbow = new Rainbow()
    rainbow.setSpectrum("#fffaf1", "#faf000")
    rainbow.setNumberRange(MIN_LEVEL, MAX_LEVEL)

    const color = rainbow.colourAt(level)

    //console.log(color);

    return `#${color}`
}
