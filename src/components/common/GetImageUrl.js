const getImageUrl = (id, reveal) => {

    if (reveal === "0" || !id) {
        return `https://storage.googleapis.com/wizarena/placeholder.png`
    }

    //return `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
}

export default getImageUrl
