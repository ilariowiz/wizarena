import {REVEAL_CAP} from '../../actions/types'
const placeholder = require('../../assets/placeholder.png')
const placeholder_druid = require('../../assets/placeholder_druid.png')

const getImageUrl = (id) => {

    //console.log(id);

    if (!id) {
        return placeholder
    }

    //i chierici avranno un altro placeholder
    if (parseInt(id) >= REVEAL_CAP) {
        return placeholder_druid
    }

    return `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
}

export default getImageUrl
