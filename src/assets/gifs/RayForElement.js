const white_beam_rx_to_lx = require('./spells/beam/white_beam_rx_to_lx.gif')
const white_beam_lx_to_rx = require('./spells/beam/white_beam_lx_to_rx.gif')

const green_beam_rx_to_lx = require('./spells/beam/green_beam_rx_to_lx.gif')
const green_beam_lx_to_rx = require('./spells/beam/green_beam_lx_to_rx.gif')

const red_beam_rx_to_lx = require('./spells/beam/red_beam_rx_to_lx.gif')
const red_beam_lx_to_rx = require('./spells/beam/red_beam_lx_to_rx.gif')


const getRayForElement = (element, isLeftToRight) => {

    if (element === "fire" || element === "earth" || element === "sun") {
        return isLeftToRight ? red_beam_lx_to_rx : red_beam_rx_to_lx
    }

    if (element === "acid" || element === "dark" || element === "undead") {
        return isLeftToRight ? green_beam_lx_to_rx : green_beam_rx_to_lx
    }

    return isLeftToRight ? white_beam_lx_to_rx : white_beam_rx_to_lx
}

export default getRayForElement
