const getPendantBonus = (item) => {
    const bonusValues = item.bonus.split(",")

    let bonusesText = []
    let bonusesDict = {}

    bonusValues.map(i => {
        const b = i.split("_")
        let btext;
        if (b[1] === "res") {
            btext = `Perk resistance ${b[0]}`
            bonusesDict[b[0]] = b[1]
        }
        else {
            btext = `-${b[0]} damage from ${b[1]}`
            bonusesDict[b[1]] = parseInt(b[0])
        }

        bonusesText.push(btext)
    })

    return { bonusesText, bonusesDict }
}

export default getPendantBonus
