const getRingBonuses = (item) => {
    const bonusValues = item.bonus.split(",")

    let bonusesText = []
    let bonusesDict = {}

    bonusValues.map(i => {
        const b = i.split("_")
        const btext = `+${b[0]} ${b[1]}`

        bonusesDict[b[1]] = parseInt(b[0])
        bonusesText.push(btext)
    })

    return { bonusesText, bonusesDict }
}

export default getRingBonuses
