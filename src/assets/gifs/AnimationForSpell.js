const avalanche = require('./spells/avalanche.gif')
const bones_of_the_earth = require('./spells/bones_of_the_earth.gif')
const dawn = require('./spells/dawn.gif')
const deadly_illusion = require('./spells/deadly_illusion.gif')
const dragon_breath = require('./spells/dragon_breath.gif')
const flood = require('./spells/flood.gif')
const mental_prison = require('./spells/mental_prison.gif')
const necrosis = require('./spells/necrosis.gif')
const shock = require('./spells/shock.gif')
const vortex = require('./spells/vortex.gif')

const getAnimationForSpell = (spell) => {

    if (spell === "Avalanche") {
        return avalanche
    }
    if (spell === "Deadly Illusion") {
        return deadly_illusion
    }
    if (spell === "Dragon's Breath") {
        return dragon_breath
    }
    if (spell === "Bones of the Earth") {
        return bones_of_the_earth
    }
    if (spell === "Dawn") {
        return dawn
    }
    if (spell === "Flood") {
        return flood
    }
    if (spell === "Mental Prison") {
        return mental_prison
    }
    if (spell === "Necrosis") {
        return necrosis
    }
    if (spell === "Shock") {
        return shock
    }
    if (spell === "Vortex") {
        return vortex
    }

    return undefined
}

export default getAnimationForSpell
