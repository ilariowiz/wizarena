const calcMedals = (item) => {

    let season = ["s1", "s2", "s3"]

    let medalsCount = {}

    season.map(i => {
        let tournaments = []

        if (i === "s1") {
            tournaments = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"]
        }
        if (i === "s2") {
            tournaments = ["t9", "t10", "t11", "t12", "t13", "t14", "t15", "t16", "t17"]
        }

        if (i === "s3") {
            tournaments = ["t1001", "t1002", "t1003", "t1004"]
        }

        let totalMedals = 0

        for (const [key, value] of Object.entries(item.medals)) {
            if (tournaments.includes(key)) {
                totalMedals += parseInt(value)
            }
        }

        medalsCount[i] = totalMedals
    })

    //console.log(medalsCount);

    //if (Object.keys(item.medals).length > 0) {
        //const arrayValueMedals = Object.values(item.medals)
        //arrayValueMedals.map(i => totalMedals = totalMedals + parseInt(i))
    //}

    return medalsCount
}

export default calcMedals
