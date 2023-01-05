const convertMedalName = (abbr) => {

    let torneo = abbr.split("_")[0]
    let round = abbr.split("_")[1]

    //console.log(torneo, round);

    torneo = `tournament ${torneo.replace("t", "")}`
    round = `round ${round.replace("r","")}`

    //console.log(torneo, round);

    return { torneo, round }
}

export default convertMedalName
