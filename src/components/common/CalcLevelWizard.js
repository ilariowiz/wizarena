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
    const speed = item.speed.int || 0


    let hpLevel = hp * 1
    let defLevel = def * 4.67
    let atkLevel = atk * 4.67
    let dmgLevel = dmg * 2.67
    let speedLevel = speed * 2.67

    let level = hpLevel + defLevel + atkLevel + dmgLevel + speedLevel + 0.000001

    //console.log(defLevel, atkLevel, dmgLevel, speedLevel);

    //level = Math.round(level.toFixed(6))

    level = bankersRound(level)
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
    let speed = item.speed || 0

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
    else if (stat === "speed") {
        speed += 1
    }

    let hpLevel = hp * 1
    let defLevel = def * 4.67
    let atkLevel = atk * 4.67
    let dmgLevel = dmg * 2.67
    let speedLevel = speed * 2.67


    let level = hpLevel + defLevel + atkLevel + dmgLevel + speedLevel + 0.000001

    //console.log(level);
    //console.log(Math.round(level.toFixed(6)));

    level = bankersRound(level)

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
    let speed = item.speed || 0

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
    let speedLevel = speed * 2.67


    let level = hpLevel + defLevel + atkLevel + dmgLevel + speedLevel + 0.000001
    level = bankersRound(level)
    //console.log(level);

    return level
}

export const getColorTextBasedOnLevel = (level, isDarkmode) => {
    if (!level) {
        return "white"
    }

    let colorLow = "#5a5a5a"
    let colorHigh = "#840fb2"

    if (isDarkmode) {
        colorLow = "#fffaf1"
        colorHigh = "#faf000"
    }

    let rainbow = new Rainbow()
    rainbow.setSpectrum(colorLow, colorHigh)
    rainbow.setNumberRange(MIN_LEVEL, MAX_LEVEL)

    const color = rainbow.colourAt(level)

    //console.log(color);

    return `#${color}`
}

const bankersRound = (n, d=0) => {
    let x = n * Math.pow(10, d);
    let r = Math.round(x);
    let br = Math.abs(x) % 1 === 0.5 ? (r % 2 === 0 ? r : r-1) : r;
    return br / Math.pow(10, d);
}
