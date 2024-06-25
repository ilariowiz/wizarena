import _ from 'lodash'

const getLoadingFightText = () => {
    let texts = [
        "Doing the fight...",
        "Casting spells..."
    ]

    return _.sample(texts)
}

export default getLoadingFightText
