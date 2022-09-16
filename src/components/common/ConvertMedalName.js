const convertMedalName = (abbr) => {

    let torneo = abbr.split("_")[0]
    let round = abbr.split("_")[1]

    torneo = `tournament ${torneo.split("")[1]}`
    round = `round ${round.split("")[1]}`

    return { torneo, round }
}

export default convertMedalName
