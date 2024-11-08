const calcMedals = (item, tournamentSeason, showLeague) => {

    if (!item.medals) {
        return 0
    }

    let totalMedals = 0

    if (tournamentSeason && showLeague) {
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

        if (tournamentSeason === "s8") {
            tournaments = ["t74", "t75", "t76", "t77", "t78", "t79", "t80", "t81", "t82", "t83", "t84", "t85"]
        }

        if (tournamentSeason === "s9") {
            tournaments = ["t1056", "t1057", "t1058", "t1059", "t1060", "t1061", "t1062", "t1063", "t1064", "t1065", "t1066", "t1067"]
        }

        if (tournamentSeason === "s10") {
            tournaments = ["t1073", "t1074", "t1075", "t1076", "t1077", "t1078", "t1079", "t1080", "t1081", "t1082", "t1083", "t1084"]
        }

        if (tournamentSeason === "s11") {
            tournaments = ["t107", "t108", "t109", "t110", "t111", "t112", "t113", "t114", "t115", "t116", "t117", "t118"]
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
