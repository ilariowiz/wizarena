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
const abyss = require('./spells/abyss.gif')
const acid_beam = require('./spells/acid_beam.gif')
const finger_death = require('./spells/finger_of_death.gif')
const hellish_flame = require('./spells/hellish_flame.gif')
const possession = require('./spells/possession.gif')
const tornado = require('./spells/tornado.gif')
const wither = require('./spells/wither.gif')


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
    if (spell === "Abyss") {
        return abyss
    }
    if (spell === "Acid Beam") {
        return acid_beam
    }
    if (spell === "Finger of Death") {
        return finger_death
    }
    if (spell === "Hellish Flame") {
        return hellish_flame
    }
    if (spell === "Possession") {
        return possession
    }
    if (spell === "Tornado") {
        return tornado
    }
    if (spell === "Wither") {
        return wither
    }

    return undefined
}

export default getAnimationForSpell
