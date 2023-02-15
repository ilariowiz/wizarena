const forgeLevel = (xp) => {

    let level = 1
    let xpNextLevel = 0

    if (xp < 2000) {
        level = 1
        xpNextLevel = 2000
    }
    else if (xp >= 2000 && xp < 5000) {
        level = 2
        xpNextLevel = 5000
    }
    else if (xp >= 5000 && xp < 10000) {
        level = 3
        xpNextLevel = 10000
    }
    else if (xp >= 10000 && xp < 20000) {
        level = 4
        xpNextLevel = 50000
    }
    else {
        level = 5
        xpNextLevel = 50000
    }

    return { level, xpNextLevel }
}

export default forgeLevel
