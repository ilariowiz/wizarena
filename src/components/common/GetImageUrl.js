const placeholder = require('../../assets/placeholder.png')

const getImageUrl = (id, reveal) => {

    //console.log(id, reveal);

    if (reveal === "0" || !id) {
        return placeholder //`https://storage.googleapis.com/wizarena/placeholder.png`
    }

    return `https://storage.googleapis.com/wizarena/placeholder.png`

    //return `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
}

export default getImageUrl
