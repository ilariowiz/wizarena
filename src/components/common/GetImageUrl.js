import {REVEAL_CAP} from '../../actions/types'
const placeholder = require('../../assets/placeholder.png')
const placeholder_cleric = require('../../assets/placeholder_cleric.png')

const getImageUrl = (id) => {

    //console.log(id);

    if (!id) {
        return placeholder
    }

    //i chierici avranno un altro placeholder
    if (parseInt(id) >= REVEAL_CAP) {
        return placeholder_cleric
    }

    return `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
}

export default getImageUrl
