const aura_acid = require('./aura_acid.gif')
const aura_dark = require('./aura_dark.gif')
const aura_earth = require('./aura_earth.gif')
const aura_fire = require('./aura_fire.gif')
const aura_ice = require('./aura_ice.gif')
const aura_psycho = require('./aura_psycho.gif')
const aura_spirit = require('./aura_spirit.gif')
const aura_sun = require('./aura_sun.gif')
const aura_thunder = require('./aura_thunder.gif')
const aura_undead = require('./aura_undead.gif')
const aura_water = require('./aura_water.gif')
const aura_wind = require('./aura_wind.gif')

const getAuraForElement = (element) => {

    if (element === "Acid") {
        return aura_acid
    }
    if (element === "Dark") {
        return aura_dark
    }
    if (element === "Earth") {
        return aura_earth
    }
    if (element === "Fire") {
        return aura_fire
    }
    if (element === "Ice") {
        return aura_ice
    }
    if (element === "Psycho") {
        return aura_psycho
    }
    if (element === "Spirit") {
        return aura_spirit
    }
    if (element === "Sun") {
        return aura_sun
    }
    if (element === "Thunder") {
        return aura_thunder
    }
    if (element === "Undead") {
        return aura_undead
    }
    if (element === "Water") {
        return aura_water
    }
    if (element === "Wind") {
        return aura_wind
    }

    return undefined
}

export default getAuraForElement
