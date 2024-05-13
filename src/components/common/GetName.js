const getName = (id) => {

    let type = "Wizard"
    if (parseInt(id) >= 1023 && parseInt(id) < 2048) {
        type = "Cleric"
    }
    else if (parseInt(id) >= 2048 && parseInt(id) < 3072) {
        type = 'Druid'
    }
    else if (parseInt(id) >= 3072 && parseInt(id) < 3075) {
        type = 'Elder Druid'
    }
    else if (parseInt(id) >= 3075 && parseInt(id) < 3078) {
        type = 'Elder Cleric'
    }
    else if (parseInt(id) >= 3078 && parseInt(id) < 3081) {
        type = 'Elder Wizard'
    }
    else if (parseInt(id) === 3082) {
        type = "Elder Wizard"
    }
    else if (parseInt(id) === 3083) {
        type = "Elder Cleric"
    }
    else if (parseInt(id) === 3083) {
        type = "Elder Druid"
    }

    return type
}

export default getName
