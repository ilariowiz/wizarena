const calcMedals = (item, tournamentSeason) => {

    let totalMedals = 0

    if (tournamentSeason) {
        let tournaments = []

        if (tournamentSeason === "s2") {
            tournaments = ["t9", "t10", "t11", "t12", "t13", "t14", "t15", "t16", "t17"]
        }

        if (tournamentSeason === "s3") {
            tournaments = ["t25", "t26", "t27", "t28", "t29", "t30", "t31", "t32", "t33", "t34", "t35", "t36"]
        }

        if (tournamentSeason === "s4") {
            tournaments = ["t1022", "t1023", "t1024", "t1025", "t1026"]
        }

        if (tournamentSeason === "s5") {
            tournaments = ["t3015", "t3016", "t3017", "t3018", "t3019", "t3020", "t3021", "t3022"]
        }

        if (tournamentSeason === "s6") {
            tournaments = ["t57", "t58", "t59", "t60", "t61", "t62", "t63", "t64", "t65", "t66", "t67", "t68"]
        }

        for (const [key, value] of Object.entries(item.medals)) {
            if (tournaments.includes(key)) {
                totalMedals += parseInt(value)
            }
        }
    }
    else {
        if (Object.keys(item.medals).length > 0) {
            const arrayValueMedals = Object.values(item.medals)
            arrayValueMedals.map(i => totalMedals = totalMedals + parseInt(i))
        }
    }

    return totalMedals
}

export default calcMedals
