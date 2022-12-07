import {REVEAL_CAP} from '../../actions/types'
const placeholder = require('../../assets/placeholder.png')

const getImageUrl = (id) => {

    //console.log(id);

    if (parseInt(id) >= REVEAL_CAP || !id) {
        return placeholder //`https://storage.googleapis.com/wizarena/placeholder.png`
    }

    return `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
}

export default getImageUrl
