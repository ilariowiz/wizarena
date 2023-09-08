//myGameResult: 1 win, 0 lose
const getRatingDelta = (myRating, opponentRating, myGameResult) => {
    let myChanceToWin = 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400))

    return Math.round(32 * (myGameResult - myChanceToWin))
}

const getNewRating = (myRating, opponentRating, myGameResult) => {
    return myRating + getRatingDelta(myRating, opponentRating, myGameResult)
}

export default getNewRating
