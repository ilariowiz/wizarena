const calcHitFight = (attacco, difesa, missTimes) => {

    //console.log(attacco, difesa, missTimes);

    const baseAtk = 45

    const diff = Math.floor(baseAtk * (attacco / difesa))

    let finalPct = diff + missTimes

    if (finalPct < 2) {
        finalPct = 2
    }

    //console.log("finalPct", finalPct);

    let tiro = Math.floor(Math.random() * 100) + 1; //da 1 a 100
    //console.log("tiro", tiro);

    if (tiro <= finalPct) {
        return true
    }

    return false
}

export default calcHitFight
