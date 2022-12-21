import _ from 'lodash'
const calcUpgradeCost = (statToUpgrade, key) => {

    if (!statToUpgrade) {
        return 0
    }

    const HP_BASE_WIZA = 150
    const DEFENSE_BASE_WIZA = 700
    const ATTACK_BASE_WIZA = 700
    const DAMAGE_BASE_WIZA = 400

    const MAX_HP_VALUE = 61
    const MAX_DEFENSE_VALUE = 19
    const MAX_ATTACK_VALUE = 9
    const MAX_DAMAGE_VALUE = 7
    //ignoriamo attacco e danno della spell, perché si potrebbe cheatare cambiando con una spell con poco atk e poco dmg

    //console.log("stat to upgrade -", key, statToUpgrade);

    let MAX_SELECTED;
    let BASE_WIZA_SELECTED;
    if (key === 'hp') {
        MAX_SELECTED = MAX_HP_VALUE
        BASE_WIZA_SELECTED = HP_BASE_WIZA
    }
    else if (key === 'defense') {
        MAX_SELECTED = MAX_DEFENSE_VALUE
        BASE_WIZA_SELECTED = DEFENSE_BASE_WIZA
    }
    else if (key === 'attack') {
        MAX_SELECTED = MAX_ATTACK_VALUE
        BASE_WIZA_SELECTED = ATTACK_BASE_WIZA
    }
    else if (key === 'damage') {
        MAX_SELECTED = MAX_DAMAGE_VALUE
        BASE_WIZA_SELECTED = DAMAGE_BASE_WIZA
    }

    let diffFromMax = MAX_SELECTED - statToUpgrade
    //console.log("diff From Max", diffFromMax);
    if (diffFromMax === MAX_SELECTED) {
        diffFromMax = MAX_SELECTED - 1
    }

    //const wizaCost = (BASE_WIZA_SELECTED - (BASE_WIZA_SELECTED * diffFromMax / 100))
    const wizaCost = (BASE_WIZA_SELECTED - ((100 * diffFromMax / MAX_SELECTED) * BASE_WIZA_SELECTED / 100))
    //console.log("wiza cost", Math.ceil(wizaCost));
    //console.log(wizaCost);

    return _.round(wizaCost, 2)
}

export default calcUpgradeCost
